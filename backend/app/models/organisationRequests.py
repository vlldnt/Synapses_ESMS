import secrets
from app import db
from .basemodel import BaseModel
from datetime import datetime, timedelta
from enum import Enum

class Status(Enum):
    pending = "pending"
    approved = "approved"
    rjected = "rejected"

class OrganizationRequest(BaseModel):
    __tablename__ = "organizationRequest"

    org_name = db.Column(db.String(80), nullable=False, unique=True)
    structure_type = db.Column(db.String(50), nullable=False)
    description = db.Column(db.String(500))
    first_name = db.Column(db.String(50), nullable=False)
    last_name = db.Column(db.String(50), nullable=False)
    contact_email = db.Column(db.String(50), nullable=False)
    status = db.Column(db.Enum(Status), default=Status.pending, nullable=False)
    verification_token = db.Column(db.String(255), nullable=True)
    verification_expiry = db.Column(db.DateTime, nullable=False)
    approved_at = db.Column(db.DateTime, nullable=True)

    def generate_token(self):
        self.verification_token = secrets.token_urlsafe(32)
        self.verification_expiry = datetime.utcnow() + timedelta(minutes=15)

    def token(self):
        return {
            "token" : self.verification_token
        }