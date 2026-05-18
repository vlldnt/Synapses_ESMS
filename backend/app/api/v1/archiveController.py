from datetime import datetime
from flask_restx import Namespace, Resource
from flask import request
from flask_jwt_extended import get_jwt_identity, jwt_required, get_jwt
from app.services import facade
from app.models.document import Document
from app.models.archive import Archives

api = Namespace('archive', description="archive operation")

@api.route('/')
class archive_document(Resource):
    @jwt_required()
    @api.doc(security='token')
    def get(self):
        """ get all document archive """
        user_id = request.args.get("userId")
        docs = facade.get_archive(user_id if user_id else None)
        return [doc.to_dict() for doc in docs]


    @jwt_required()
    @api.doc(security='token')
    def post(self):
        """ Post a document on archive"""
        claims = get_jwt()
        user_id = get_jwt_identity()

        data = request.get_json(silent=True) or {}
        if not data:
            return {"error": "Missing JSON payload"}, 400

        educator = data.get('educator', {}) or {}

        date_value = data.get('date')
        if date_value:
            try:
                date_value = datetime.fromisoformat(date_value).date()
            except ValueError:
                date_value = None

        document = Document(
            status=data.get('status') or educator.get('status') or 'archived',
            filename=data.get('filename') or educator.get('filename') or f"archive_{datetime.utcnow().strftime('%Y%m%d%H%M%S')}.docx",
            display_name=data.get('display_name') or data.get('displayName') or educator.get('display_name') or educator.get('name') or 'Document archive',
            date=date_value or datetime.utcnow().date(),
            intervention_type=data.get('intervention_type') or data.get('interventionType') or educator.get('intervention_type') or '—',
            type=data.get('type') or educator.get('type') or 'CRI',
            reference_name=data.get('reference_name') or data.get('reference') or educator.get('reference_name') or '—',
            creator_id=data.get('creator_id') or user_id,
            organization_id=claims.get('organization_id'),
            docx_base_64=data.get('docx_base_64') or data.get('docxBase64') or ''
        )

        facade.create_document(document)
        archive = Archives(
            document_id=document.id,
            creator_id=document.creator_id,
            organization_id=document.organization_id,
        )
        facade.create_archive(archive)

        return {
            "document": {
                "id": document.id,
                "status": document.status.value if hasattr(document.status, 'value') else document.status,
                "filename": document.filename,
                "display_name": document.display_name,
                "date": document.date.isoformat() if hasattr(document.date, 'isoformat') else str(document.date),
                "intervention_type": document.intervention_type,
                "type": document.type.value if hasattr(document.type, 'value') else document.type,
                "reference_name": document.reference_name,
                "creator_id": document.creator_id,
                "organization_id": document.organization_id,
                "docx_base_64": document.docx_base_64,
            },
            "archive_id": archive.id,
        }, 200

@api.route('/<archive_id>')
class archive_document(Resource):
    @jwt_required()
    @api.doc(security='token')
    def delete(self):
        """ Delete a file from archive with this id """