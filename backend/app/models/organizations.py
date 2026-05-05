from app import db
from .basemodel import BaseModel
from sqlalchemy.orm import relationship

class Organization(BaseModel):
    __tablename__ = 'organization'

    name = db.Column(db.String(50), nullable=False, unique=True)
    structure_type = db.Column(db.String(50), nullable=False)
    description = db.Column(db.String(1860), nullable=True)
    owner_id = db.Column(db.String(36), db.ForeignKey('users.id'))

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "structure_type": self.structure_type,
            "description": self.description,
            "owner_id": self.owner_id
        }