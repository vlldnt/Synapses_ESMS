from marshmallow import Schema, fields
from app.schema.validationSchema import validate_first_name, validate_last_name, validate_uuid


class ReferenceSchema(Schema):
    first_name = fields.String(required=True, validate=validate_first_name)
    last_name = fields.String(required=True, validate=validate_last_name)
    educator_id = fields.String(required=False, validate=validate_uuid, load_default=None)
