from app import db, bcrypt
from .basemodel import BaseModel
from enum import Enum


class Role(Enum):
    SA = "SA"
    CO = "CO"
    EM = "EM"

class Post(Enum):
    ED = "ED"
    PS = "PS"
    AS = "AS"

class User(BaseModel):
    __tablename__ = 'users'

    first_name = db.Column(db.String(50), nullable=False)
    last_name = db.Column(db.String(50), nullable=False)
    email = db.Column(db.String(120), nullable=False, unique=True)
    password = db.Column(db.String(128), nullable=False)
    role = db.Column(db.Enum(Role), default=Role.EM, nullable=False)
    post = db.Column(db.Enum(Post), default=Post.ED, nullable=False)

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
            "role": self.role.value,
            "post": self.post.value
        }