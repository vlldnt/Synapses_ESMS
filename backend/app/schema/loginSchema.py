from marshmallow import Schema, fields
from app.schema.validationSchema import validate_email, validate_password


class LoginSchema(Schema):
    email = fields.String(required=True, validate=validate_email)
    password = fields.String(required=True, validate=validate_password)
