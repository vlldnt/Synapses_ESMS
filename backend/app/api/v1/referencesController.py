from flask_restx import Namespace, Resource, fields
from app.models.references import Reference
from app.services import facade
from flask_jwt_extended import get_jwt_identity, jwt_required, get_jwt

api = Namespace('references', description="references operations")

""" references model """
ref_model = api.model("references", {
    "first_name": fields.String(required=True, description="references first name", example="Jotaro"),
    "last_name": fields.String(required=True, description="references first name", example="Kujo"),
})

@api.route("/")
class ReferencesList(Resource):
    @jwt_required()
    @api.doc(security="token")
    @api.expect(ref_model)
    @api.response(201, 'reference successfully created')
    @api.response(400, 'Invalid input data')
    def post(self):
        """ engister a reference """
        try:
            ref_data = api.payload
            educator = get_jwt_identity()
            claims = get_jwt()
            organisation_id = claims.get('organization_id')
            if not organisation_id:
                api.abort(400, "Organization ID missing from token")
            
            valid_inputs = ["first_name", "last_name"]
            for key in ref_data:
                if key not in valid_inputs:
                    api.abort(400, f'Invalid input data: {key}')

            reference = Reference(
                first_name= ref_data["first_name"],
                last_name= ref_data["last_name"],
                organisation_id=organisation_id,
                educator_id=educator 
            )
                
            new_ref = facade.create_ref(reference)
            return new_ref.to_dict(), 201
        
        except ValueError as error:
            return{'error': str(error)}, 400
        
    @jwt_required()
    @api.doc(security="token")
    @api.response(200, 'List of reference retrieved successfully')
    def get(self):
        """get all references for the organization"""

        claims = get_jwt()
        organisation_id = claims.get('organization_id')
        if not organisation_id:
            api.abort(400, "Organization ID missing from token")

        all_ref = facade.get_all_references(organisation_id)
        return [ref.to_dict() for ref in all_ref], 200
    
@api.route('/<reference_id>')
class ReferencesResource(Resource):
    @api.response(200, 'reference is successfully deleted')
    @api.response(404, 'the reference does not exist')
    @jwt_required()
    @api.doc(security="token")
    def delete(self, reference_id):
        """delete reference by his id"""

        claims = get_jwt()
        organisation_id = claims.get('organization_id')
        if not organisation_id:
            api.abort(400, "Organization ID missing from token")

        reference = facade.get_reference(reference_id)
        if not reference:
            return {'error': 'reference not found'}, 404

        if reference.organisation_id != organisation_id:
            api.abort(403, "You can only delete references from your organization")

        facade.delete_reference(reference_id)
        return {'message': 'reference successfully deleted'}, 200
    
    @jwt_required()
    @api.doc(security="token")
    @api.expect(ref_model)
    def put(self, reference_id):
        claims = get_jwt()
        organisation_id = claims.get('organization_id')
        if not organisation_id:
            api.abort(400, "Organization ID missing from token")

        reference = facade.get_reference(reference_id)
        if not reference:
            return {'error': 'reference not found'}, 404

        if reference.organisation_id != organisation_id:
            api.abort(403, "You can only delete references from your organization")

        ref_data = api.payload
        facade.update_references(reference_id, ref_data)
        return {"message": "references sucessfuly modify"}