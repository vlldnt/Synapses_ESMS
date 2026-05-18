from flask_restx import Namespace, Resource, fields
from flask_jwt_extended import get_jwt_identity, jwt_required, get_jwt
from app.services import facade

api = Namespace('organisation', description="organisation information")

""" Organisation model for input """
organisation_model = api.model("organisation", {
    "name": fields.String(required=True, description="organisation name", example="org_1"),
    "structure_type": fields.String(required=True, description="type of organisation", example="IME"),
    "description": fields.String(required=True, description="organisation description", example="je suis une description")
})

@api.route('/')
class OrganisationList(Resource):
    @api.response(200, 'List of organisations retrieved successfully')
    def get(self):
        """ retrieved a list of all organisation """
        all_org = facade.get_all_organisation()
        return [org.to_dict() for org in all_org], 200
    
@api.route('/organizations')
class OrganisationResource(Resource):
    @jwt_required()
    @api.doc(security="token")
    @api.response(200, 'organisation is successfully retrieved')
    @api.response(404, 'the organisation does not exist')

    def get(self):
        """get organisation by his id"""
        claims = get_jwt()
        organisation = facade.get_organisation(claims["organization_id"])
        if not organisation:
            return {'error': 'the organization does not exist'}, 404
        return [organisation.to_dict()], 200

@api.route('/prompts')
class OrganisationPrompt(Resource):
    @jwt_required()
    @api.doc(security="token")
    def get(self):
        prompts = facade.get_all_prompts()
        return [prompt.to_dict() for prompt in prompts], 200

DEV_USER_IDS = {
    '8eb164ea-36e1-417b-b843-b5370dc905ff',
    '09eca25d-d955-4136-93f2-4467f2df37eb',
    '3cc14d1c-591d-468b-bad4-bfa0e79b25f4',
    '1c38aaee-4a20-43b3-bb92-92cd4f898dc1',
    'b6f01e00-b5fc-4ad8-98fc-f1dda88f9edf',
}

@api.route('/prompts/<string:name>')
class PromptDetail(Resource):
    @jwt_required()
    @api.doc(security="token")
    def put(self, name):
        claims = get_jwt()
        user_id = get_jwt_identity()
        user = facade.get_user(user_id)

        if (
            user_id not in DEV_USER_IDS
            or claims.get('is_admin') is not True
            or claims.get('role') != 'admin'
            or claims.get('job') != 'Administrateur'
            or not user
            or user.job != 'Administrateur'
        ):
            return {'error': 'Accès refusé'}, 403

        data = api.payload or {}
        allowed = {'content', 'model'}
        if not any(k in data for k in allowed):
            return {'error': 'Aucun champ valide fourni'}, 400

        updated = facade.update_prompt(name, {k: v for k, v in data.items() if k in allowed})
        if not updated:
            return {'error': 'Prompt introuvable'}, 404

        return updated.to_dict(), 200