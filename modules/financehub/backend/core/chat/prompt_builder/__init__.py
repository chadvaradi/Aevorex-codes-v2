"""Prompt preprocessor for FinanceHub (rule1 enforcement).
Validates user input and enriches with stock context + template metadata.
"""
from typing import Literal, Dict, Any
from fastapi import HTTPException, status, Depends, Request
from modules.financehub.backend.models.chat import ChatRequest
from modules.financehub.backend.api.deps import get_orchestrator, get_http_client
from modules.financehub.backend.utils.logger_config import get_logger

logger = get_logger("prompt_preprocessor")

PromptType = Literal["summary", "indicator", "news", "hybrid"]

_MIN_LEN = 5  # characters

# --- Helper functions -------------------------------------------------------

def _score_context_relevance(message: str) -> float:
    """Very naive relevance scoring – based on presence of alpha chars & length."""
    if not message:
        return 0.0
    # words that hint finance context
    finance_keywords = [
        "price", "ratio", "earnings", "dividend", "chart", "analysis", "overview",
        "technical", "fundamental", "news", "summary",
    ]
    score = 0.2 if any(k in message.lower() for k in finance_keywords) else 0.0
    score += min(len(message) / 100, 0.8)  # up to +0.8 for longer text
    return round(score, 2)


def _identify_query_type(message: str) -> PromptType:
    """Very shallow classifier."""
    msg = message.lower()
    if any(k in msg for k in ["ma", "rsi", "macd", "bollinger", "moving average"]):
        return "indicator"
    if any(k in msg for k in ["news", "headline"]):
        return "news"
    if any(k in msg for k in ["overview", "summary", "company"]):
        return "summary"
    return "hybrid"


def _select_template_id(prompt_type: PromptType) -> str:
    return {
        "summary": "financehub/system/summary",
        "indicator": "financehub/system/indicator",
        "news": "financehub/system/news",
        "hybrid": "financehub/system/hybrid",
    }[prompt_type]

# ---------------------------------------------------------------------------
async def prompt_preprocessor(
    ticker: str,
    chat_req: ChatRequest,
    request: Request,
    orchestrator=Depends(get_orchestrator),
    http_client=Depends(get_http_client),
) -> Dict[str, Any]:
    """Dependency that validates & enriches the chat prompt per rule1."""

    message = chat_req.message.strip()

    if len(message) < _MIN_LEN:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                            detail="Prompt túl rövid (min 5 karakter).")

    relevance = _score_context_relevance(message)
    if relevance < 0.6:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                            detail="A kérés nem tűnik pénzügyi témájúnak (relevance < 0.6).")

    prompt_type: PromptType = _identify_query_type(message)
    template_id = _select_template_id(prompt_type)

    # Fetch basic stock context (ohlcv, fundamentals, news stub)
    context_block: Dict[str, Any] = {}
    try:
        if orchestrator and http_client:
            basic_data = await orchestrator.get_basic_stock_data(ticker, http_client)
            context_block["ohlcv"] = basic_data or {}
    except Exception as e:
        logger.warning(f"[PromptPreprocessor] Could not fetch stock context: {e}")

    processed = {
        "ticker": ticker,
        "original_message": message,
        "query_type": prompt_type,
        "prompt_template_id": template_id,
        "context_relevance": relevance,
        "data_block": context_block,
    }

    logger.info(
        f"[PromptPreprocessor] Prepared prompt (type={prompt_type}, relevance={relevance}, template={template_id})"
    )
    return processed

# FastAPI dependency alias to keep imports decoupled
async def get_processed_prompt(
    ticker: str,
    chat_req: ChatRequest = Depends(),
    request: Request = None,
    processed=Depends(prompt_preprocessor),
):
    return processed

