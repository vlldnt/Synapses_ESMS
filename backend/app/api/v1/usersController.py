from flask_restx import Namespace, Resource, fields
from app.models.userRequest import UserRequest
from app.schema.userRequestSchema import UserRequestSchema
from app.services.mail_service import MailService
from flask_jwt_extended import get_jwt_identity, jwt_required, get_jwt
from app.services import facade
from flask import current_app
from marshmallow import ValidationError

api = Namespace('users', description="User operations")

user_request_schema = UserRequestSchema()

user_request = api.model("user request", {
    'first_name': fields.String(required=True, example="John"),
    'last_name': fields.String(required=True, example="Doe"),
    'email': fields.String(required=True, example="john@example.com"),
    'job': fields.String(required=True, example="Éducateur"),
    'role': fields.String(required=False, example="user"),
})

user_update = api.model("user update", {
    'first_name': fields.String(required=False),
    'last_name': fields.String(required=False),
    'job': fields.String(required=False),
    'role': fields.String(required=False),
    'status': fields.String(required=False),
})


def _require_admin(claims):
    if claims.get('role') != 'admin':
        api.abort(403, "Admin role required")
    org_id = claims.get('organization_id')
    if not org_id:
        api.abort(400, "Organization ID missing from token")
    return org_id


def _require_auth(claims):
    org_id = claims.get('organization_id')
    if not org_id:
        api.abort(400, "Organization ID missing from token")
    return org_id


@api.route('/')
class UserList(Resource):
    @jwt_required()
    @api.doc(security="token")
    @api.response(200, 'List of users retrieved successfully')
    def get(self):
        """Get all users in the same organization"""
        claims = get_jwt()
        org_id = _require_auth(claims)
        users = facade.get_all_users(org_id)
        return [user.to_dict() for user in users], 200

    @jwt_required()
    @api.doc(security="token")
    @api.expect(user_request)
    @api.response(200, 'Invitation sent')
    @api.response(403, 'Admin role required')
    def post(self):
        """Invite a new user - admin only"""
        claims = get_jwt()
        org_id = _require_admin(claims)

        payload = api.payload or {}
        try:
            validated_data = user_request_schema.load(payload)
        except ValidationError as err:
            messages = err.messages
            error_list = []
            if isinstance(messages, dict):
                for value in messages.values():
                    if isinstance(value, list):
                        error_list.extend(value)
                    else:
                        error_list.append(value)
            elif isinstance(messages, list):
                error_list.extend(messages)
            error_message = error_list[0] if error_list else str(err)
            return {"error": error_message}, 400

        request = UserRequest(
            first_name=validated_data['first_name'],
            last_name=validated_data['last_name'],
            email=validated_data['email'],
            job=validated_data['job'],
            organization_id=org_id,
            role=validated_data.get('role', 'user'),
        )

        try:
            new_request = facade.made_request_user(request)
        except ValueError as err:
            return {"error": str(err)}, 400

        org_data = facade.get_organisation(org_id)
        app_url = current_app.config["APP_URL"]
        set_password_url = f"{app_url}/set-account/{new_request.verification_token}"

        MailService.send_email(
            to=new_request.email,
            first_name=new_request.first_name,
            last_name=new_request.last_name,
            org_name=org_data.name,
            setPasswordUrl=set_password_url,
        )
        return new_request.token(), 200


@api.route('/<user_id>')
class UserResource(Resource):
    @jwt_required()
    @api.doc(security="token")
    @api.response(200, 'User retrieved')
    @api.response(404, 'User not found')
    def get(self, user_id):
        """Get user by ID - admin sees any user in org, user sees only self"""
        claims = get_jwt()
        current_id = get_jwt_identity()
        org_id = _require_auth(claims)

        if claims.get('role') != 'admin' and user_id != current_id:
            api.abort(403, "You can only view your own profile")

        user = facade.get_user(user_id)
        if not user:
            return {'error': 'user not found'}, 404
        if user.organization_id != org_id:
            api.abort(403, "User does not belong to your organization")

        return user.to_dict(), 200

    @jwt_required()
    @api.doc(security="token")
    @api.expect(user_update)
    @api.response(200, 'User updated')
    @api.response(403, 'Forbidden')
    @api.response(404, 'User not found')
    def put(self, user_id):
        """Update user - admin can update any user in org, user can update only self"""
        claims = get_jwt()
        current_id = get_jwt_identity()
        org_id = _require_auth(claims)
        is_admin = claims.get('role') == 'admin'

        if not is_admin and user_id != current_id:
            api.abort(403, "You can only update your own profile")

        user = facade.get_user(user_id)
        if not user:
            return {'error': 'user not found'}, 404
        if user.organization_id != org_id:
            api.abort(403, "User does not belong to your organization")

        data = api.payload or {}
        allowed = {"first_name", "last_name", "job", "role", "status"}
        if not is_admin:
            allowed -= {"role", "status"}

        update_data = {k: v for k, v in data.items() if k in allowed and v is not None}
        updated = facade.update_user(user_id, update_data)
        return updated.to_dict(), 200

