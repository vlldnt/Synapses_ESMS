from flask_restx import Namespace, Resource, fields
""" from flask_jwt_extended import get_jwt_identity, jwt_required """
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
    
@api.route('/<organisation_id>')
class OrganisationResource(Resource):
    @api.response(200, 'organisation is successfully retrieved')
    @api.response(404, 'the organisation does not exist')

    def get(self, organisation_id):
        """get organisation by his id"""

        organisation = facade.get_organisation(organisation_id)
        if not organisation:
            return {'error': 'the organization does not exist'}, 404
        return organisation.to_dict(), 200