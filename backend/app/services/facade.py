from app.persistance.all_repo import UserRepository, OrganisationRepository, OrganisationRequestRepository ,ReferenceRepository, UserRequestRepository, ArchiveRepository, DocumentRepository, PromptRepository
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
        self.archive_repo = ArchiveRepository()
        self.document_repo = DocumentRepository()
        self.prompt_repo = PromptRepository()

    """ Request organization facade """
    def made_request_org(self, request_data):
        contact_email = request_data.get('contact_email')
        if contact_email and self.get_user_by_email(contact_email):
            raise ValueError("Cet email est déjà utilisé.")

        if contact_email and self.organisationRequest_repo.get_by_attribute('contact_email', contact_email):
            raise ValueError("Une demande d'organisation avec cet email existe déjà.")

        request = OrganizationRequest(**request_data)
        request.generate_token()
        self.organisationRequest_repo.add(request)
        return request
    
    def list_request_org(self):
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
            job="adminstrateur",
            role="admin",
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
        email = getattr(request_data, 'email', None)
        if email and self.get_user_by_email(email):
            raise ValueError("Cet email est déjà utilisé.")

        if email and self.userRequest_repo.get_by_attribute('email', email):
            raise ValueError("Une invitation pour cet email existe déjà.")

        request_data.generate_token()
        self.userRequest_repo.add(request_data)
        return request_data
    
    def list_request_user(self):
        return self.userRequest_repo.get_all()
    
    def get_request_user_by_token(self, token):
        return self.userRequest_repo.get_by_attribute('verification_token', token)
    
    def complete_request_user(self, token, password):
        request = self.get_request_user_by_token(token)
        if not request or request.status != UserRequestStatus.pending:
            return None
        if request.verification_expiry < datetime.utcnow():
            return None
        if self.get_user_by_email(request.email):
            return None
        
        user = User(
            first_name=request.first_name,
            last_name=request.last_name,
            email=request.email,
            is_admin=request.is_admin,
            organization_id=request.organization_id,
            job=request.job,
            role="agent",
            status="active"
        )
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
    
    def get_all_users(self, organization_id=None):
        if organization_id is None:
            return self.user_repo.get_all()
        return self.user_repo.get_all_by_attribute('organization_id', organization_id)
    
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
        return self.reference_repo.add(reference_data)
    
    def get_reference(self, reference_id):
        return self.reference_repo.get(reference_id)
    
    def delete_reference(self, reference_id):
        return self.reference_repo.delete(reference_id)
    
    def get_all_references(self, organization_id=None):
        if organization_id is None:
            return self.reference_repo.get_all()
        return self.reference_repo.get_all_by_attribute('organisation_id', organization_id)

    def get_references_by_educator(self, organization_id, educator_id):
        return self.reference_repo.model.query.filter_by(
            organisation_id=organization_id,
            educator_id=educator_id,
        ).all()

    def update_references(self, ref_id, ref_data):
        self.reference_repo.update(ref_id, ref_data)

    """ Archive facade """
    def get_archive(self, user_id=None):
        if user_id is None:
            return self.archive_repo.get_all()
        return self.archive_repo.get_all_by_attribute('creator_id', user_id)
    
    def create_archive(self, data):
        return self.archive_repo.add(data)

    def get_archive_by_id(self, archive_id):
        return self.archive_repo.get(archive_id)

    def delete_archive(self, archive_id):
        return self.archive_repo.delete(archive_id)

    def delete_document(self, document_id):
        return self.document_repo.delete(document_id)
    
    """ document facade """
    def create_document(self, data):
        return self.document_repo.add(data)

    """ Prompt facade """
    def get_all_prompts(self):
        return self.prompt_repo.get_all()

    def get_prompt_by_name(self, name):
        return self.prompt_repo.get_by_attribute('name', name)

    def update_prompt(self, name, data):
        prompt = self.prompt_repo.get_by_attribute('name', name)
        if not prompt:
            return None
        allowed = {'content', 'model'}
        self.prompt_repo.update(prompt.id, {k: v for k, v in data.items() if k in allowed})
        return self.prompt_repo.get_by_attribute('name', name)