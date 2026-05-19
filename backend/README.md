### Synapses EMS - Web App - Backend

## Installing Dependencies

To install all the required libraries in your virtual environment, use the `requirements.txt` file:

```bash 
pip install -r requirements.txt
```

## Token Test with Flask-RESTX

To authorize your requests, go to the **Authorization** field (top-right) and enter your token in this format:
``` Bearer <your_token_here> ```

Make sure to replace `<your_token_here>` with the actual JWT token you received after login.

## Flask-Migrate Usage

Initialize the migration system for the database:

```bash
flask db init
```

When you modify a model in the backend:

```bash
flask db migrate -m "comment"
flask db upgrade
```

## creation .env

```bash
# Backend configuration
BACKEND_PORT=3002

# Frontend configuration
FRONTEND_PORT=8083

# API configuration
VITE_BASENAME=/synapses
APP_URL=http://localhost:5173/synapses

# Environment
NODE_ENV=production

# OpenRouter API Key
OPENROUTER_API_KEY=your_openrouter_api_key

# API URL
VITE_API_URL=/synapses/api

# JWT
JWT_SECRET=replace_with_secure_random_secret
JWT_EXPIRES_IN=5d

# Resend (email)
RESEND_API_KEY=your_resend_api_key
ADMIN_EMAIL=noreply@example.com

# Database PostgreSQL
SQLALCHEMY_DATABASE_URI=postgresql://user:password@localhost:5432/database

# Flask
SECRET_KEY=replace_with_secure_secret
FLASK_ENV=development
```