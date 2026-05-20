from flask_restx import Namespace, Resource, fields
from app.models.references import Reference
from app.schema.referenceSchema import ReferenceSchema
from app.services import facade
from flask_jwt_extended import get_jwt_identity, jwt_required, get_jwt
from marshmallow import ValidationError

api = Namespace('references', description="references operations")

reference_schema = ReferenceSchema()

ref_model = api.model("references", {
    "first_name": fields.String(required=True, example="Jotaro"),
    "last_name": fields.String(required=True, example="Kujo"),
    "educator_id": fields.String(required=True, example="123e4567-e89b-12d3-a456-426614174000"),
})

ref_update_model = api.model("references_update", {
    "first_name": fields.String(required=False),
    "last_name": fields.String(required=False),
    "educator_id": fields.String(required=False),
})


def _require_admin(claims):
    """Returns org_id or aborts with 403/400."""
    if claims.get('role') != 'admin':
        api.abort(403, "Admin role required")
    org_id = claims.get('organization_id')
    if not org_id:
        api.abort(400, "Organization ID missing from token")
    return org_id


def _require_auth(claims):
    """Returns org_id for any authenticated user or aborts."""
    org_id = claims.get('organization_id')
    if not org_id:
        api.abort(400, "Organization ID missing from token")
    return org_id


@api.route("/")
class ReferencesList(Resource):
    @jwt_required()
    @api.doc(security="token")
    @api.response(200, 'List of references retrieved successfully')
    def get(self):
        """Get all references for the organization"""
        claims = get_jwt()
        org_id = _require_auth(claims)
        refs = facade.get_all_references(org_id)
        return [ref.to_dict() for ref in refs], 200

    @jwt_required()
    @api.doc(security="token")
    @api.expect(ref_model)
    @api.response(201, 'Reference successfully created')
    @api.response(400, 'Invalid input data')
    @api.response(403, 'Admin role required')
    def post(self):
        """Create a reference — admin only"""
        claims = get_jwt()
        org_id = _require_admin(claims)

        data = api.payload or {}
        try:
            validated = reference_schema.load(data)
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

        reference = Reference(
            first_name=validated["first_name"],
            last_name=validated["last_name"],
            organisation_id=org_id,
            educator_id=validated["educator_id"],
        )
        new_ref = facade.create_ref(reference)
        return new_ref.to_dict(), 201


@api.route('/<reference_id>')
class ReferencesResource(Resource):
    @jwt_required()
    @api.doc(security="token")
    @api.expect(ref_update_model)
    @api.response(200, 'Reference successfully updated')
    @api.response(403, 'Admin role required')
    @api.response(404, 'Reference not found')
    def put(self, reference_id):
        """Update a reference — admin only"""
        claims = get_jwt()
        org_id = _require_admin(claims)

        reference = facade.get_reference(reference_id)
        if not reference:
            return {'error': 'reference not found'}, 404
        if reference.organisation_id != org_id:
            api.abort(403, "Reference does not belong to your organization")

        data = api.payload or {}
        allowed = {"first_name", "last_name", "educator_id"}
        update_data = {k: v for k, v in data.items() if k in allowed and v is not None}
        facade.update_references(reference_id, update_data)
        updated = facade.get_reference(reference_id)
        return updated.to_dict(), 200

