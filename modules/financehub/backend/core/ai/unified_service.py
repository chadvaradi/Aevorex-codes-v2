# modules/financehub/backend/core/ai/unified_service.py
"""
Unified AI Service (v1.0)

Single entry point for AI operations. The previous mock streaming implementation
has been removed per no-mock policy. Calls now require a real LLM gateway.
"""
import logging
from typing import AsyncGenerator, Iterable

from modules.financehub.backend.config import settings
from modules.financehub.backend.core.ai.model_selector import select_model
from modules.financehub.backend.core.ai.gateway import OpenRouterGateway
from modules.financehub.backend.core.ai.prompts.system_persona import get_system_persona
from modules.financehub.backend.core.ai.token_utils import estimate_tokens, fit_messages_into_budget

logger = logging.getLogger(__name__)

class UnifiedAIService:
    """Orchestrates AI functionalities against real providers.

    The service does not fabricate responses. If no provider is configured,
    it raises a RuntimeError to respect the no-mock policy.
    """

    def __init__(self):
        logger.info("UnifiedAIService initialized (no-mock mode).")

    async def generate_stock_analysis(self, symbol: str, basic_data: dict, chart_data: dict, fundamentals: dict) -> dict:
        raise RuntimeError("AI analysis not implemented in P0 path – use chat endpoints.")

    async def stream_chat(
        self,
        *,
        http_client,
        ticker: str,
        user_message: str,
        locale: str | None,
        plan: str,
        context_messages: Iterable[dict] | None = None,
        query_type: str = "summary",
        data_block: dict | None = None,
    ) -> AsyncGenerator[str, None]:
        persona = get_system_persona(locale)
        system_message = {"role": "system", "content": persona}

        # build context and select model
        ctx_msgs = list(context_messages or [])
        total_ctx_est = sum(estimate_tokens(m.get("content", "")) for m in ctx_msgs)
        sel = select_model(query_type=query_type, expected_context_tokens=total_ctx_est, plan=plan)  # type: ignore[arg-type]

        # budget: fit last messages into simple budget (input side)
        budget = 12000
        fitted = fit_messages_into_budget(ctx_msgs, budget)

        # optional data block injection (short)
        db_text = ""
        if data_block:
            try:
                ohlcv = data_block.get("ohlcv")
                inds = data_block.get("indicator_history")
                news = data_block.get("latest_news")
                parts = []
                if ohlcv:
                    parts.append(f"Price: {str(ohlcv)[:240]}")
                if inds:
                    parts.append(f"Indicators: {str(inds)[:240]}")
                if news:
                    parts.append(f"News: {str(news)[:240]}")
                db_text = "\n".join(parts)
            except Exception:
                db_text = ""

        user_content = (f"[TICKER:{ticker}]\n" + (db_text + "\n" if db_text else "") + user_message).strip()
        messages = [system_message, *fitted, {"role": "user", "content": user_content}]

        gateway = OpenRouterGateway(http_client)
        async for chunk in gateway.stream_completion(
            model=sel.model_id,
            messages=messages,
            temperature=sel.temperature,
            max_output_tokens=sel.max_output_tokens,
        ):
            yield chunk

# --- Singleton Instance ---
_unified_ai_service_instance = None

def get_unified_ai_service() -> "UnifiedAIService":
    """
    Singleton factory for the UnifiedAIService.
    """
    global _unified_ai_service_instance
    if _unified_ai_service_instance is None:
        _unified_ai_service_instance = UnifiedAIService()
    return _unified_ai_service_instance