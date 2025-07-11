"""
Stock Endpoints Module
Modular structure for stock-related API endpoints
"""
from fastapi import APIRouter

from .ticker_tape import router as ticker_tape_router
from .chart import router as chart_router
from .fundamentals import router as fundamentals_router
from .news import router as news_router
from .premium import router as premium_router
from .search import router as search_router
from .chat import router as chat_router
from .esg import router as esg_router

# Create main stock router with redirect_slashes disabled so that both trailing
# and non-trailing slash variants work without triggering 307 redirects.
stock_router = APIRouter(redirect_slashes=False)

# Include all sub-routers
stock_router.include_router(search_router)
stock_router.include_router(chat_router, prefix="/chat")
stock_router.include_router(chart_router)
stock_router.include_router(fundamentals_router)
stock_router.include_router(news_router)
stock_router.include_router(esg_router)
stock_router.include_router(premium_router)
stock_router.include_router(ticker_tape_router)

# ---------------------------------------------------------------------------
# Legacy alias routes – map old paths to new premium endpoints to maintain
# backward-compatibility without breaking the no-mock policy. These wrappers
# simply delegate to the real handler functions so we avoid duplicating logic.
# ---------------------------------------------------------------------------

from fastapi import Request, Query, Depends, status, Path
import httpx
from modules.financehub.backend.api.deps import get_http_client, get_cache_service
from modules.financehub.backend.utils.cache_service import CacheService
from modules.financehub.backend.core.orchestrator.orchestrator import StockOrchestrator
from modules.financehub.backend.models.stock import FinBotStockResponse

# Re-use existing business-logic handlers
from .premium.ai_summary.handlers.summary_handler import handle_get_ai_summary
from .premium.technical_analysis.technical_analysis_stock import (
    calculate_technical_analysis,
)
from .premium.technical_analysis.technical_analysis_stock import get_technical_analysis_stock


@stock_router.get(
    "/{ticker}/summary",
    summary="[ALIAS] AI-generated stock summary (legacy path)",
    status_code=status.HTTP_200_OK,
    tags=["AI Analysis"],
    include_in_schema=False,
)
async def get_ai_summary_alias(
    ticker: str,
    request: Request,
    force_refresh: bool = Query(False, description="Force refresh and bypass cache"),
    http_client: httpx.AsyncClient = Depends(get_http_client),
    cache: CacheService = Depends(get_cache_service),
):
    """Back-compat wrapper around premium /stock/premium/{ticker}/summary."""
    return await handle_get_ai_summary(
        ticker=ticker,
        force_refresh=force_refresh,
        http_client=http_client,
        cache=cache,
        request=request,
    )


@stock_router.get(
    "/{ticker}/technical",
    summary="[ALIAS] Technical analysis snapshot (legacy path)",
    status_code=status.HTTP_200_OK,
    tags=["Technical Analysis"],
    include_in_schema=False,
)
async def get_technical_alias(
    ticker: str,
    force_refresh: bool = Query(False, description="Force refresh and bypass cache"),
    http_client: httpx.AsyncClient = Depends(get_http_client),
    cache: CacheService = Depends(get_cache_service),
):
    """Wrapper that delegates to the optimized technical analysis service."""
    orchestrator = StockOrchestrator(cache=cache)
    indicators, ohlcv_df = await calculate_technical_analysis(
        symbol=ticker.upper(),
        cache=cache,
        http_client=http_client,
        orchestrator=orchestrator,
        force_refresh=force_refresh,
        request_id=f"{ticker}-tech-alias",
    )

    from modules.financehub.backend.core.services.stock.model_builders import (
        build_technical_analysis_response,
    )

    return build_technical_analysis_response(
        symbol=ticker.upper(),
        technical_indicators=indicators,
        ohlcv_df=ohlcv_df,
        request_id=f"{ticker}-tech-alias",
        processing_time=0.0,
        cache_hit=False,
    )

# ---------------------------------------------------------------------------
# Alias – GET /stock/{ticker}/technical  → premium technical-analysis handler
# ---------------------------------------------------------------------------


@stock_router.get(
    "/{ticker}/technical",
    summary="[ALIAS] Technical analysis snapshot (legacy path)",
    tags=["Technical Analysis"],
    include_in_schema=False,
)
async def get_technical_analysis_alias(
    ticker: str,
    request: Request,
    force_refresh: bool = Query(False, description="Force refresh and bypass cache"),
    http_client: httpx.AsyncClient = Depends(get_http_client),
    cache: CacheService = Depends(get_cache_service),
    orchestrator: StockOrchestrator = Depends(get_orchestrator),
):
    # Call the fully-fledged premium handler under /premium/technical-analysis/{ticker}/full
    return await get_technical_analysis_stock(
        ticker=ticker,
        http_client=http_client,
        cache=cache,
        orchestrator=orchestrator,
        force_refresh=force_refresh,
    )


@stock_router.get("/{ticker}", response_model=FinBotStockResponse, summary="Get aggregated stock data for ticker")
async def get_aggregated_stock(
    ticker: str = Path(..., description="Stock ticker symbol"),
    client: httpx.AsyncClient = Depends(get_http_client),
    cache: CacheService = Depends(get_cache_service),
    force_refresh: bool = Query(False, description="Force refresh from sources")
):
    orchestrator = StockOrchestrator()
    return await orchestrator.process_premium_stock_data(ticker, client, cache, force_refresh=force_refresh)

__all__ = ["stock_router"]

