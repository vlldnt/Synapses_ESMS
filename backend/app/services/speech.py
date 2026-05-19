from google.cloud import speech

speech_client = None

def init_speech_client(credentials_path):
    global speech_client

    # Use the SpeechClient class to load credentials from a service account file
    speech_client = speech.SpeechClient.from_service_account_file(
        credentials_path
    )

    print("google speech are initialized")


def get_speech_client():
    return speech_client