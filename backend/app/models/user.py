from app import db, bcrypt
from .basemodel import BaseModel
from sqlalchemy.orm import relationship
from enum import Enum

class Jobs(Enum):
    ED = "ED"
    PS = "PS"
    AS = "AS"

class Status(Enum):
    active = "active"
    absent = "absent"
    no_actif = "no_actif"

class User(BaseModel):
    __tablename__ = 'users'

    first_name = db.Column(db.String(50), nullable=False)
    last_name = db.Column(db.String(50), nullable=False)
    email = db.Column(db.String(120), nullable=False, unique=True)
    password = db.Column(db.String(128), nullable=False)
    is_admin = db.Column(db.Boolean, default=False)
    organisation_id = db.Column(db.String(36), db.ForeignKey('organisation.id'))
    job = db.Column(db.Enum(Jobs), default=Jobs.ED, nullable=False)
    status = db.Column(db.Enum(Status), default=Status.active, nullable=False)

    def verify_password(self, password):
        """Verifies if the provided password matches the hashed password"""
        return bcrypt.check_password_hash(self.password, password)

    def hash_password(self, password):
        """Hashes the password before storing it."""
        self.password = bcrypt.generate_password_hash(password).decode('utf-8')

    def to_dict(self):
        return {
            "id": self.id,
            "first_name": self.first_name,
            "last_name": self.last_name,
            "email": self.email,
            "organisation_id" : self.organisation_id,
            "is_admin": self.is_admin,
            "job": self.job.value
        }