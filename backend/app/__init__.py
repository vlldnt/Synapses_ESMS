from flask import Flask
from flask_restx import Api
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS

db = SQLAlchemy()
bcrypt = Bcrypt()
jwt = JWTManager()

from app.api.v1.usersController import api as users_ns
from app.api.v1.authController import api as auth_ns
from app.api.v1.organisationController import api as org_ns
from app.api.v1.referencesController import api as ref_ns
from app.api.v1.archiveController import api as archive_ns

def createApp(config_class="config.DevelopmentConfig"):
    app = Flask(__name__)

    CORS(app)
    app.config.from_object(config_class)
    authorizations = {
        'token': {
            'type': 'apiKey',
            'in': 'header',
            'name': 'Authorization',
        }
    }

    app.url_map.strict_slashes = False

    api = Api(app, version='1.0', title='Synapses ESMS API',
              authorizations=authorizations,
              description="Synapses ESMS API")
    
    api.add_namespace(users_ns, path='/api/users')
    api.add_namespace(auth_ns, path='/api')
    api.add_namespace(org_ns, path='/api')
    api.add_namespace(ref_ns, path='/api/references')
    api.add_namespace(archive_ns, path='/api/archives')

    db.init_app(app)
    bcrypt.init_app(app)
    jwt.init_app(app)

    from app.models.prompts import Prompt
    from app.services.prompt_loader import load_initial_prompts

    with app.app_context():
        db.create_all()
        load_initial_prompts(db, Prompt)
    return app
