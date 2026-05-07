from flask_restx import Namespace, Resource, fields
from flask_jwt_extended import get_jwt_identity, jwt_required, get_jwt
from app.services import facade
from app.security.jwt import generete_token
from app.services.mail_service import MailService
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
    'contact_email': fields.String(required=True, description='admin email', example="user@email.com"),
})

validation_model = api.model('organizationvalidate', {
    'password' : fields.String(required=True, description='password', example=""),
    'validate_password': fields.String(required=True, description='second password', example=""),
})


@api.route('/login')
class Login(Resource):
    @api.expect(login_model)
    def post(self):
        """Authenticate user and return a JWT token"""

        credentials = api.payload
        user = facade.get_user_by_email(credentials['email'])
        if not user or not user.verify_password(credentials['password']):
            return {'error': 'Invalid credentials'}, 401

        access_token = generete_token(user)
        return {'access_token': access_token}, 200

    @api.route('/protected')
    class ProtectedResource(Resource):
        @jwt_required()
        @api.doc(security='token')
        def get(self):
            """A protected endpoint that requires a valid JWT token"""

            user_id = get_jwt_identity();
            data = get_jwt()

            return {'message': f'Hello, user {user_id}, your organisation {data['organization_id']}'}, 200


@api.route('/organization-requests')
class made_organization_request(Resource):
    @jwt_required()
    @api.doc(security="token")
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
        valid_inputs = ['org_name', 'structure_type', 'description', 'first_name', 'last_name', 'contact_email']
        for key in request:
            if key not in valid_inputs:
                api.abort(400, f'Invalid input data: {key}')

        new_request = facade.made_request_org(request)

        app_url = current_app.config["APP_URL"]

        setPassword =  f"{app_url}/set-password/{new_request.verification_token}"

        MailService.send_email(
            to=new_request.contact_email,
            first_name=new_request.first_name,
            last_name=new_request.last_name,
            org_name=new_request.org_name,
            setPasswordUrl=setPassword
        )

        return new_request.token(), 200
    
@api.route('/api/organization-requests/info/<token_id>')
class get_orgnaisation_request_by_token(Resource):
    def get(self, token_id):
        """ get a organization request with token"""
        request = facade.get_request_by_token_org(token_id)
        print(f"{token_id} {request}")
        if not request:
            api.abort(404, "request not found")
        return request.to_dict(), 200
    
@api.route('/organization-requests/complete/<token_id>')
class new_organization(Resource):
    @api.expect(validation_model)
    def post(self, token_id):
        """ validate the creation with password """

        validate = api.payload or {}
        valid_inputs = ['password', 'validate_password']
        missing = [key for key in valid_inputs if key not in validate]
        extra = [key for key in validate if key not in valid_inputs]
        if missing or extra:
            errors = []
            if missing:
                errors.append(f"Missing input data: {', '.join(missing)}")
            if extra:
                errors.append(f"Invalid input data: {', '.join(extra)}")
            api.abort(400, '; '.join(errors))

        if validate['password'] != validate['validate_password']:
            return {'error': 'Passwords do not match'}, 400

        result = facade.complete_request_org(token_id, validate['password'])
        if not result:
            return {'error': 'Invalid or expired token / request already processed'}, 400

        return result, 201

@api.route("/user-requests/info/<token_id>")
class list_resquest(Resource):
    def get(self, token_id):
        """ get a request user with this token """
        request = facade.get_request_user_by_token(token_id)
        if not request:
            api.abort(404, "Request not found")
        return request.to_dict()

@api.route("/user-requests/complete/<token_id>")
@api.expect(validation_model)
class new_user(Resource):
    def post(self, token_id):
        """ validate the creation with password """

        validate = api.payload or {}
        valid_inputs = ['password', 'validate_password']
        missing = [key for key in valid_inputs if key not in validate]
        extra = [key for key in validate if key not in valid_inputs]
        if missing or extra:
            errors = []
            if missing:
                errors.append(f"Missing input data: {', '.join(missing)}")
            if extra:
                errors.append(f"Invalid input data: {', '.join(extra)}")
            api.abort(400, '; '.join(errors))

        if validate['password'] != validate['validate_password']:
            return {'error': 'Passwords do not match'}, 400

        result = facade.complete_request_user(token_id, validate['password'])
        if not result:
            return {'error': 'Invalid or expired token / request already processed'}, 400

        return result, 201