from datetime import datetime
from app import db
from .basemodel import BaseModel

class TokenBlocklist(BaseModel):
    __tablename__ = 'token_blocklist'

    jti = db.Column(db.String(36), nullable=False, unique=True, index=True)

    @classmethod
    def is_blocked(cls, jti: str):
        return cls.query.filter_by(jti=jti).first() is not None
    
    @classmethod
    def block(cls, jti: str):
        if not cls.is_blocked(jti):
            db.session.add(cls(jti=jti))
            db.session.commit()
    