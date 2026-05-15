from flask_jwt_extended import create_access_token, create_refresh_token
from flask import current_app

def generete_token(data):
    return create_access_token(
        identity= str(data.id),
        expires_delta=current_app.config["JWT_EXPIRES"],
        additional_claims={
            "is_admin": data.is_admin,
            "organization_id": data.organization_id,
            "role": data.role
        }
    )

def generete_refresh_token(data):
    return create_refresh_token(
        identity= str(data.id),
        expires_delta=current_app.config["JWT_REFRESH_TOKEN_EXPIRES"]
    )