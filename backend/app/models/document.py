from app import db
from .basemodel import BaseModel
from sqlalchemy.orm import relationship
from enum import Enum

class Status(Enum):
    active = "active"
    archived = "archived"

class Document(BaseModel):
    __tablename__ = "document"

    status = db.Column(db.Enum(Status, name='document_status'), default=Status.active, nullable=False)
    filename = db.Column(db.String(50), nullable=False)
    display_name = db.Column(db.String(50), nullable=False)
    date = db.Column(db.Date, nullable=False)
    intervention_type = db.Column(db.String(50), nullable=False)
    type = db.Column(db.String(50), nullable=False)
    reference_name = db.Column(db.String(50), nullable=False)
    creator_id = db.Column(db.String(36), db.ForeignKey('users.id'))
    organization_id = db.Column(db.String(36), db.ForeignKey('organization.id'))
    docx_base_64 = db.Column(db.Text, nullable=False)