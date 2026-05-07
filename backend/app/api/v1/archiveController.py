from flask_restx import Namespace, Resource, fields
from flask_jwt_extended import get_jwt_identity, jwt_required, get_jwt
from app.services import facade

api = Namespace('archive', description="archive operation")

@api.route('/')
class archive_document(Resource):
    @jwt_required()
    @api.doc(security='token')
    def get(self):
        """ get all document archive """

    @jwt_required()
    @api.doc(security='token')
    def post(self):
        """ Post a document on archive"""

@api.route('/<archive_id>')
class archive_document(Resource):
    @jwt_required()
    @api.doc(security='token')
    def delete(self):
        """ Delete a file from archive with this id """