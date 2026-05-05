from app.models.user import User
from app.models.organizations import Organization
from app.models.organisationRequests import OrganizationRequest
from app.models.references import Reference
from app.models.userRequest import UserRequest
from .repository import SQLAlchemyRepository
from app import db

class UserRepository(SQLAlchemyRepository):
    def __init__(self):
        super().__init__(User)

    def get_user_by_email(self, email):
        return self.model.query.filter_by(email=email).first()
    
class UserRequestRepository(SQLAlchemyRepository):
    def __init__(self):
        super().__init__(UserRequest)

class OrganisationRepository(SQLAlchemyRepository):
    def __init__(self):
        super().__init__(Organization)

class OrganisationRequestRepository(SQLAlchemyRepository):
    def __init__(self):
        super().__init__(OrganizationRequest)

class ReferenceRepository(SQLAlchemyRepository):
    def __init__(self):
        super().__init__(Reference)
