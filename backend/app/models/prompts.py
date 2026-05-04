from app import db
from .basemodel import BaseModel
from sqlalchemy.orm import relationship
from enum import Enum

class Type(Enum):
    CRI = "CRI"
    PPAMS = "PPAMS"
    PPAS = "PPAS"

class Prompt(BaseModel):
    __tablename__ = "prompt"

    name = db.Column(db.String(50), nullable=False, unique=True)
    type = db.Column(db.Enum(Type), default=Type.CRI, nullable=False)
    context = db.Column(db.String(100), nullable=False)
    content = db.Column(db.String(2000), nullable=False)