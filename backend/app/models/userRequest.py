import secrets
from app import db
from .basemodel import BaseModel
from datetime import datetime, timedelta
from enum import Enum

class Status(Enum):
    pending = "pending"
    approved = "approved"
    rejected = "rejected"

class UserRequest(BaseModel):
    __tablename__ = "userRequest"
    first_name = db.Column(db.String(50), nullable=False)
    last_name = db.Column(db.String(50), nullable=False)
    email = db.Column(db.String(50), nullable=False)
    job = db.Column(db.String(128), nullable=False)
    role = db.Column(db.String(128), nullable=False, default="agent")
    organization_id = db.Column(db.String(36), db.ForeignKey('organization.id'))
    is_admin = db.Column(db.Boolean, default=False)
    verification_token = db.Column(db.String(255), nullable=True)
    verification_expiry = db.Column(db.DateTime, nullable=False)
    status = db.Column(db.Enum(Status), default=Status.pending, nullable=False)
    approved_at = db.Column(db.DateTime, nullable=True)

    def generate_token(self):
        self.verification_token = secrets.token_urlsafe(32)
        self.verification_expiry = datetime.utcnow() + timedelta(minutes=15)
    
    def token(self):
        return {
            "token" : self.verification_token
        }