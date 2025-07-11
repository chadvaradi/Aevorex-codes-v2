from fastapi import FastAPI, APIRouter

app = FastAPI(title="AEVOREX AIHub API", version="0.1.0")

router = APIRouter(prefix="/api/v1/aihub", tags=["AIHub"])


@router.get("/health")
async def health_check():
    """Simple health endpoint for liveness probes."""
    return {"status": "ok"}


@router.get("/models")
async def get_available_models():
    """Get list of available AI models for AIHub."""
    return {
        "models": [
            {"id": "gpt-4", "name": "GPT-4", "provider": "openai"},
            {"id": "claude-3", "name": "Claude 3", "provider": "anthropic"},
            {"id": "gemini-pro", "name": "Gemini Pro", "provider": "google"}
        ]
    }


@router.post("/chat")
async def chat_endpoint(message: dict):
    """Basic chat endpoint for AIHub conversations."""
    return {
        "response": f"AIHub received: {message.get('content', 'No message')}",
        "model": "gpt-4",
        "timestamp": "2025-06-20T11:30:00Z"
    }


app.include_router(router)

__all__ = ["app"] 