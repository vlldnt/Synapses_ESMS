from app.persistance.all_repo import UserRepository, OrganisationRepository, ReferenceRepository
from app.models.user import User
from app.models.organisation import Organisation
from app.models.references import References

class ApiFacade:
    def __init__(self):
        self.user_repo = UserRepository()
        self.organisation_repo = OrganisationRepository()
        self.reference_repo = ReferenceRepository()

    """ User facade """
    def create_user(self, user_data):
        user = User(**user_data)
        user.hash_password(user_data['password'])
        self.user_repo.add(user)
        return user

    def get_user(self, user_id):
        return self.user_repo.get(user_id)
    
    def get_all_users(self):
         return self.user_repo.get_all()
    
    def get_user_by_email(self, email):
        return self.user_repo.get_by_attribute('email', email)

    def update_user(self, user_id, user_data):
        self.user_repo.update(user_id, user_data)
        return self.user_repo.get(user_id)
    
    """ Organisation facade """
    def create_org(self, organisation_data):
        organisation = Organisation(**organisation_data)
        return self.organisation_repo.add(organisation)
    
    def get_organisation(self, organisation_id):
        return self.organisation_repo.get(organisation_id)
    
    def get_all_organisation(self):
        return self.organisation_repo.get_all()
    
    """ References facade """
    def create_ref(self, reference_data):
        reference = References(**reference_data)
        return self.reference_repo.add(reference)
    
    def get_reference(self, reference_id):
        return self.reference_repo.get(reference_id)
    
    def get_all_references(self):
        return self.reference_repo.get_all()