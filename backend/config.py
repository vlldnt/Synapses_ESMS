import os
from dotenv import load_dotenv
from datetime import timedelta

load_dotenv()

class Config:
    SECRET_KEY = os.getenv('SECRET_KEY')
    JWT_SECRET_KEY = os.getenv("JWT_SECRET")
    JWT_EXPIRES = timedelta(minutes=15)
    JWT_REFRESH_TOKEN_EXPIRES = timedelta(days=7)
    JWT_TOKEN_LOCATION = ['cookies']
    JWT_COOKIE_SECURE = os.getenv("FLASK_env") == "production"
    JWT_COOKIE_SAMESITE = "Lax"
    JWT_COOKIE_CSRF_PROTECT = True
    JWT_ACCESS_CSRF_HEADER_NAME = "X-CSRF-TOKEN"
    JWT_COOKIE_PATH = "/"
    DEBUG = False
    SQLALCHEMY_TRACK_MODIFICATIONS = False

class DevelopmentConfig(Config):
    DEBUG = True
    SQLALCHEMY_DATABASE_URI = os.getenv("SQLALCHEMY_DATABASE_URI")
    PORT = int (os.getenv("BACKEND_PORT", 3002))
    RESEND_API_KEY = os.getenv("RESEND_API_KEY")
    ADMIN_EMAIL= os.getenv("ADMIN_EMAIL")
    APP_URL = os.getenv('APP_URL')
    CORS_ORIGINS = os.getenv("CORS_ORIGINS", "http://localhost:5173")
    OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
    OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1"
    GOOGLE_SPEECH_KEY = os.getenv("GOOGLE_SPEECH_KEY", "data/google-key.json")

class ProductionConfig(Config):
    DEBUG = False   


config = {
    'development': DevelopmentConfig,
    "production": ProductionConfig,
    'default': DevelopmentConfig
}
