from app import db
from .basemodel import BaseModel

class Reference(BaseModel):
    __tablename__ = "reference"

    first_name = db.Column(db.String(50), nullable=False)
    last_name = db.Column(db.String(50), nullable=False)
    educator_id = db.Column(db.String(36), db.ForeignKey('users.id'))
    organisation_id = db.Column(db.String(36), db.ForeignKey('organization.id'))

    def to_dict(self):
        return {
            "id": self.id,
            "first_name": self.first_name,
            "last_name": self.last_name,
            "organisation_id" : self.organisation_id,
            "educator_id": self.educator_id,
        }