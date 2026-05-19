from flask import make_response, jsonify, request as flask_request
from flask_restx import Namespace, Resource, fields
from flask_jwt_extended import get_jwt_identity, jwt_required, get_jwt, set_access_cookies, set_refresh_cookies, unset_jwt_cookies, decode_token
from app.services import facade
from app.security.jwt import generete_token, generete_refresh_token
from app.models.blocklist_token import TokenBlocklist
from app.services.mail_service import MailService
from app import limiter
from flask import current_app

api = Namespace('auth', description="User authentication operation")

login_model = api.model('Login', {
    'email': fields.String(required=True, description='User email', example="user@email.com"),
    'password': fields.String(required=True, description='User password', example="Johnd0e!")
})

organization_request_model = api.model('organizationRequest', {
    'org_name' : fields.String(required=True, description='organization name', example=""),
    'structure_type': fields.String(required=True, description='structure type ', example=""),
    'description': fields.String(description='organization description', example=""),
    'first_name': fields.String(required=True, description='first name of admin', example="john"),
    'last_name': fields.String(required=True, description='last name of admin', example="constante"),
    'contact_email': fields.String(required=True, description='admin email', example="user@email.com")
})

validation_model = api.model('organizationvalidate', {
    'password' : fields.String(required=True, description='password', example=""),
    'confirm': fields.String(required=True, description='second password', example=""),
})

#---LOGIN ENDPOINT---------------------------------------------------------------------------------------------
@api.route('/login')
class Login(Resource):
    @limiter.limit("10 par minute")
    @api.expect(login_model)
    def post(self):
        """Authenticate user and set HTTP-only JWT cookie"""

        credentials = api.payload
        email = credentials.get('email')
        password = credentials.get('password')

        if not email or not password:
            return {'error': 'Email et mot de passe requis.'}, 400

        user = facade.get_user_by_email(email)
        if not user or not user.verify_password(password):
            return {'error': 'Identifiants incorrects.'}, 401

        if user.status != 'active':
            return {'error': 'Compte inactif.'}, 403

        access_token = generete_token(user)
        refresh_token = generete_refresh_token(user)
        response = make_response(jsonify({'user': user.to_dict()}), 200)
        set_access_cookies(response, access_token)
        set_refresh_cookies(response, refresh_token)
        return response

#---LOGOUT ENDPOINT---------------------------------------------------------------------------------------------    
@api.route('/logout')
class Logout(Resource):
    def post(self):
        """ Logout a user, clear jwt and refresh_token """
        refresh_cookies = flask_request.cookies.get('refresh_token_cookie')
        if refresh_cookies:
            try:
                decoded = decode_token(refresh_cookies)
                jti = decoded.get('jti')
                if jti:
                    TokenBlocklist.block(jti)
            except Exception:
                pass
        response = make_response(jsonify({"message": "Déconnecté"}), 200)
        unset_jwt_cookies(response)
        return response

#---ME ENDPOINT------------------------------------------------------------------------------------------------------
@api.route('/me')
class ME(Resource):
    @jwt_required()
    def get(self):
        """ Return the current authenticated user """
        user_id = get_jwt_identity()
        user = facade.get_user(user_id)
        if not user:
            return {'error': 'User not found.'}, 404
        return user.to_dict(), 200
    
#---TOKEN REFRESH ENDPOINT--------------------------------------------------------------------------------------------- 
@api.route("/token/refresh")
class TokenRefresh(Resource):
    @jwt_required(refresh=True)
    def post(self):
        user_id = get_jwt_identity()
        old_jti = get_jwt().get('jti')

        user = facade.get_user(user_id)
        if not user or user.status != 'active':
            return {'error': 'Session invalid'}, 401
        
        if old_jti:
            TokenBlocklist.block(old_jti)

        access_token = generete_token(user)
        refresh_token = generete_refresh_token(user)
        response = make_response(jsonify({'user': user.to_dict()}), 200)
        set_access_cookies(response, access_token)
        set_refresh_cookies(response, refresh_token)
        return response

#---ORGANISATION REQUEST ENDPOINT---------------------------------------------------------------------------------------------   
@api.route('/organization-requests')
class made_organization_request(Resource):
    @jwt_required()
    def get(self):
        """ can see list of all request"""
        user_id = get_jwt_identity()
        claims = get_jwt()

        if not user_id:
            api.abort(404, "User not found")

        if claims.get("is_admin") is not True:
            api.abort(403, "Forbidden action")

        request_list = facade.list_request_org()
        return [request.to_dict() for request in request_list], 200

    @api.expect(organization_request_model)
    def post(self):
        """ made a request for create the organization """

        request = api.payload
        print(f"{request}")
        valid_inputs = ['org_name', 'structure_type', 'description', 'first_name', 'last_name', 'contact_email', '_hp', '_t']
        for key in request:
            if key not in valid_inputs:
                api.abort(400, f'Invalid input data: {key}')

        # Honeypot check - hidden field should be empty
        if request.get('_hp'):
            api.abort(400, "Invalid request")

        # Timing check - prevent too fast submissions (convert JS timestamp to datetime)
        import time
        current_time = int(time.time() * 1000)  # Current time in milliseconds
        if current_time - request.get('_t', 0) < 5000:  # Require at least 5 seconds
            api.abort(400, "too fast! wait 5 seconds")

        # Remove validation fields before creating the request
        request_data = {k: v for k, v in request.items() if k not in ['_hp', '_t']}
        new_request = facade.made_request_org(request_data)

        app_url = current_app.config.get("APP_URL")

        setPassword =  f"{app_url}/set-password/{new_request.verification_token}"

        MailService.send_email(
            to=new_request.contact_email,
            first_name=new_request.first_name,
            last_name=new_request.last_name,
            org_name=new_request.org_name,
            setPasswordUrl=setPassword
        )

        return new_request.token(), 200

#---ORGANISATION REQUEST INFO ENDPOINT---------------------------------------------------------------------------------------------     
@api.route('/organization-requests/info/<token_id>')
class get_orgnaisation_request_by_token(Resource):
    def get(self, token_id):
        """ get a organization request with token"""
        request = facade.get_request_by_token_org(token_id)
        print(f"{token_id} {request}")
        if not request:
            api.abort(404, "request not found")
        return request.to_dict(), 200

#---ORGANISATION REQUEST VALIDATION ENDPOINT---------------------------------------------------------------------------------------------   
@api.route('/organization-requests/complete/<token_id>')
class new_organization(Resource):
    @api.expect(validation_model)
    def post(self, token_id):
        """ validate the creation with password and set auth cookie """

        validate = api.payload or {}
        valid_inputs = ['password', 'confirm']
        missing = [key for key in valid_inputs if key not in validate]
        extra = [key for key in validate if key not in valid_inputs]
        if missing or extra:
            errors = []
            if missing:
                errors.append(f"Missing input data: {', '.join(missing)}")
            if extra:
                errors.append(f"Invalid input data: {', '.join(extra)}")
            api.abort(400, '; '.join(errors))

        if validate['password'] != validate['confirm']:
            return {'error': 'Passwords do not match'}, 400

        result = facade.complete_request_org(token_id, validate['password'])
        if not result:
            return {'error': 'Invalid or expired token / request already processed'}, 400

        access_token = result.pop('token', None)
        response = make_response(jsonify(result), 201)
        if access_token:
            set_access_cookies(response, access_token)
            user = facade.get_user(result['user']['id'])
            if user:
                set_refresh_cookies(response, generete_refresh_token(user))
        return response

#---USER REQUEST INFO ENDPOINT--------------------------------------------------------------------------------------------- 
@api.route("/user-requests/info/<token_id>")
class list_resquest(Resource):
    def get(self, token_id):
        """ get a request user with this token """
        request = facade.get_request_user_by_token(token_id)
        if not request:
            api.abort(404, "Request not found")
        return request.to_dict()

#---USER REQUEST VALIDATION ENDPOINT--------------------------------------------------------------------------------------------- 
@api.route("/user-requests/complete/<token_id>")
@api.expect(validation_model)
class new_user(Resource):
    def post(self, token_id):
        """ validate the creation with password and set auth cookie """

        validate = api.payload or {}
        valid_inputs = ['password', 'confirm']
        missing = [key for key in valid_inputs if key not in validate]
        extra = [key for key in validate if key not in valid_inputs]
        if missing or extra:
            errors = []
            if missing:
                errors.append(f"Missing input data: {', '.join(missing)}")
            if extra:
                errors.append(f"Invalid input data: {', '.join(extra)}")
            api.abort(400, '; '.join(errors))

        if validate['password'] != validate['confirm']:
            return {'error': 'Passwords do not match'}, 400

        result = facade.complete_request_user(token_id, validate['password'])
        if not result:
            return {'error': 'Invalid or expired token / request already processed'}, 400

        access_token = result.pop('token', None)
        response = make_response(jsonify(result), 201)
        if access_token:
            set_access_cookies(response, access_token)
            user = facade.get_user(result['user']['id'])
            if user:
                set_refresh_cookies(response, generete_refresh_token(user))
        return response
