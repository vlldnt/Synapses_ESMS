from flask_jwt_extended import create_access_token
from flask import current_app

def generete_token(data):
    return create_access_token(
        identity= str(data.id),
        expires_delta=current_app.config["JWT_EXPIRES"],
        additional_claims={
            "is_admin": data.is_admin,
            "organization_id": data.organization_id
        }
    )