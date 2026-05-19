import resend
from flask import current_app, request as flask_request
from flask_restx import Namespace, Resource, fields

api = Namespace('contact', description='Formulaire de contact landing page')

contact_model = api.model('Contact', {
    'prenom': fields.String(required=True),
    'nom':    fields.String(required=True),
    'email':  fields.String(required=True),
    'message': fields.String(required=True),
})


@api.route('/contact')
class ContactResource(Resource):
    @api.expect(contact_model)
    def post(self):
        data = flask_request.get_json(silent=True) or {}

        prenom  = (data.get('prenom') or '').strip()
        nom     = (data.get('nom')    or '').strip()
        email   = (data.get('email')  or '').strip()
        message = (data.get('message') or '').strip()

        if not all([prenom, nom, email, message]):
            return {'error': 'Tous les champs sont obligatoires.'}, 400

        if len(message) > 2000:
            return {'error': 'Message trop long.'}, 400

        resend.api_key = current_app.config.get('RESEND_API_KEY', '')

        try:
            resend.Emails.send({
                'from': 'Synapses ESMS <contact@iakoa.fr>',
                'to':   ['vieilledent.adrien@gmail.com'],
                'reply_to': email,
                'subject': f'[Contact] {prenom} {nom}',
                'html': f"""
                    <p><strong>Prénom :</strong> {prenom}</p>
                    <p><strong>Nom :</strong> {nom}</p>
                    <p><strong>Email :</strong> {email}</p>
                    <hr />
                    <p>{message.replace(chr(10), '<br/>')}</p>
                """,
            })
        except Exception as e:
            current_app.logger.error('Resend error: %s', e)
            return {'error': "Erreur lors de l'envoi. Veuillez réessayer."}, 500

        return {'success': True}, 200
