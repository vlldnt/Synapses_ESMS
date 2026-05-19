import json
import queue
import threading
from google.cloud import speech
from app import sock
from app.services.speech import get_speech_client

def register_audio_socket(app):
    # register the websocket on the same path the frontend expects
    @sock.route("/api/transcribe-ws")
    def audio_ws(ws):
        print("[audio_ws] connection established")
        try:
            client_addr = ws.environ.get('REMOTE_ADDR') if hasattr(ws, 'environ') else None
        except Exception:
            client_addr = None
        print(f"[audio_ws] client: {client_addr}")

        speech_client = get_speech_client()

        if not speech_client:

            ws.send(json.dumps({
                "type": "error",
                "message": "Speech client unavaible"
            }))
            return
        
        lang = "fr-FR"

        Streaming_config = speech.StreamingRecognitionConfig(
            config= speech.RecognitionConfig(
                encoding=speech.RecognitionConfig.AudioEncoding.LINEAR16,
                sample_rate_hertz=16000,
                language_code=lang,
                enable_automatic_punctuation=True,
                model="latest_long",
            ),
            interim_results=True,
        )

        request_queue = queue.Queue()
        stop_event = threading.Event()

        def request_generator():
            while not stop_event.is_set():
                chunk = request_queue.get()
                if chunk is None:
                    break
                yield speech.StreamingRecognizeRequest(audio_content=chunk)

        def response_worker():
            try:
                responses = speech_client.streaming_recognize(Streaming_config, request_generator())
                for response in responses:
                    for result in response.results:
                        transcript = (
                            result.alternatives[0].transcript
                            if result.alternatives
                            else ""
                        )
                        if transcript:
                            try:
                                ws.send(json.dumps({
                                    "type": (
                                        "final"
                                        if result.is_final
                                        else "interim"
                                    ),
                                    "text": transcript
                                }))
                            except Exception as send_err:
                                print(f"[audio_ws] send failed: {send_err}")
                                return
            except Exception as err:
                print(f"[audio_ws] speech error: {err}")
                try:
                    ws.send(json.dumps({"type": "error", "message": str(err)}))
                except Exception:
                    pass

        response_thread = threading.Thread(target=response_worker, daemon=True)
        response_thread.start()

        try:
            while True:
                message = ws.receive()
                if message is None:
                    print("[audio_ws] receive returned None — client closed connection")
                    break

                # log message type
                print(f"[audio_ws] got message type: {type(message)}; length: {len(message) if hasattr(message, '__len__') else 'n/a'}")

                if isinstance(message, str):
                    try:
                        data = json.loads(message)
                        if data.get('type') == "start":
                            lang = data.get("lang", "fr-FR")
                            ws.send(json.dumps({"type": "started"}))
                        elif data.get("type") == "stop":
                            ws.send(json.dumps({"type": "stopped"}))
                            break
                    except Exception:
                        continue

                elif isinstance(message, bytes):
                    request_queue.put(message)
        except Exception as error:
            print(f"[audio_ws] ws error: {error}")
            try:
                ws.send(json.dumps({
                    "type": "error",
                    "message": str(error)
                }))
            except:
                pass
        finally:
            stop_event.set()
            request_queue.put(None)
            response_thread.join(timeout=2)
            print("[audio_ws] connection closed")