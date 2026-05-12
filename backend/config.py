import os
from dotenv import load_dotenv
from datetime import timedelta

load_dotenv()

class Config:
    SECRET_KEY = os.getenv('SECRET_KEY')
    JWT_SECRET_KEY = os.getenv("JWT_SECRET")
    JWT_EXPIRES = timedelta(days=5)
    DEBUG = False
    SQLALCHEMY_TRACK_MODIFICATIONS = False

class DevelopmentConfig(Config):
    DEBUG = True
    SQLALCHEMY_DATABASE_URI = os.getenv("SQLALCHEMY_DATABASE_URI")
    PORT = int (os.getenv("BACKEND_PORT", 3002))
    RESEND_API_KEY = os.getenv("RESEND_API_KEY")
    ADMIN_EMAIL= os.getenv("ADMIN_EMAIL")
    APP_URL = os.getenv('APP_URL')

class ProductionConfig(Config):
    DEBUG = False   


config = {
    'development': DevelopmentConfig,
    "production": ProductionConfig,
    'default': DevelopmentConfig
}
