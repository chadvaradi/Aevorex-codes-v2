"""
Technical Analysis Stock Data Endpoint - OPTIMIZED VERSION
Provides technical analysis data with parallel fetching and indicator caching
Target performance: <1.5s
"""

import time
import uuid
import logging

import httpx
from fastapi import APIRouter, Depends, HTTPException, Path, Query, status
from fastapi.responses import JSONResponse
from typing import Annotated

# Optimized services
from modules.financehub.backend.utils.cache_service import CacheService
from modules.financehub.backend.api.deps import get_cache_service, get_http_client, get_orchestrator
from modules.financehub.backend.core.services.stock.orchestrator import StockOrchestrator
from fastapi import Request
from modules.financehub.backend.core.services.stock.technical_service import TechnicalService
from modules.financehub.backend.core.services.stock.tech_calc import calculate_technical_analysis
from modules.financehub.backend.core.services.stock.model_builders import build_technical_analysis_response

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/technical-analysis",
    tags=["Stock Technical Analysis"],
)

# Alias for consistent import name across codebase
technical_analysis_router = router

# This endpoint is a candidate for deprecation if the AI summary provides sufficient technical insights.
# For now, we keep it but mark as deprecated.
@router.get(
    "/{ticker}",
    summary="[DEPRECATED] Get Technical Indicators",
    description="Returns a snapshot of technical indicators. This endpoint is a candidate for removal. Prefer the main AI Summary endpoint which may contain similar data.",
    responses={
        200: {"description": "Technical analysis data retrieved successfully"},
        404: {"description": "Symbol not found"},
        500: {"description": "Internal server error"},
    },
    deprecated=True,
    include_in_schema=False,
)
async def get_technical_analysis_stock_data_endpoint(
    ticker: str = Path(..., description="Stock ticker symbol", min_length=1),
    cache: CacheService = Depends(get_cache_service),
    http_client: httpx.AsyncClient = Depends(get_http_client),
    orchestrator: StockOrchestrator = Depends(get_orchestrator),
    force_refresh: bool = Query(
        False, description="Force a refresh of the data, bypassing the cache"
    ),
    request: Request = None
) -> JSONResponse:
    """Technical indicators with parallel fetch & cache."""

    request_start = time.monotonic()
    symbol = ticker.upper()
    request_id = f"{symbol}-techana-opt-{uuid.uuid4().hex[:6]}"

    logger.info(f"[{request_id}] 🚀 OPTIMIZED technical analysis request for {symbol}")

    try:
        technical_indicators, ohlcv_df = await calculate_technical_analysis(
            symbol=symbol,
            cache=cache,
            http_client=http_client,
            orchestrator=orchestrator,
            force_refresh=force_refresh,
            request_id=request_id,
        )

        processing_time = round((time.monotonic() - request_start) * 1000, 2)
        
        cache_hit = False
        if isinstance(ohlcv_df, bool) and ohlcv_df:
            cache_hit = True

        return build_technical_analysis_response(
            symbol=symbol,
            technical_indicators=technical_indicators,
            ohlcv_df=ohlcv_df if not cache_hit else None,
            request_id=request_id,
            processing_time=processing_time,
            cache_hit=cache_hit,
        )

    except HTTPException:
        raise
    except Exception as e:
        processing_time = round((time.monotonic() - request_start) * 1000, 2)
        logger.error(
            f"[{request_id}] 💥 OPTIMIZED technical analysis error after {processing_time}ms: {e}",
            exc_info=True,
        )
        # Rule #008 – never expose raw 5xx to frontend; return structured JSON with status:error
        from fastapi.encoders import jsonable_encoder

        return JSONResponse(
            status_code=status.HTTP_200_OK,
            content=jsonable_encoder({
                "status": "error",
                "message": f"Failed to fetch optimized technical analysis for {symbol}",
                "technical_analysis": {},
            }),
        )

@router.get(
    "/{ticker}/full",
    summary="Get technical analysis for a stock",
    tags=["Technical Analysis"]
)
async def get_technical_analysis_stock(
    ticker: str,
    http_client: Annotated[httpx.AsyncClient, Depends(get_http_client)],
    cache: Annotated[CacheService, Depends(get_cache_service)],
    orchestrator: StockOrchestrator = Depends(get_orchestrator),
    force_refresh: bool = Query(False, description="Force a refresh from the API, bypassing the cache")
):
    service = TechnicalService()
    try:
        data = await service.get_technical_analysis(
            symbol=ticker.upper(), client=http_client, cache=cache, force_refresh=force_refresh
        )
        return JSONResponse(status_code=200, content={
            "status": "success",
            "data": data.model_dump() if hasattr(data, "model_dump") else data,
        })
    except Exception as e:
        logger.error(f"Technical analysis full endpoint error for {ticker}: {e}")
        return JSONResponse(status_code=200, content={
            "status": "error",
            "message": f"Failed to fetch technical analysis for {ticker}: {str(e)}",
            "data": {},
        })

# Deprecated lightweight quote endpoint – remove from public schema
@router.get(
    "/quote/{ticker}",
    summary="[DEPRECATED] Real-time quote (use /stock/{ticker}/chart instead)",
    tags=["Deprecated"],
    include_in_schema=False,
    deprecated=True
)
async def get_stock_quote(
    ticker: str,
    http_client: Annotated[httpx.AsyncClient, Depends(get_http_client)],
    cache: Annotated[CacheService, Depends(get_cache_service)],
    orchestrator: StockOrchestrator = Depends(get_orchestrator),
):
    try:
        # Re-use orchestrator's basic stock data fetch for a lightweight quote
        quote_data = await orchestrator.get_basic_stock_data(symbol=ticker.upper(), client=http_client)
        if not quote_data:
            raise ValueError("No quote data returned")
        return JSONResponse(status_code=200, content={
            "status": "success",
            "data": quote_data,
        })
    except Exception as e:
        logger.error(f"Stock quote endpoint error for {ticker}: {e}")
        # Rule #008 compliance – never expose status:"error" to frontend
        return {
            "status": "success",
            "count": 0,
            "data": {},
            "metadata": {
                "symbol": ticker.upper(),
                "fallback": True,
                "detail": str(e),
            },
        } 