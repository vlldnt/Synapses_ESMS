from flask_restx import Namespace, Resource, fields
""" from flask_jwt_extended import get_jwt_identity, jwt_required """
from app.services import facade

api = Namespace('organisation', description="organisation information")

TYPE = ["T1", "T2", "T3"]

""" Organisation model for input """
organisation_model = api.model("organisation", {
    "name": fields.String(required=True, description="organisation name", example="org_1"),
    "structure_type": fields.String(required=True, description="type of organisation", enum=TYPE, example="T1"),
    "description": fields.String(required=True, description="organisation description", example="je suis une description")
})

@api.route('/')
class OrganisationList(Resource):
    @api.expect(organisation_model)
    @api.response(201, 'Place successfully created')
    @api.response(400, 'Invalid input data')
    def post(self):
        """ engister organisation """
        try:
            org_data = api.payload
            valid_inputs = ['name', 'structure_type', 'description']
            for key in org_data:
                if key not in valid_inputs:
                    api.abort(400, f'Invalid input data: {key}')

            new_org = facade.create_org(org_data)
            return new_org.to_dict(), 201
        
        except ValueError as error:
            return {'error': str(error)}, 400
        
    @api.response(200, 'List of organisations retrieved successfully')
    def get(self):
        """ retrieved a list of all organisation """
        all_org = facade.get_all_organisation()
        return [org.to_dict() for org in all_org], 200
    
@api.route('/<organisation_id>')
class UserResource(Resource):
    @api.response(200, 'user is successfully retrieved')
    @api.response(404, 'the user does not exist')

    def get(self, organisation_id):
        """get user by his id"""

        organisation = facade.get_organisation(organisation_id)
        if not organisation:
            return {'error': 'the user does not exist'}, 404
        return organisation.to_dict(), 200