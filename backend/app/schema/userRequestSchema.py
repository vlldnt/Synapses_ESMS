from marshmallow import Schema, fields
from app.schema.validationSchema import (
    validate_email,
    validate_first_name,
    validate_last_name,
    validate_job,
    validate_role,
)


class UserRequestSchema(Schema):
    class Meta:
        unknown = 'exclude'

    first_name = fields.String(required=True, validate=validate_first_name)
    last_name = fields.String(required=True, validate=validate_last_name)
    email = fields.String(required=True, validate=validate_email)
    job = fields.String(required=True, validate=validate_job)
    role = fields.String(load_default="user", validate=validate_role)
