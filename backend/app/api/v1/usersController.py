from flask_restx import Namespace, Resource, fields
from app.models.userRequest import UserRequest
from app.services.mail_service import MailService
from flask_jwt_extended import get_jwt_identity, jwt_required, get_jwt
from app.services import facade
from flask import current_app

api = Namespace('users', description="User operations")

user_request = api.model("user request", {
    'first_name': fields.String(required=True, description="User first name", example="user"),
    'last_name': fields.String(required=True, description="User last name", example="test"),
    'email': fields.String(required=True, description="User email", example="user@email.com"),
    'job': fields.String(required=True, description="user job", exemple="Educateur")
})

user_update = api.model("user update", {
    'first_name': fields.String(required=True, description="User first name", example="user"),
    'last_name': fields.String(required=True, description="User last name", example="test"),
    'email': fields.String(required=True, description="User email", example="user@email.com"),
    'password': fields.String(required=True, description="User password", example="Johnd0e!"),
})

@api.route('/')
class UserList(Resource):
    @jwt_required()
    @api.doc(security="token")
    @api.response(400, 'Invalid input data')
    @api.response(403, 'Forbidden action')
    @api.response(404, 'admin not found')
    @api.response(200, 'List of users retrieved successfully')
    def get(self):
        """Get a list of users in the same organization"""

        claims = get_jwt()
        organisation_id = claims.get('organization_id')
        if not organisation_id:
            api.abort(400, "Organization ID missing from token")

        all_users = facade.get_all_users(organisation_id)
        return [user.to_dict() for user in all_users], 200
    
    @api.expect(user_request)
    @jwt_required()
    @api.doc(security="token")
    @api.response(201, "the request has successfully create")
    @api.response(400, 'Invalid input data')
    @api.response(403, 'Forbidden action')
    @api.response(404, 'admin not found')
    def post(self):
        data = get_jwt()
        if (data['is_admin'] is False):
            api.abort(403, "action Forbidden")

        request_payload = api.payload
        valid_inputs = ['first_name', 'last_name', 'email', 'job']
        for key in request_payload:
            if key not in valid_inputs:
                api.abort(400, f'Invalid input data: {key}')

        request = UserRequest(
            first_name=request_payload['first_name'],
            last_name=request_payload['last_name'],
            email=request_payload['email'],
            job=request_payload['job'],
            organization_id=data["organization_id"],
            role="agent"
        )
        
        new_request = facade.made_request_user(request)

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


@api.route('/<user_id>')
class UserResource(Resource):
    @api.response(200, 'user is successfully retrieved')
    @api.response(404, 'the user does not exist')

    def get(self, user_id):
        """get user by his id"""

        user = facade.get_user(user_id)
        if not user:
            return {'error': 'the user does not exist'}, 404
        return user.to_dict(), 200

    @api.expect(user_update)
    @jwt_required()
    @api.response(201, 'User successfully updated')
    @api.response(400, 'Invalid input data')
    @api.response(403, 'Forbidden action')
    @api.doc(security="token")
    @api.response(404, 'User not found')

    def put(self, user_id):
        """Update user details by ID"""

        current_user = get_jwt_identity()
        user = facade.get_user(current_user)

        if not user:
            api.abort(404, "User not found")

        if user_id != user.id:
            api.abort(403, "Unauthorized action")
        
        user_data = api.payload

        valid_inputs = ["first_name", "last_name", "email", "password"]
        for key in user_data:
            if key not in valid_inputs:
                api.abort(400, f'Invalid input data: {key}')

        try:
            updated_user = facade.update_user(user_id, user_data)

        except (ValueError, TypeError) as e:
            api.abort(400, str(e))

        return updated_user.to_dict(), 201