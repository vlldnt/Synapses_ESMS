from app import db, bcrypt
from .basemodel import BaseModel
from sqlalchemy.orm import relationship
from enum import Enum

class Type(Enum):
    T1 = 'type1'
    T2 = "type2"
    T3 = 'type3'

class Organisation(BaseModel):
    __tablename__ = 'organisation'

    name = db.Column(db.String(50), nullable=False, unique=True)
    structure_type = db.Column(db.Enum(Type), default=Type.T1, nullable=False)
    description = db.Column(db.String(1860), nullable=True)

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "structure_type": self.structure_type.value,
            "description": self.description
        }