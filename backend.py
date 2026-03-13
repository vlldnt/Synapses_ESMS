from fastapi import FastAPI
from fastapi import HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel
import httpx
import os

app = FastAPI()
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://127.0.0.1:11434")
OLLAMA_CHAT_URL = f"{OLLAMA_BASE_URL}/api/chat"
OLLAMA_TAGS_URL = f"{OLLAMA_BASE_URL}/api/tags"
MODEL = os.getenv("OLLAMA_MODEL")

conversation: list[dict] = []


class Message(BaseModel):
    content: str


async def resolve_local_model(client: httpx.AsyncClient) -> str:
    if MODEL:
        return MODEL

    try:
        tags_resp = await client.get(OLLAMA_TAGS_URL)
        tags_resp.raise_for_status()
    except httpx.HTTPError as exc:
        raise HTTPException(
            status_code=503,
            detail=f"Impossible de contacter Ollama sur {OLLAMA_BASE_URL}: {exc}",
        ) from exc

    models = tags_resp.json().get("models", [])
    if not models:
        raise HTTPException(
            status_code=503,
            detail="Aucun modèle local trouvé dans Ollama. Lancez d'abord `ollama pull <model>`.",
        )

    return models[0]["name"]


@app.get("/")
def index():
    return FileResponse("index.html")


@app.post("/chat")
async def chat(msg: Message):
    conversation.append({"role": "user", "content": msg.content})
    async with httpx.AsyncClient(timeout=120) as client:
        selected_model = await resolve_local_model(client)
        try:
            resp = await client.post(
                OLLAMA_CHAT_URL,
                json={
                    "model": selected_model,
                    "messages": conversation,
                    "stream": False,
                },
            )
            resp.raise_for_status()
        except httpx.HTTPStatusError as exc:
            error_text = exc.response.text
            raise HTTPException(
                status_code=502,
                detail=f"Erreur Ollama: {error_text}",
            ) from exc
        except httpx.HTTPError as exc:
            raise HTTPException(
                status_code=503,
                detail=f"Erreur de connexion à Ollama: {exc}",
            ) from exc

    data = resp.json()
    assistant_msg = data.get("message", {}).get("content")
    if not assistant_msg:
        raise HTTPException(
            status_code=502,
            detail=f"Réponse Ollama invalide: {data}",
        )

    conversation.append({"role": "assistant", "content": assistant_msg})
    return {"response": assistant_msg}


@app.post("/reset")
def reset():
    conversation.clear()
    return {"status": "ok"}
