from flask_restx import Namespace, Resource, fields
from flask_jwt_extended import create_access_token, get_jwt_identity, jwt_required
from app.services import facade

api = Namespace('auth', description="User authentication operation")

login_model = api.model('Login', {
    'email': fields.String(required=True, description='User email', example="user@email.com"),
    'password': fields.String(required=True, description='User password', example="Johnd0e!")
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

        access_token = create_access_token(identity= str(user.id))
        return {'access_token': access_token}, 200

    @api.route('/protected')
    class ProtectedResource(Resource):
        @jwt_required()
        @api.doc(security='token')
        def get(self):
            """A protected endpoint that requires a valid JWT token"""

            user_id = get_jwt_identity();

            return {'message': f'Hello, user {user_id}'}, 200
