"""
Stock Data Orchestrator - Main Coordination Service

Extracted from stock_service.py (3,774 LOC) to follow 160 LOC rule.
Handles high-level orchestration and coordination of stock data services.

Responsibilities:
- Main orchestration logic
- Service coordination
- Response assembly
- Error handling
"""

import asyncio
import time
import uuid
from typing import Any
from datetime import datetime, timezone

import httpx
from fastapi import HTTPException, status
import pandas as pd
from modules.financehub.backend.utils.logger_config import get_logger

from modules.financehub.backend.utils.cache_service import CacheService
from modules.financehub.backend.models.stock import (
    FinBotStockResponse, CompanyOverview, FinancialsData, NewsItem, 
    LatestOHLCV
)
from modules.financehub.backend.core.services.stock.fundamentals_service import FundamentalsService
from modules.financehub.backend.core.services.stock.technical_service import TechnicalService
from modules.financehub.backend.core.services.stock.news_service import NewsService
from modules.financehub.backend.core.services.stock.chart_service import ChartService
# TechnicalAnalysis model for isinstance checks
from modules.financehub.backend.models.stock.indicator_models import TechnicalAnalysis
from modules.financehub.backend.core.services.stock.technical_processors import TechnicalProcessor
# Import the new handlers
# Handlers live under core.services.handlers, import explicitly
from modules.financehub.backend.core.services.handlers.company_info_handler import (
    fetch_company_info,
)
from modules.financehub.backend.core.services.handlers.ohlcv_data_handler import (
    fetch_ohlcv_data,
)
from modules.financehub.backend.core.services.handlers.news_data_handler import (
    fetch_news_data,
)

logger = get_logger("aevorex_finbot.StockOrchestrator")

class StockOrchestrator:
    """
    High-level orchestration service for stock data operations.
    
    Coordinates between specialized services to provide unified stock data responses.
    Replaces the monolithic process_premium_stock_data function.
    """
    
    def __init__(self, cache: CacheService | None = None):
        """Create a new orchestrator instance.

        The *cache* argument is optional and kept solely for **back-compatibility**.
        Most of the internal service methods accept an explicit ``cache`` parameter,
        therefore we store the received instance so that callers that depend on the
        original signature (e.g. legacy DI wiring in ``api.deps``) continue to work
        without modification.
        """

        # Store cache reference for advanced use-cases; services will still receive
        # the explicit cache instance via method arguments.
        self.cache = cache

        self.fundamentals_service = FundamentalsService()
        self.technical_service = TechnicalService()
        self.news_service = NewsService()
        self.chart_service = ChartService()
        self.tech_processor = TechnicalProcessor()  # For change calculation
    
    async def fetch_parallel_data(
        self,
        symbol: str,
        client: httpx.AsyncClient,
        cache: CacheService,
        request_id: str,
        *,
        force_refresh: bool = False,
        period: str = "1y",
        interval: str = "1d",
    ) -> tuple[dict | None, dict | None, list | None, Any | None]:
        """
        Fetch company info, technicals, news, and OHLCV data in parallel.
        
        Returns:
            Tuple of (company_info, technical_indicators, news_data, ohlcv_data)
        """
        start_time = time.monotonic()
        
        logger.info(f"[{request_id}] Starting parallel data fetch for {symbol}")
        
        try:
            # Execute all fetches in parallel using handlers and services
            tasks = [
                fetch_company_info(symbol, client, cache, request_id),
                self.technical_service.get_technical_analysis(symbol, client, cache, force_refresh=force_refresh),
                fetch_news_data(symbol, client, cache, request_id),
                fetch_ohlcv_data(symbol, period, interval, client, cache, request_id),
            ]
            
            results = await asyncio.gather(*tasks, return_exceptions=True)
            
            company_info = results[0] if not isinstance(results[0], Exception) else None
            technical_indicators = results[1] if not isinstance(results[1], Exception) else None
            news_data = results[2] if not isinstance(results[2], Exception) else None
            ohlcv_data = results[3] if not isinstance(results[3], Exception) else None

            duration = time.monotonic() - start_time
            logger.info(
                f"[{request_id}] Parallel fetch completed in {duration:.2f}s. "
                f"Company: {'✓' if company_info else '✗'}, "
                f"Technicals: {'✓' if technical_indicators else '✗'}, "
                f"News: {'✓' if news_data else '✗'}, "
                f"OHLCV: {'✓' if ohlcv_data is not None else '✗'}"
            )
            
            return company_info, technical_indicators, news_data, ohlcv_data
            
        except Exception as e:
            duration = time.monotonic() - start_time
            logger.error(f"[{request_id}] Parallel fetch failed after {duration:.2f}s: {e}")
            return None, None, None, None
            
    async def process_premium_stock_data(
        self,
        symbol: str,
        client: httpx.AsyncClient,
        cache: CacheService,
        force_refresh: bool = False,
    ) -> FinBotStockResponse:
        """
        Main orchestration method for premium stock data processing.
        
        Coordinates parallel data fetching from multiple services and assembles
        the final response object.
        """
        request_id = f"premium-{symbol}-{uuid.uuid4().hex[:6]}"
        start_time = time.monotonic()
        
        logger.info(f"[{request_id}] Starting premium stock data orchestration for {symbol}")
        
        try:
            # Phase 1: Parallel data fetching
            fetch_tasks = {
                'fundamentals': self.fundamentals_service.get_fundamentals_data(symbol, client, cache),
                'technical': self.technical_service.get_technical_analysis(symbol, client, cache),
                'news': self.news_service.get_news_data(symbol, client, cache),
                'chart': self.chart_service.get_chart_data(symbol, client, cache)
            }
            
            # Execute all tasks concurrently
            fetch_results = await asyncio.gather(
                *fetch_tasks.values(),
                return_exceptions=True
            )
            
            # Phase 2: Process results
            results = {}
            for i, (key, _) in enumerate(fetch_tasks.items()):
                result = fetch_results[i]
                if isinstance(result, Exception):
                    logger.error(f"Task {key} failed with error: {result}")
                    results[key] = None
                else:
                    results[key] = result
            
            # Phase 3: Build response
            response = self.build_response_model(
                symbol=symbol,
                fundamentals_data=results.get('fundamentals'),
                technical_indicators=results.get('technical'),
                news_items=results.get('news'),
                ohlcv_df=results.get('chart')
            )
            
            processing_time = time.monotonic() - start_time
            logger.info(f"[{request_id}] Premium stock data processed in {processing_time:.2f}s")
            
            return response
            
        except Exception as e:
            processing_time = time.monotonic() - start_time
            logger.error(f"[{request_id}] Orchestration failed after {processing_time:.2f}s: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to process stock data for {symbol}: {str(e)}"
            ) from e
    
    async def get_unified_stock_data(
        self,
        symbol: str,
        client: httpx.AsyncClient,
        cache: CacheService,
        include_chart: bool = True
    ) -> dict[str, Any]:
        """
        Get unified stock data ensuring consistency across all components.
        
        Simplified version for basic use cases.
        """
        request_id = f"unified-{symbol}-{uuid.uuid4().hex[:6]}"
        
        try:
            # Fetch core.ta concurrently
            tasks = {
                'fundamentals': self.fundamentals_service.get_basic_stock_data(symbol, client, cache),
                'technical': self.technical_service.get_basic_indicators(symbol, client, cache)
            }
            
            if include_chart:
                tasks['chart'] = self.chart_service.get_basic_chart_data(symbol, client, cache)
            
            results = await asyncio.gather(*tasks.values(), return_exceptions=True)
            
            # Process results
            unified_data = {}
            for i, (key, _) in enumerate(tasks.items()):
                result = results[i]
                if isinstance(result, Exception):
                    logger.warning(f"Error fetching {key} data for {symbol}: {result}")
                    unified_data[key] = None
                else:
                    unified_data[key] = result
            
            return unified_data
            
        except Exception as e:
            logger.error(f"[{request_id}] Error getting unified data: {e}")
            return {}

    def build_response_model(
        self,
        symbol: str,
        fundamentals_data: dict[str, Any] | None,
        technical_indicators: dict[str, Any] | None,
        news_items: list[dict[str, Any]] | None,
        ohlcv_df: pd.DataFrame | None,
    ) -> FinBotStockResponse | None:
        """
        Orchestrates the creation of the final FinBotStockResponse model.
        """
        log_prefix = f"[Orchestrator:{symbol}]"
        logger.info(f"{log_prefix} Building final response model from service outputs.")

        try:
            # 1. Process Fundamentals
            company_overview = CompanyOverview(**fundamentals_data.get("company_overview", {})) if fundamentals_data else CompanyOverview()
            financials_data = FinancialsData(**fundamentals_data.get("financials", {})) if fundamentals_data else FinancialsData()

            # 2. Process News – build NewsData container to comply with FinBotStockResponse
            from modules.financehub.backend.models.stock.response_models import NewsData  # local import to avoid circular deps
            processed_news_items = [NewsItem(**item) for item in news_items] if news_items else []
            news_data_obj = NewsData(items=processed_news_items) if processed_news_items else None

            # 3. Process Chart Data (OHLCV) and calculate daily change
            latest_ohlcv_point = None
            if ohlcv_df is not None and not ohlcv_df.empty:
                # Assuming the DataFrame index is datetime
                ohlcv_df_sorted = ohlcv_df.sort_index()
                last_row = ohlcv_df_sorted.iloc[-1]
                latest_ohlcv_point = LatestOHLCV(
                    t=int(last_row.name.timestamp()),
                    o=last_row.get("open", 0),
                    h=last_row.get("high", 0),
                    l=last_row.get("low", 0),
                    c=last_row.get("close", 0),
                    v=last_row.get("volume", 0)
                )
                if len(ohlcv_df_sorted) > 1:
                    prev_close = ohlcv_df_sorted.iloc[-2].get("close")
                    if prev_close and last_row.get("close"):
                         ((last_row.get("close") - prev_close) / prev_close) * 100

            # 4. Build TechnicalAnalysis model (optional)
            technical_analysis_obj = None
            if technical_indicators:
                try:
                    if isinstance(technical_indicators, TechnicalAnalysis):
                        technical_analysis_obj = technical_indicators
                    elif isinstance(technical_indicators, dict):
                        technical_analysis_obj = TechnicalAnalysis(symbol=symbol, **technical_indicators)
                except Exception as ex:
                    logger.warning(f"{log_prefix} TechnicalAnalysis parsing failed: {ex}")

            # 5. Assemble the final response model (only supported fields)
            response = FinBotStockResponse(
                symbol=symbol,
                request_timestamp_utc=datetime.now(timezone.utc),
                data_source_info="Multiple Sources",
                is_data_stale=True,
                latest_ohlcv=latest_ohlcv_point,
                history_ohlcv=[],
                latest_indicators=technical_indicators or {},
                technical_analysis=technical_analysis_obj,
                company_overview=company_overview,
                financials=financials_data,
                news=news_data_obj,
                earnings=None,
            )
            
            logger.info(f"{log_prefix} Successfully built FinBotStockResponse model.")
            return response

        except Exception as e:
            logger.error(f"{log_prefix} Failed to build response model: {e}", exc_info=True)
            return None

# Global orchestrator instance
orchestrator = StockOrchestrator() 