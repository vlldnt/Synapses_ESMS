from app import db
from .basemodel import BaseModel
from sqlalchemy.orm import relationship


class Prompt(BaseModel):
    __tablename__ = "prompt"

    name = db.Column(db.String(50), nullable=False, unique=True)
    type = db.Column(db.String(50), nullable=False)
    context = db.Column(db.Text, nullable=False)
    content = db.Column(db.Text, nullable=False)
    model = db.Column(db.String(200), nullable=True)

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "type": self.type,
            "context": self.context,
            "content": self.content,
            "model": self.model,
        }