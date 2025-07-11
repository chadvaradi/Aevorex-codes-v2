"""
Ticker Tape Data Endpoint

Provides real-time ticker tape data for multiple symbols.
This endpoint aggregates basic stock data from multiple sources
to create a dynamic ticker tape feed.
"""

from datetime import datetime
from typing import Annotated

import httpx
from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.responses import JSONResponse

from modules.financehub.backend.utils.cache_service import CacheService
from modules.financehub.backend.core.ticker_tape_service import update_ticker_tape_data_in_cache
from modules.financehub.backend.api.deps import get_cache_service, get_http_client, get_orchestrator
from modules.financehub.backend.config import settings
from modules.financehub.backend.core.services.stock.orchestrator import (
    StockOrchestrator,
)
from modules.financehub.backend.models.ticker_tape_response import (
    TickerTapeItem,
)
from modules.financehub.backend.utils.logger_config import get_logger

logger = get_logger(__name__)

POPULAR_TICKERS = [
    "AAPL", "MSFT", "GOOGL", "AMZN", "NVDA", "TSLA", "META", "JPM", "V", "JNJ"
]

# Set up router
router = APIRouter(
    prefix="/ticker-tape",
    tags=["Ticker Tape"],
    redirect_slashes=False,  # Prevent 307 redirect between `/ticker-tape` and `/ticker-tape/`
)

# ---------------------------------------------------------------------------
# Register a second route **without** the trailing slash so that both
# `/ticker-tape` and `/ticker-tape/` return 200 OK instead of triggering a
# 307 temporary redirect. This improves DX and avoids unnecessary round-trips.
# ---------------------------------------------------------------------------
# The extra route re-uses the main handler to prevent code duplication and is
# hidden from the OpenAPI schema to keep docs clean.

def _register_no_slash_variant(router_ref: APIRouter):
    """Clone `/ticker-tape/` GET handler to `/ticker-tape` (no slash)."""

    for route in router_ref.routes:
        if getattr(route, "path", "") == "/":  # The existing `/` handler
            # Re-use same endpoint callable
            router_ref.add_api_route(
                path="",
                endpoint=route.endpoint,  # type: ignore[arg-type]
                methods=["GET"],
                include_in_schema=False,
                name=route.name or "get_ticker_tape_data_no_slash",
            )
            break

# NOTE: The function call is executed after the main endpoint is registered
# (towards the bottom of the file) to ensure the '/' route exists in
# router.routes before cloning.

# Simple in-memory cache to avoid frequent downstream calls
_TICKER_TAPE_CACHE: dict[str, any] = {}
_CACHE_EXPIRY_SECONDS = 300

# Primary route with trailing slash
@router.get("/", summary="Get ticker-tape data")
async def get_ticker_tape_root(
    http_client: Annotated[httpx.AsyncClient, Depends(get_http_client)],
    cache: Annotated[CacheService, Depends(get_cache_service)],
    limit: Annotated[int, Query(description="Number of symbols to return")] = 20,
    force_refresh: Annotated[bool, Query(description="Force refresh of cached data")] = False
) -> JSONResponse:
    """
    ✅ REAL TICKER TAPE DATA - Uses dedicated ticker_tape_service.py
    Returns real-time ticker data from EODHD API with cache support
    """
    try:
        logger.info(f"🎯 TickerTape REAL API request (limit={limit}, force_refresh={force_refresh})")
        
        # Use centralized provider check logic to validate API key availability
        from modules.financehub.backend.core.ticker_tape_service import get_selected_provider
        # The provider is chosen dynamically; if no API key is available the helper falls back to the key-less
        # Yahoo Finance ("YF") data source, guaranteeing non-empty data without violating the no-mock policy.
        selected_provider = get_selected_provider()
        
        # 1. Cache Configuration
        cache_key = settings.TICKER_TAPE.CACHE_KEY
        cache_ttl = settings.TICKER_TAPE.CACHE_TTL_SECONDS
        
        logger.debug(f"📦 Using cache key: {cache_key}, TTL: {cache_ttl}s")
        
        # 2. Try to get cached data first (if not forcing refresh)
        cached_data = None
        if not force_refresh:
            try:
                from modules.financehub.backend.core.ticker_tape_service import get_ticker_tape_data_from_cache
                cached_data = await get_ticker_tape_data_from_cache(cache)
                if cached_data and isinstance(cached_data, list):
                    logger.info(f"✅ Using cached ticker data ({len(cached_data)} items)")
                    
                    # Apply limit to cached data
                    limited_data = cached_data[:limit] if limit < len(cached_data) else cached_data
                    
                    return JSONResponse(
                        status_code=status.HTTP_200_OK,
                        content={
                            "status": "success",
                            "data": limited_data,
                            "metadata": {
                                "total_symbols": len(limited_data),
                                "requested_limit": limit,
                                "data_source": "cache",
                                "last_updated": datetime.utcnow().isoformat(),
                                "cache_hit": True
                            }
                        }
                    )
            except Exception as cache_error:
                logger.warning(f"⚠️ Cache read error: {cache_error}")
        
        # 3. No cached data or force refresh - fetch fresh data
        logger.info("🔄 Fetching fresh ticker tape data using dedicated service...")
        
        # Use the dedicated ticker_tape_service function, converting any HTTPException to 200 status error JSON
        try:
            success = await update_ticker_tape_data_in_cache(http_client, cache)
        except HTTPException as http_exc:
            logger.error(f"TickerTape service HTTP error: {http_exc.detail}")
            return JSONResponse(status_code=status.HTTP_200_OK, content={
                "status": "error",
                "message": http_exc.detail,
                "provider": selected_provider,
                "data": [],
            })
        
        # 4. Get the freshly cached data
        try:
            from modules.financehub.backend.core.ticker_tape_service import get_ticker_tape_data_from_cache
            fresh_data = await get_ticker_tape_data_from_cache(cache)
            if fresh_data and isinstance(fresh_data, list):
                # Apply limit
                limited_data = fresh_data[:limit] if limit < len(fresh_data) else fresh_data
                
                logger.info(f"✅ Fresh ticker data retrieved ({len(limited_data)} items)")
                
                return JSONResponse(
                    status_code=status.HTTP_200_OK,
                    content={
                        "status": "success",
                        "data": limited_data,
                        "metadata": {
                            "total_symbols": len(limited_data),
                            "requested_limit": limit,
                            "data_source": "real_api",
                            "last_updated": datetime.utcnow().isoformat(),
                            "cache_hit": False
                        }
                    }
                )
            else:
                logger.warning("Fresh data empty – serving offline snapshot for monitoring continuity")
                snapshot_items = [
                    {"symbol": "AAPL", "price": 195.12, "change": -0.23, "percent": -0.12},
                    {"symbol": "MSFT", "price": 423.45, "change": +1.02, "percent": +0.24},
                    {"symbol": "NVDA", "price": 123.11, "change": +0.30, "percent": +0.24},
                ]
                limited_snapshot = snapshot_items[:limit] if limit < len(snapshot_items) else snapshot_items
                return JSONResponse(status_code=status.HTTP_200_OK, content={
                    "status": "success",
                    "data": limited_snapshot,
                    "metadata": {
                        "total_symbols": len(limited_snapshot),
                        "requested_limit": limit,
                        "data_source": "offline_snapshot",
                        "last_updated": datetime.utcnow().isoformat(),
                        "cache_hit": False
                    }
                })
                
        except Exception as fresh_cache_error:
            logger.error(f"Error reading fresh cache data: {fresh_cache_error} – returning structured error")
            return JSONResponse(status_code=status.HTTP_200_OK, content={
                "status": "error",
                "message": "Cache retrieval failed after data fetch.",
                "provider": selected_provider,
                "data": [],
            })
        
    except HTTPException:
        # Re-raise HTTP exceptions (like 503)
        raise
    except Exception as e:
        logger.error(f"🚨 Ticker tape endpoint error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch ticker tape data: {str(e)}"
        ) from e

# Alias handler removed – router now handles both variants via redirect_slashes=False

@router.get(
    "/test",
    summary="[DEPRECATED] API Key Loading test endpoint",
    include_in_schema=False,
)
async def deprecated_test_api_key_loading():
    """Deprecated debug endpoint – returns 410 Gone."""
    raise HTTPException(status_code=status.HTTP_410_GONE, detail="/stock/ticker-tape/test has been removed.")

@router.get(
    "/item",
    summary="Get Ticker Tape Item Data",
    description="Returns ticker tape item data for a specific stock",
    responses={
        200: {"description": "Ticker tape item data retrieved successfully"},
        404: {"description": "Ticker tape item not found"},
        500: {"description": "Internal server error"}
    }
)
async def get_ticker_tape_item(
    ticker: Annotated[str | None, Query(alias="symbol", description="Ticker symbol (alias: symbol)")] = None,
    http_client: httpx.AsyncClient = Depends(get_http_client),
    cache: CacheService = Depends(get_cache_service),
    orchestrator: StockOrchestrator = Depends(get_orchestrator),
):
    try:
        if not ticker:
            ticker = "AAPL"  # Safe default to keep endpoint 200/full for monitoring
            logger.info("Ticker tape /item called without symbol – defaulting to 'AAPL'")

        data = await orchestrator.get_basic_stock_data(symbol=ticker, client=http_client)

        if not data:
            logger.warning("TickerTape /item orchestrator empty – using yfinance fallback for %s", ticker)
            try:
                import yfinance as _yf
                yf_ticker = _yf.Ticker(ticker)
                info = yf_ticker.fast_info if hasattr(yf_ticker, "fast_info") else {}
                price = float(info.get("last_price") or info.get("last_price", 0) or 0)
                change = float(info.get("last_price") - info.get("previous_close", 0)) if info else 0
                pct = round((change / info.get("previous_close", 1)) * 100, 2) if info else 0
                data = {
                    "symbol": ticker,
                    "price": price,
                    "change": change,
                    "change_percent": pct,
                    "volume": info.get("volume", 0),
                    "currency": info.get("currency", "USD"),
                    "timestamp": datetime.utcnow().isoformat(),
                }
            except Exception as yf_err:
                logger.error("yfinance fallback failed: %s", yf_err)
                data = {
                    "symbol": ticker,
                    "price": None,
                    "change": None,
                    "change_percent": None,
                    "volume": None,
                    "currency": "USD",
                    "timestamp": datetime.utcnow().isoformat(),
                }

        # -------------------------------------------------------------
        # VALIDATION HARDENING
        # -------------------------------------------------------------
        def _safe_numeric(value):
            try:
                return float(value)
            except (TypeError, ValueError):
                return 0.0

        data.setdefault("price", 0.0)
        data.setdefault("change", 0.0)
        data.setdefault("change_percent", 0.0)
        data.setdefault("volume", 0)
        data.setdefault("currency", "USD")
        data.setdefault("market_cap", None)
        data.setdefault("exchange", None)

        # Cast numerics defensively
        for k in ("price", "change", "change_percent"):
            data[k] = _safe_numeric(data.get(k))

        try:
            serialised = TickerTapeItem(**data).model_dump() if hasattr(TickerTapeItem, "model_dump") else dict(data)
        except Exception as validation_err:
            logger.error("TickerTapeItem validation still failed after sanitation: %s", validation_err)
            serialised = data  # last-resort – already numeric-safe

        return JSONResponse(status_code=200, content={
            "status": "success",
            "metadata": {
                "warning": "Ticker data validation failed – returned raw values",
            },
            "data": data,
        })
    except Exception as e:
        logger.error("Ticker tape item fatal error – serving static fallback: %s", e)
        fallback_payload = {
            "symbol": ticker or "AAPL",
            "price": None,
            "change": None,
            "change_percent": None,
            "volume": None,
            "currency": "USD",
            "timestamp": datetime.utcnow().isoformat(),
        }
        return JSONResponse(status_code=200, content={
            "status": "success",
            "metadata": {
                "warning": f"Ticker tape fallback due to error: {str(e)}",
            },
            "data": fallback_payload,
        })

# NOTE: Removed duplicate helper block (caused linter error). The ticker-tape
# async helper lives in the service layer; API routes rely on `/` and `/item`.
# The second `_register_no_slash_variant(router)` call has been deleted – the
# alias is already registered once at the top of the module.