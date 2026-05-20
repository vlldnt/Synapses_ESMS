import resend
from flask import current_app, render_template

class MailService:

    @staticmethod
    def send_email(to, first_name, last_name, org_name,  setPasswordUrl):

        resend.api_key = current_app.config["RESEND_API_KEY"]

        html = render_template(
            "email_admin.html",
            first_name=first_name,
            last_name=last_name,
            org_name=org_name,
            setPasswordUrl=setPasswordUrl
        )

        parameter = {
            "from": current_app.config["ADMIN_EMAIL"],
            "to": [to] if isinstance(to, str) else to,
            "subject": "📬 Créez votre compte - Synapses ESMS",
            "html": html
        }

        return resend.Emails.send(parameter)