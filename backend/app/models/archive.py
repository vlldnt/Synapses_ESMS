from app import db
from .basemodel import BaseModel
from sqlalchemy.orm import relationship
from enum import Enum

class Archives(BaseModel):
    __tableau__= "archives"

    status = db.Column(db.Enum(), default="")
    filename = db.Column(db.String(50), nullable=False)
    display_name = db.Column(db.String(50), nullable=False)
    date = db.Column(db.String(50), nullable=False)
    intervention_type = db.Column(db.String(50), nullable=False)
    type = db.Column(db.Enum(), default="")
    childname = db.Column(db.String(50), nullable=False)
    model_id = db.Column(db.String(50), nullable=False)
    model_name = db.Column(db.String(50), nullable=False)
    docxBase64 = db.Column(db.String(50), nullable=False)
    text_content = db.Column(db.String(50), nullable=False)