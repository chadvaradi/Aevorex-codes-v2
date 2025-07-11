"""
Handler for the legacy AI summary streaming endpoint.
"""
import uuid
import httpx
from fastapi import BackgroundTasks
from fastapi.responses import StreamingResponse

from modules.financehub.backend.utils.cache_service import CacheService
from modules.financehub.backend.core.orchestrator import StockOrchestrator as _OrchestratorModule
orchestrator = _OrchestratorModule(cache=None)
from modules.financehub.backend.api.endpoints.stock_endpoints.premium.ai_summary.handlers.helpers import generate_prompt_from_template, stream_openai_response

async def handle_legacy_summary_stream(
    ticker: str,
    force_refresh: bool,
    cache: CacheService,
    background_tasks: BackgroundTasks,
) -> StreamingResponse:
    """
    Handles the logic for the deprecated AI summary streaming endpoint.
    """
    async with httpx.AsyncClient() as client:
        request_id = f"ai_summary-{ticker.upper()}-{uuid.uuid4().hex[:6]}"
        
        fundamentals_raw, technical_indicators, news_items, ohlcv_df = await orchestrator.fetch_parallel_data(
            symbol=ticker.upper(),
            client=client,
            cache=cache,
            request_id=request_id
        )

        summary_prompt = await generate_prompt_from_template(
            symbol=ticker.upper(),
            company_overview=fundamentals_raw,
            financials_data=fundamentals_raw,
            latest_indicators=technical_indicators,
            news_items=news_items,
        )
        
        return StreamingResponse(
            stream_openai_response(summary_prompt, background_tasks, request_id),
            media_type="text/event-stream"
        ) 