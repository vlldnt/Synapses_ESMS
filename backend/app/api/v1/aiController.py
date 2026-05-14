import requests
from flask import current_app
from flask_restx import Namespace, Resource, fields
from flask_jwt_extended import jwt_required

api = Namespace('ai', description="OpenRouter proxy — clé API conservée côté serveur")

chat_model = api.model('ChatRequest', {
    'model': fields.String(required=True),
    'messages': fields.List(fields.Raw, required=True),
    'temperature': fields.Float(default=0.4),
})


def _openrouter_headers():
    api_key = current_app.config.get('OPENROUTER_API_KEY', '')
    app_url = current_app.config.get('APP_URL', '')
    return {
        'Authorization': f'Bearer {api_key}',
        'Content-Type': 'application/json',
        'HTTP-Referer': app_url,
        'X-Title': 'Synapses ESMS',
    }


@api.route('/chat')
class AIChat(Resource):
    @jwt_required()
    @api.expect(chat_model)
    def post(self):
        """Proxy vers OpenRouter /chat/completions"""
        payload = api.payload or {}
        base = current_app.config.get('OPENROUTER_BASE_URL', 'https://openrouter.ai/api/v1')

        try:
            resp = requests.post(
                f'{base}/chat/completions',
                headers=_openrouter_headers(),
                json=payload,
                timeout=90,
            )
            return resp.json(), resp.status_code
        except requests.Timeout:
            return {'error': 'OpenRouter timeout.'}, 504
        except requests.RequestException as e:
            return {'error': str(e)}, 502


@api.route('/models')
class AIModels(Resource):
    @jwt_required()
    def get(self):
        """Proxy vers OpenRouter /models"""
        base = current_app.config.get('OPENROUTER_BASE_URL', 'https://openrouter.ai/api/v1')

        try:
            resp = requests.get(
                f'{base}/models',
                headers=_openrouter_headers(),
                timeout=15,
            )
            return resp.json(), resp.status_code
        except requests.Timeout:
            return {'error': 'OpenRouter timeout.'}, 504
        except requests.RequestException as e:
            return {'error': str(e)}, 502
