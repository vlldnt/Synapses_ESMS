from flask_restx import Namespace, Resource, fields
from app.models.references import Reference
from app.services import facade
from flask_jwt_extended import get_jwt_identity, jwt_required, get_jwt

api = Namespace('references', description="references operations")

ref_model = api.model("references", {
    "first_name": fields.String(required=True, example="Jotaro"),
    "last_name": fields.String(required=True, example="Kujo"),
    "educator_id": fields.String(required=False),
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
        """Get references — admin sees all, educator sees only their own"""
        claims = get_jwt()
        org_id = _require_auth(claims)
        if claims.get('role') == 'admin':
            refs = facade.get_all_references(org_id)
        else:
            user_id = get_jwt_identity()
            refs = facade.get_references_by_educator(org_id, user_id)
        return [ref.to_dict() for ref in refs], 200

    @jwt_required()
    @api.doc(security="token")
    @api.expect(ref_model)
    @api.response(201, 'Reference successfully created')
    @api.response(400, 'Invalid input data')
    def post(self):
        """Create a reference — admin specifies educator_id, user uses their own id"""
        claims = get_jwt()
        org_id = _require_auth(claims)

        data = api.payload or {}
        if claims.get('role') == 'admin':
            educator_id = data.get("educator_id")
            if not educator_id:
                api.abort(400, "educator_id is required")
        else:
            educator_id = get_jwt_identity()

        reference = Reference(
            first_name=data["first_name"],
            last_name=data["last_name"],
            organisation_id=org_id,
            educator_id=educator_id,
        )
        new_ref = facade.create_ref(reference)
        return new_ref.to_dict(), 201


@api.route('/<reference_id>')
class ReferencesResource(Resource):
    @jwt_required()
    @api.doc(security="token")
    @api.expect(ref_update_model)
    @api.response(200, 'Reference successfully updated')
    @api.response(403, 'Forbidden')
    @api.response(404, 'Reference not found')
    def put(self, reference_id):
        """Update a reference — admin can update any, educator only their own"""
        claims = get_jwt()
        org_id = _require_auth(claims)

        reference = facade.get_reference(reference_id)
        if not reference:
            return {'error': 'reference not found'}, 404
        if reference.organisation_id != org_id:
            api.abort(403, "Reference does not belong to your organization")

        is_admin = claims.get('role') == 'admin'
        if not is_admin:
            user_id = get_jwt_identity()
            if reference.educator_id != user_id:
                api.abort(403, "You can only update your own references")

        data = api.payload or {}
        allowed = {"first_name", "last_name"} if not is_admin else {"first_name", "last_name", "educator_id"}
        update_data = {k: v for k, v in data.items() if k in allowed and v is not None}
        facade.update_references(reference_id, update_data)
        updated = facade.get_reference(reference_id)
        return updated.to_dict(), 200

    @jwt_required()
    @api.doc(security="token")
    @api.response(200, 'Reference successfully deleted')
    @api.response(403, 'Admin role required')
    @api.response(404, 'Reference not found')
    def delete(self, reference_id):
        """Delete a reference — admin only"""
        claims = get_jwt()
        org_id = _require_admin(claims)

        reference = facade.get_reference(reference_id)
        if not reference:
            return {'error': 'reference not found'}, 404
        if reference.organisation_id != org_id:
            api.abort(403, "Reference does not belong to your organization")

        facade.delete_reference(reference_id)
        return {'message': 'Reference deleted'}, 200

