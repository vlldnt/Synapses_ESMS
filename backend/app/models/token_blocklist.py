from datetime import datetime
from app import db


class TokenBlocklist(db.Model):
    __tablename__ = 'token_blocklist'

    id = db.Column(db.Integer, primary_key=True)
    jti = db.Column(db.String(36), nullable=False, unique=True, index=True)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)

    @classmethod
    def is_blocked(cls, jti: str) -> bool:
        return cls.query.filter_by(jti=jti).first() is not None

    @classmethod
    def block(cls, jti: str):
        if not cls.is_blocked(jti):
            db.session.add(cls(jti=jti))
            db.session.commit()
