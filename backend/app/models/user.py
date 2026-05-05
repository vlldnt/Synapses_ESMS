from app import db, bcrypt
from .basemodel import BaseModel

class User(BaseModel):
    __tablename__ = 'users'

    first_name = db.Column(db.String(50), nullable=False)
    last_name = db.Column(db.String(50), nullable=False)
    email = db.Column(db.String(120), nullable=False, unique=True)
    hashed_password = db.Column(db.String(128), nullable=False)
    is_admin = db.Column(db.Boolean, default=False)
    organization_id = db.Column(db.String(36), db.ForeignKey('organization.id'))
    job = db.Column(db.String(120), nullable=False)
    status = db.Column(db.String(120), nullable=False)

    def verify_password(self, password):
        """Verifies if the provided password matches the hashed password"""
        return bcrypt.check_password_hash(self.hashed_password, password)

    def hash_password(self, password):
        """Hashes the password before storing it."""
        self.hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')

    def to_dict(self):
        return {
            "id": self.id,
            "first_name": self.first_name,
            "last_name": self.last_name,
            "email": self.email,
            "organization_id" : self.organization_id,
            "is_admin": self.is_admin,
            "job": self.job,
            "status": self.status
        }