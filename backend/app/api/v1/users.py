from flask_restx import Namespace, Resource, fields
from flask_jwt_extended import get_jwt_identity, jwt_required
from app.services import facade

api = Namespace('users', description="User operations")

ROLES = ["SA", "CO", "EM"]
POSTS = ["ED", "PS", "AS"]

""" User Model for input"""
user_model = api.model("user", {
    'first_name': fields.String(required=True, description="User first name", example="user"),
    'last_name': fields.String(required=True, description="User last name", example="test"),
    'email': fields.String(required=True, description="User email", example="user@email.com"),
    'password': fields.String(required=True, description="User password", example="Johnd0e!"),
    'role': fields.String(required=True, description="User role", enum=ROLES, example="EM"),
    'post': fields.String(required=True, description="User post", enum=POSTS, exemple="ED")
})

user_update = api.model("user update", {
    'first_name': fields.String(required=True, description="User first name", example="user"),
    'last_name': fields.String(required=True, description="User last name", example="test"),
    'email': fields.String(required=True, description="User email", example="user@email.com"),
    'password': fields.String(required=True, description="User password", example="Johnd0e!"),
})

@api.route('/')
class UserList(Resource):
    @api.expect(user_model)
    @api.response(201, 'User successfully created')
    @api.response(400, 'Invalid input data')

    def post(self):
        """Register a new user"""

        try:
            user_data = api.payload
            existing_user = facade.get_user_by_email(user_data['email'])
            if existing_user:
                api.abort(400, 'Email already in use')

            valid_inputs = ['first_name', 'last_name', 'email', 'password', "role", "post"]
            for key in user_data:
                if key not in valid_inputs:
                    api.abort(400, f'Invalid input data: {key}')
                if existing_user:
                    return {'error': 'Email already registered'}, 400
            
            new_user = facade.create_user(user_data)
            return new_user.to_dict(), 201

        except ValueError as error:
            return {'error': str(error)}, 400

    @api.response(200, 'List of users retrieved successfully')
    def get(self):
        """Get a list of all users"""

        all_users = facade.get_all_users()
        return [user.to_dict() for user in all_users], 200


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
    @api.response(403, 'Unauthorized action')
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
            user.update(user_data)
            updated_user = facade.update_user(user_id, user_data)
            
        except (ValueError, TypeError) as e:
            api.abort(400, str(e))

        return updated_user.to_dict(), 201