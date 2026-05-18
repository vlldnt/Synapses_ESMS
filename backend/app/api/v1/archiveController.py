import traceback
from datetime import datetime
from flask_restx import Namespace, Resource
from flask import request
from flask_jwt_extended import get_jwt_identity, jwt_required, get_jwt
from app.services import facade
from app.models.document import Document
from app.models.archive import Archives
from app.utils.docx_builder import generate_docx_base64

api = Namespace('archive', description="archive operation")


@api.route('/')
class archive_document(Resource):
    @jwt_required()
    @api.doc(security='token')
    def get(self):
        """Get all document archives"""
        user_id = request.args.get("userId")
        docs = facade.get_archive(user_id if user_id else None)
        return [doc.to_dict() for doc in docs]

    @jwt_required()
    @api.doc(security='token')
    def post(self):
        """Create a document and its archive entry"""
        claims = get_jwt()
        user_id = get_jwt_identity()

        data = request.get_json(silent=True) or {}
        if not data:
            return {"error": "Missing JSON payload"}, 400

        date_value = data.get('date')
        if date_value:
            try:
                date_value = datetime.fromisoformat(date_value).date()
            except ValueError:
                date_value = None

        # Generate DOCX from text content (backend handles conversion)
        raw_text = data.get('content') or ''
        if raw_text:
            docx_base64 = generate_docx_base64(
                text=raw_text,
                child_name=data.get('reference_name') or '—',
                educator_name=data.get('educator_name') or '',
                educator_role=data.get('educator_role') or '',
            )
        else:
            docx_base64 = ''

        document = Document(
            status='archived',
            filename=data.get('filename') or f"document_{datetime.utcnow().strftime('%Y%m%d%H%M%S')}.docx",
            display_name=data.get('display_name') or 'Document archivé',
            date=date_value or datetime.utcnow().date(),
            intervention_type=data.get('intervention_type') or '—',
            type=data.get('type') or 'CRI',
            reference_name=data.get('reference_name') or '—',
            creator_id=user_id,
            organization_id=claims.get('organization_id'),
            docx_base_64=docx_base64,
        )

        try:
            facade.create_document(document)
        except Exception as e:
            print(f"[Archive] create_document error: {traceback.format_exc()}")
            return {"error": f"Document save failed: {str(e)}"}, 500

        archive = Archives(
            document_id=document.id,
            creator_id=document.creator_id,
            organization_id=document.organization_id,
        )
        try:
            facade.create_archive(archive)
        except Exception as e:
            print(f"[Archive] create_archive error: {traceback.format_exc()}")
            return {"error": f"Archive save failed: {str(e)}"}, 500

        return archive.to_dict(), 200


@api.route('/<archive_id>')
class archive_document_detail(Resource):
    @jwt_required()
    @api.doc(security='token')
    def delete(self, archive_id):
        """Delete an archive — admin only"""
        claims = get_jwt()
        if claims.get('role') != 'admin':
            return {"error": "Admin role required"}, 403

        org_id = claims.get('organization_id')
        if not org_id:
            return {"error": "Organization ID missing from token"}, 400

        archive = facade.get_archive_by_id(archive_id)
        if not archive:
            return {"error": "Archive not found"}, 404

        if archive.organization_id != org_id:
            return {"error": "Forbidden"}, 403

        document_id = archive.document_id
        facade.delete_archive(archive_id)
        if document_id:
            facade.delete_document(document_id)

        return {"message": "Archive deleted"}, 200
