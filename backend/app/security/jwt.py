from flask_jwt_extended import create_access_token

def generete_token(data):
    return create_access_token(
        identity= str(data.id),
        additional_claims={
            "is_admin": data.is_admin,
            "organization_id": data.organization_id
        }
    )