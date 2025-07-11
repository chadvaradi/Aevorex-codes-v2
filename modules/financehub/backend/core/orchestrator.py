"""
Aevorex FinBot - Stock Data Orchestrator v1

Centralized orchestration layer for stock data fetching, processing, and AI analysis.
Replaces the monolithic stock_data_service.py with a clean, step-based pipeline.
"""

import asyncio
from typing import Any
from datetime import datetime

import httpx

from modules.financehub.backend.utils.logger_config import get_logger
from modules.financehub.backend.utils.cache_service import CacheService
from modules.financehub.backend.core.fetchers import get_fetcher
from modules.financehub.backend.core.ai.unified_service import UnifiedAIService

logger = get_logger("aevorex_finbot.core.orchestrator")


class StockOrchestrator:
    """
    Orchestrates the complete stock data pipeline:
    1. Cache check
    2. Parallel data fetching (fundamentals, OHLCV, news)
    3. Data mapping and validation
    4. AI analysis (if requested)
    5. Response building
    """

    def __init__(self, cache: CacheService, ai_service: UnifiedAIService):
        self.cache = cache
        self.ai_service = ai_service
        self._http_client: httpx.AsyncClient | None = None

    async def _get_http_client(self) -> httpx.AsyncClient:
        """Get or create HTTP client for API calls."""
        if self._http_client is None:
            self._http_client = httpx.AsyncClient(timeout=30.0)
        return self._http_client

    async def run(
        self,
        ticker: str,
        *,
        force_refresh: bool = False,
        include_ai: bool = True,
        request_id: str = None,
    ) -> dict[str, Any]:
        """
        Main orchestration method.
        
        Args:
            ticker: Stock symbol to fetch data for
            force_refresh: Skip cache and force fresh data fetch
            include_ai: Whether to include AI analysis
            request_id: Unique request identifier for logging
            
        Returns:
            Complete stock data response
        """
        if not request_id:
            request_id = f"orchestrator_{ticker}_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
            
        logger.info(f"[{request_id}] Starting orchestration for {ticker}")
        
        try:
            # Step 1: Cache check
            if not force_refresh:
                cached_data = await self._check_cache(ticker, request_id)
                if cached_data:
                    logger.info(f"[{request_id}] Returning cached data for {ticker}")
                    return cached_data

            # Step 2: Parallel data fetching
            client = await self._get_http_client()
            
            logger.info(f"[{request_id}] Starting parallel data fetch for {ticker}")
            
            # Run fetchers in parallel
            tasks = [
                self._fetch_fundamentals(ticker, client, request_id),
                self._fetch_ohlcv(ticker, client, request_id),
                self._fetch_news(ticker, client, request_id) if include_ai else None,
            ]
            
            # Filter out None tasks
            tasks = [task for task in tasks if task is not None]
            
            results = await asyncio.gather(*tasks, return_exceptions=True)
            
            fundamentals_data = results[0] if len(results) > 0 else None
            ohlcv_data = results[1] if len(results) > 1 else None
            news_data = results[2] if len(results) > 2 else None
            
            # Step 3: Data validation and building
            response_data = await self._build_response(
                ticker=ticker,
                fundamentals=fundamentals_data,
                ohlcv=ohlcv_data,
                news=news_data,
                request_id=request_id,
            )
            
            # Step 4: AI analysis (if requested)
            if include_ai and response_data:
                try:
                    ai_summary = await self._generate_ai_summary(response_data, request_id)
                    if ai_summary:
                        response_data["ai_summary"] = ai_summary
                except Exception as ai_error:
                    logger.error(f"[{request_id}] AI analysis failed: {ai_error}")
                    # Continue without AI - don't fail the entire request
            
            # Step 5: Cache successful response
            if response_data:
                await self._cache_response(ticker, response_data, request_id)
            
            logger.info(f"[{request_id}] Orchestration completed for {ticker}")
            return response_data or {}
            
        except Exception as error:
            logger.error(f"[{request_id}] Orchestration failed for {ticker}: {error}", exc_info=True)
            return {"error": str(error), "ticker": ticker}
        
        finally:
            # Cleanup
            if self._http_client:
                await self._http_client.aclose()
                self._http_client = None

    async def _check_cache(self, ticker: str, request_id: str) -> dict[str, Any] | None:
        """Check cache for existing data."""
        cache_key = f"stock_data:{ticker}"
        try:
            cached = await self.cache.get(cache_key)
            if cached:
                logger.debug(f"[{request_id}] Cache hit for {ticker}")
                return cached
        except Exception as cache_error:
            logger.warning(f"[{request_id}] Cache check failed: {cache_error}")
        return None

    async def _fetch_fundamentals(self, ticker: str, client: httpx.AsyncClient, request_id: str) -> dict[str, Any] | None:
        """Fetch fundamental data."""
        try:
            fetcher = await get_fetcher("yfinance", client, self.cache)
            return await fetcher.fetch_fundamentals(ticker)
        except Exception as error:
            logger.error(f"[{request_id}] Fundamentals fetch failed: {error}")
            return None

    async def _fetch_ohlcv(self, ticker: str, client: httpx.AsyncClient, request_id: str) -> dict[str, Any] | None:
        """Fetch OHLCV data."""
        try:
            fetcher = await get_fetcher("yfinance", client, self.cache)
            df = await fetcher.fetch_ohlcv(ticker, period="1y", interval="1d")
            if df is not None and not df.empty:
                return df.to_dict('records')
        except Exception as error:
            logger.error(f"[{request_id}] OHLCV fetch failed: {error}")
        return None

    async def _fetch_news(self, ticker: str, client: httpx.AsyncClient, request_id: str) -> dict[str, Any] | None:
        """Fetch news data."""
        try:
            fetcher = await get_fetcher("yfinance", client, self.cache)
            return await fetcher.fetch_news(ticker)
        except Exception as error:
            logger.error(f"[{request_id}] News fetch failed: {error}")
        return None

    async def _build_response(
        self,
        ticker: str,
        fundamentals: dict[str, Any] | None,
        ohlcv: dict[str, Any] | None,
        news: dict[str, Any] | None,
        request_id: str,
    ) -> dict[str, Any]:
        """Build the final response structure."""
        response = {
            "ticker": ticker,
            "timestamp": datetime.now().isoformat(),
            "fundamentals": fundamentals,
            "ohlcv": ohlcv,
            "news": news,
        }
        
        logger.debug(f"[{request_id}] Built response for {ticker}")
        return response

    async def _generate_ai_summary(self, data: dict[str, Any], request_id: str) -> str | None:
        """Generate AI summary of the stock data."""
        try:
            # Placeholder for AI summary generation
            # TODO: Implement AI summary logic using UnifiedAIService
            logger.debug(f"[{request_id}] AI summary generation not implemented yet")
            return None
        except Exception as error:
            logger.error(f"[{request_id}] AI summary generation failed: {error}")
            return None

    async def _cache_response(self, ticker: str, data: dict[str, Any], request_id: str) -> None:
        """Cache the response data."""
        cache_key = f"stock_data:{ticker}"
        try:
            await self.cache.set(cache_key, data, ttl=3600)  # 1 hour TTL
            logger.debug(f"[{request_id}] Cached response for {ticker}")
        except Exception as cache_error:
            logger.warning(f"[{request_id}] Cache set failed: {cache_error}")


def get_orchestrator() -> StockOrchestrator:
    """
    Factory function to create a StockOrchestrator instance.
    """
    # Note: In a real application, you would inject these dependencies
    # For now, we'll create placeholder instances
    cache = CacheService()
    ai_service = UnifiedAIService()
    return StockOrchestrator(cache, ai_service) 