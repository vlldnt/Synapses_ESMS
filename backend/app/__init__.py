import os
import sys
from flask import Flask, redirect, request
from flask_restx import Api
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from flask_sock import Sock

db = SQLAlchemy()
bcrypt = Bcrypt()
jwt = JWTManager()
limiter = Limiter(key_func=get_remote_address, default_limits=[])
sock = Sock()

from app.services.speech import init_speech_client
from app.sockets.audioSocket import register_audio_socket
from app.api.v1.usersController import api as users_ns
from app.api.v1.authController import api as auth_ns
from app.api.v1.organisationController import api as org_ns
from app.api.v1.referencesController import api as ref_ns
from app.api.v1.archiveController import api as archive_ns
from app.api.v1.aiController import api as ai_ns
from app.api.v1.audioController import api as audio_ns

def check_produc_secrets(app):
    """ check secret produce """
    if os.getenv("FLASK_ENV") != "production":
        return
    secret = os.getenv('SECRET_KEY', '')
    jwt_secret = os.getenv('JWT_SECRET', '')
    if not secret or 'dev' in secret.lower() or len(secret) < 32:
        print(
            'SECURITY ERROR: SECRET_KEY manquant ou trop faible en production. '
            'Générez une clé forte : python -c "import secrets; print(secrets.token_hex(32))"',
            file=sys.stderr,
        )
        sys.exit(1)
    if not jwt_secret or len(jwt_secret) < 32:
        print(
            'SECURITY ERROR: JWT_SECRET manquant ou trop faible en production.',
            file=sys.stderr,
        )
        sys.exit(1)

def createApp(config_class="config.DevelopmentConfig"):
    app = Flask(__name__)
    app.config.from_object(config_class)

    check_produc_secrets(app)

    cors_origins = app.config.get("CORS_ORIGINS", os.getenv("CORS_ORIGINS", "http://localhost:5173"))
    CORS(
        app,
        resources={r"/api/*": {"origins": cors_origins}},
        supports_credentials=True,
        allow_headers=["Content-Type", "X-CSRF-TOKEN"],
    )
    authorizations = {
        'token': {
            'type': 'apiKey',
            'in': 'header',
            'name': 'Authorization',
        }
    }

    @app.before_request
    def enforce_https():
        if os.getenv('FLASK_ENV') == 'production':
            proto = request.headers.get('X-Forwarded-Proto', request.scheme)
            if proto != 'https':
                return redirect(request.url.replace('http://', 'https://', 1), 301)

    app.url_map.strict_slashes = False
    api = Api(app, version='1.0', title='Synapses ESMS API',
              description="Synapses ESMS API")

    api.add_namespace(users_ns, path='/api/users')
    api.add_namespace(auth_ns, path='/api')
    api.add_namespace(org_ns, path='/api')
    api.add_namespace(ref_ns, path='/api/references')
    api.add_namespace(archive_ns, path='/api/archives')
    api.add_namespace(ai_ns, path='/api/ai')
    api.add_namespace(audio_ns, path='/api')

    # ── Extensions ────────────────────────────────────────────────────────────
    db.init_app(app)
    bcrypt.init_app(app)
    jwt.init_app(app)
    limiter.init_app(app)
    sock.init_app(app)
    
    init_speech_client(app.config.get("GOOGLE_SPEECH_KEY", "google-key.json"))
    register_audio_socket(app)

    from app.models.blocklist_token import TokenBlocklist

    @jwt.token_in_blocklist_loader
    def check_if_token_revoked(jwt_header, jwt_payload):
        return TokenBlocklist.is_blocked(jwt_payload.get('jti', ''))

    # ── DB init ───────────────────────────────────────────────────────────────
    from app.models.prompts import Prompt
    from app.services.prompt_loader import load_initial_prompts

    with app.app_context():
        db.create_all()
        load_initial_prompts(db, Prompt)

    return app
