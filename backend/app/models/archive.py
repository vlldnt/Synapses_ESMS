from app import db
from .basemodel import BaseModel
from sqlalchemy.orm import relationship

class Archives(BaseModel):
    __tablename__ = "archives"

    document_id = db.Column(db.String(36), db.ForeignKey('document.id'))
    creator_id = db.Column(db.String(36), db.ForeignKey('users.id'))
    organization_id = db.Column(db.String(36), db.ForeignKey('organization.id'))
    document = relationship('Document', foreign_keys=[document_id])

    def to_dict(self):
        document = self.document
        entry = {
            "id": self.id,
            "archive_id": self.id,
            "document_id": self.document_id,
            "creator_id": self.creator_id,
            "organization_id": self.organization_id,
            "created_at": self.created_at.isoformat() if hasattr(self.created_at, 'isoformat') else str(self.created_at),
            "updated_at": self.updated_at.isoformat() if hasattr(self.updated_at, 'isoformat') else str(self.updated_at),
        }

        if document is None:
            return entry

        entry.update({
            "status": document.status.value if hasattr(document.status, 'value') else document.status,
            "filename": document.filename,
            "display_name": document.display_name,
            "date": document.date.isoformat() if hasattr(document.date, 'isoformat') else str(document.date),
            "intervention_type": document.intervention_type,
            "type": document.type,
            "reference_name": document.reference_name,
            "docx_base_64": document.docx_base_64,
            "creator_id": document.creator_id,
            "organization_id": document.organization_id,
        })

        return entry