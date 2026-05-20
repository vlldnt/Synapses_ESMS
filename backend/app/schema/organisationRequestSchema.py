from marshmallow import Schema, fields
from app.schema.validationSchema import (
    validate_email,
    validate_first_name,
    validate_last_name,
    validate_org_name,
    validate_structure_type,
    validate_description,
)

class OrganizationRequestSchema(Schema):
    org_name = fields.String(required=True, validate=validate_org_name)
    structure_type = fields.String(required=True, validate=validate_structure_type)
    description = fields.String(load_default=None, validate=validate_description)

    first_name = fields.String(required=True, validate=validate_first_name)
    last_name = fields.String(required=True, validate=validate_last_name)

    contact_email = fields.String(required=True, validate=validate_email)
    _hp = fields.String(load_default=None)  # honeypot
    _t = fields.Integer(load_default=None)   # timing