from marshmallow import Schema, fields
from app.schema.validationSchema import validate_safe_string


class DocumentSchema(Schema):
    class Meta:
        unknown = 'exclude'
    
    filename = fields.String(required=False, validate=validate_safe_string)
    display_name = fields.String(required=False, validate=validate_safe_string)
    date = fields.Date(required=False)
    intervention_type = fields.String(required=False, validate=validate_safe_string)
    type = fields.String(required=False, validate=validate_safe_string)
    reference_name = fields.String(required=False, validate=validate_safe_string)
    content = fields.String(required=False)
    educator_name = fields.String(required=False, validate=validate_safe_string)
    educator_role = fields.String(required=False, validate=validate_safe_string)
