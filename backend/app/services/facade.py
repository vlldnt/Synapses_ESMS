from app.persistance.all_repo import UserRepository, OrganisationRepository, OrganisationRequestRepository ,ReferenceRepository, UserRequestRepository
from app.models.user import User
from app.models.userRequest import Status as UserRequestStatus
from app.models.organizations import Organization
from app.models.organisationRequests import OrganizationRequest, Status as OrganizationRequestStatus
from app.models.references import Reference
from app.security.jwt import generete_token
from datetime import datetime

class ApiFacade:
    def __init__(self):
        self.user_repo = UserRepository()
        self.userRequest_repo = UserRequestRepository()
        self.organisation_repo = OrganisationRepository()
        self.organisationRequest_repo = OrganisationRequestRepository()
        self.reference_repo = ReferenceRepository()

    """ Request organization facade """
    def made_request_org(self, request_data):
        request = OrganizationRequest(**request_data)
        request.generate_token()
        self.organisationRequest_repo.add(request)
        return request
    
    def list_request(self):
        return self.organisationRequest_repo.get_all()
    
    def get_request_by_token_org(self, token):
        return self.organisationRequest_repo.get_by_attribute('verification_token', token)

    def complete_request_org(self, token, password):
        request = self.get_request_by_token_org(token)
        if not request or request.status != OrganizationRequestStatus.pending:
            return None
        if request.verification_expiry < datetime.utcnow():
            return None
        if self.get_user_by_email(request.contact_email):
            return None

        organisation = Organization(
            name=request.org_name,
            structure_type=request.structure_type,
            description=request.description
        )
        self.organisation_repo.add(organisation)

        user = User(
            first_name=request.first_name,
            last_name=request.last_name,
            email=request.contact_email,
            is_admin=True,
            organization_id=organisation.id,
            job="admin",
            status="active"
        )
        user.hash_password(password)
        self.user_repo.add(user)

        self.organisation_repo.update(organisation.id, {'owner_id': user.id})
        self.organisationRequest_repo.update(
            request.id,
            {'status': OrganizationRequestStatus.approved, 'approved_at': datetime.utcnow()}
        )
        
        access_token = generete_token(user)

        return {'organization': organisation.to_dict(), 'user': user.to_dict(), 'token': access_token}

    def update_request(self, request_id):
        self.organisationRequest_repo.update(request_id, 'null', 'approved')
        return self.organisationRequest_repo.get(request_id)
    
    """ user request facade """
    def made_request_user(self, request_data):
        request_data.generate_token()
        self.userRequest_repo.add(request_data)
        return request_data
    
    def list_request_user(self):
        return self.userRequest_repo.get_all()
    
    def get_request_user_by_token(self, token):
        return self.userRequest_repo.get_by_attribute('verification_token', token)
    
    def complete_request_user(self, token, password):
        request = self.get_request_user_by_token(token)
        print(f"request : {request.status}")
        if not request or request.status != UserRequestStatus.pending:
            print(f"{request} {request.status}")
            return None
        if request.verification_expiry < datetime.utcnow():
            print("2")
            return None
        
        user = User(
            first_name=request.first_name,
            last_name=request.last_name,
            email=request.email,
            is_admin=request.is_admin,
            organization_id=request.organization_id,
            job=request.job,
            status="active"
        )
        print(f"request : {user}")
        user.hash_password(password)
        self.user_repo.add(user)
        self.userRequest_repo.update(request.id, {'status': UserRequestStatus.approved, 'approved_at': datetime.utcnow()})
        access_token = generete_token(user)

        return {'user': user.to_dict(), 'token': access_token}


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
        if 'password' in user_data:
            password = user_data['password']
            user = self.user_repo.get(user_id)
            if user:
                user.hash_password(password)
            user_data = {key: value for key, value in user_data.items() if key != 'password'}

        self.user_repo.update(user_id, user_data)
        return self.user_repo.get(user_id)
    
    """ Organisation facade """
    def create_org(self, organisation_data):
        organisation = Organization(**organisation_data)
        return self.organisation_repo.add(organisation)
    
    def get_organisation(self, organisation_id):
        return self.organisation_repo.get(organisation_id)
    
    def get_all_organisation(self):
        return self.organisation_repo.get_all()
    
    """ References facade """
    def create_ref(self, reference_data):
        reference = Reference(**reference_data)
        return self.reference_repo.add(reference)
    
    def get_reference(self, reference_id):
        return self.reference_repo.get(reference_id)
    
    def get_all_references(self):
        return self.reference_repo.get_all()