from app import db
from .basemodel import BaseModel
from sqlalchemy.orm import relationship

class Archives(BaseModel):
    __tableau__= "archives"

    document_id = db.Column(db.String(36), db.ForeignKey('document.id'))
    creator_id = db.Column(db.String(36), db.ForeignKey('users.id'))
    organization_id = db.Column(db.String(36), db.ForeignKey('organization.id'))