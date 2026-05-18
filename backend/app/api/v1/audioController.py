from flask import request
from flask_restx import Namespace, Resource
from flask_jwt_extended import jwt_required
from google.cloud import speech
from app.services.speech import get_speech_client
from app import limiter

api = Namespace("audio", description="Audio transcription API")

@api.route("/transcribe-ws")
class AudioTranscribe(Resource):
    @jwt_required()
    @limiter.limit("15 par minutes")
    def post(self):

        speech_client = get_speech_client()

        if not speech_client:
            return {
                "error" : "Speech client is unavaible"
            }, 500
        
        try:
            audio_buffer = request.data
            if not audio_buffer:
                return {
                    "transcript": ""
                }
            
            audio = speech.RecognitionAudio(content=audio_buffer)
            config = speech.RecognitionConfig(
                enconding=speech.RecognitionConfig.AudioEncoding.WEBM_OPUS,
                sample_rate_hertz=48000,
                language_code="fr-FR",
                enable_automatic_punctuation=True,
            )

            response = speech_client.recognize(
                config=config,
                audio=audio
            )

            transcript = "".join([
                result.alternatives[0].transcript
                for result in response.results
                if result.alternatives
            ])

            return {
                "transcript": transcript
            }
        
        except Exception as error:
            return {
                "transcription error": str(error)
            }, 500