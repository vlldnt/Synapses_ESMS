import requests
from flask import current_app
from flask_restx import Namespace, Resource, fields
from flask_jwt_extended import jwt_required

api = Namespace('ai', description="Open router - key server only")

chat_model = api.model("ChatRequest", {
    'model': fields.String(required=True),
    'messages': fields.List(fields.Raw, required=True),
    'temperature': fields.Float(default=0.4),
})

def openrouter_header():
    api_key = current_app.config.get('OPENROUTER_API_KEY', '')
    app_url = current_app.config.get('APP_URL', '')
    return {
        'Authorization': f'Bearer {api_key}',
        'Content-Type': 'application/json',
        'HTTP-Referer': app_url,
        'X-Title': 'Synapses ESMS',
    }

#---AI CHAT ENDPOINT---------------------------------------------------------------------------------------------
@api.route('/chat')
class AIChat(Resource):
    @jwt_required()
    @api.expect(chat_model)
    def post(self):
        """ Chat proxy to OpenRouter """
        data = api.payload or {}
        base = current_app.config.get('OPENROUTER_BASE_URL', 'https://openrouter.ai/api/v1')

        try:
            response = requests.post(
                f'{base}/chat/completions',
                headers=openrouter_header(),
                json=data,
                timeout=90,
            )
            if not response.ok:
                print(f"[OpenRouter] {response.status_code}: {response.text[:500]}")
            return response.json(), response.status_code
        except requests.Timeout:
            return {'error': 'Openrouter timeout.'}, 504
        except requests.RequestException as error:
            return {'error': str(error)}, 502
        
#---AI MODEL ENDPOINT---------------------------------------------------------------------------------------------
@api.route('/models')
class AIModels(Resource):
    @jwt_required()
    def get(self):
        """ Models proxy to OpenRouter """
        base = current_app.config.get('OPENROUTER_BASE_URL', 'https://openrouter.ai/api/v1')
        print(f"{base}")
        try:
            response = requests.get(
                f'{base}/models',
                headers=openrouter_header(),
                timeout=15,
            )
            return response.json(), response.status_code
        except requests.Timeout:
            return {'error': 'Openrouter timeout.'}, 504
        except requests.RequestException as error:
            return {'error': str(error)}, 502
