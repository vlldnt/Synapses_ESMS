from app.models.user import User
from app.models.organisation import Organisation
from app.models.references import References
from .repository import SQLAlchemyRepository
from app import db

class UserRepository(SQLAlchemyRepository):
    def __init__(self):
        super().__init__(User)

    def get_user_by_email(self, email):
        return self.model.query.filter_by(email=email).first()

class OrganisationRepository(SQLAlchemyRepository):
    def __init__(self):
        super().__init__(Organisation)

class ReferenceRepository(SQLAlchemyRepository):
    def __init__(self):
        super().__init__(References)
