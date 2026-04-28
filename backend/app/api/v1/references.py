from flask_restx import Namespace, Resource, fields
from app.services import facade

api = Namespace('references', description="references operations")

""" references model """
ref_model = api.model("references", {
    "first_name": fields.String(required=True, description="references first name", example="Jotaro"),
    "last_name": fields.String(required=True, description="references first name", example="Kujo"),
    "educator_id": fields.String(required=True, description="reference educator id", example=""),
    'organisation_id': fields.String(required=True, description="reference organisation_id", example=""),
})

@api.route("/")
class ReferencesList(Resource):
    @api.expect(ref_model)
    @api.response(201, 'reference successfully created')
    @api.response(400, 'Invalid input data')
    def post(self):
        """ engister a reference """
        try:
            ref_data = api.payload
            
            valid_inputs = ["first_name", "last_name", "educator_id", "organisation_id"]
            for key in ref_data:
                if key not in valid_inputs:
                    api.abort(400, f'Invalid input data: {key}')

            """check if organisation and eductor exist"""
            org = facade.get_organisation(ref_data['organisation_id'])
            if not org:
                api.abort(404, 'Organisation are not found')

            educator = facade.get_user(ref_data["educator_id"])
            if not educator:
                api.abort(404, 'educator are not found')

            if educator.organisation_id != org.id:
                api.abort(400, 'educator does not belong to this organisation')
                
            new_ref = facade.create_ref(ref_data)
            return new_ref.to_dict(), 201
        
        except ValueError as error:
            return{'error': str(error)}, 400
        
    @api.response(200, 'List of reference retrieved successfully')
    def get(self):
        """Get a list of all ref"""

        all_ref = facade.get_all_references()
        return [ref.to_dict() for ref in all_ref], 200
    
@api.route('/<reference_id>')
class ReferencesResource(Resource):
    @api.response(200, 'reference is successfully retrieved')
    @api.response(404, 'the reference does not exist')

    def get(self, reference_id):
        """get reference by his id"""

        reference = facade.get_reference(reference_id)
        if not reference:
            return {'error': 'reference not found'}, 404
        return reference.to_dict(), 200