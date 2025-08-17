"""Prompt preprocessor for FinanceHub (rule1 enforcement).
Validates user input and enriches with stock context + template metadata.
"""
from typing import Literal, Dict, Any
from fastapi import HTTPException, status, Depends, Request
from modules.financehub.backend.models.chat import ChatRequest
from modules.financehub.backend.api.deps import (
    get_orchestrator,
    get_http_client,
    get_cache_service,
)
from modules.financehub.backend.utils.cache_service import CacheService
from modules.financehub.backend.core.services.chat_data_service import ChatDataService
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
    cache: CacheService = Depends(get_cache_service),
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

    # Fetch enriched stock context (ohlcv, indicators, fundamentals, news)
    context_block: Dict[str, Any] = {}
    try:
        chat_data_service = ChatDataService()
        # Best-effort parallel data aggregation (uses cache-aware services under the hood)
        model_resp = await chat_data_service.get_stock_data_for_chat(
            symbol=ticker,
            client=http_client,
            cache=cache,
            force_refresh=False,
        )
        if model_resp:
            # Map to compact data_block required by Rule #1
            try:
                # Latest OHLCV / small history sample
                context_block["ohlcv"] = (
                    (model_resp.latest_ohlcv.model_dump() if hasattr(model_resp.latest_ohlcv, "model_dump") else dict(model_resp.latest_ohlcv))
                    if getattr(model_resp, "latest_ohlcv", None) else {}
                )
            except Exception:
                context_block["ohlcv"] = {}
            try:
                # Indicators (latest + optional history)
                ta = getattr(model_resp, "technical_analysis", None)
                context_block["indicator_history"] = ta.model_dump() if hasattr(ta, "model_dump") and ta else {}
            except Exception:
                context_block["indicator_history"] = {}
            try:
                # Fundamentals (company overview + key financials skeleton)
                co = getattr(model_resp, "company_overview", None)
                fin = getattr(model_resp, "financials", None)
                fundamentals: Dict[str, Any] = {}
                if co:
                    fundamentals.update(co.model_dump() if hasattr(co, "model_dump") else dict(co))
                if fin:
                    fundamentals["balance_sheet"] = getattr(fin, "balance_sheet", None)
                    fundamentals["income_statement"] = getattr(fin, "income_statement", None)
                    fundamentals["cash_flow"] = getattr(fin, "cash_flow", None)
                context_block["fundamentals"] = fundamentals
            except Exception:
                context_block["fundamentals"] = {}
            try:
                # Latest news (titles only, trimmed)
                news = getattr(model_resp, "news", None)
                items = getattr(news, "items", None) if news else None
                if items:
                    context_block["latest_news"] = [
                        {"title": (it.get("title") if isinstance(it, dict) else getattr(it, "title", None)),
                         "published_at": (it.get("published_at") if isinstance(it, dict) else getattr(it, "published_at", None))}
                        for it in list(items)[:10]
                    ]
                else:
                    context_block["latest_news"] = []
            except Exception:
                context_block["latest_news"] = []
    except Exception as e:
        logger.warning(f"[PromptPreprocessor] Could not build enriched context: {e}")

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

