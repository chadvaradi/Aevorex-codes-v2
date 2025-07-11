"""
Stock Orchestrator

Extracted from stock_data_service.py (3662 LOC) to follow 160 LOC rule.
Handles high-level orchestration and coordination of stock data operations.

Responsibilities:
- Coordinating fetcher and processor services
- Managing data flow between services
- High-level business logic
- Error handling and retry logic
- Performance monitoring
"""

import time
import uuid
from typing import Any
from datetime import datetime
import httpx

from modules.financehub.backend.utils.cache_service import CacheService
from modules.financehub.backend.utils.logger_config import get_logger
from modules.financehub.backend.core.services.stock.fetcher import StockDataFetcher
from modules.financehub.backend.core.services.stock.processor import StockDataProcessor
from modules.financehub.backend.core.services.shared.response_builder import build_stock_response_from_parallel_data
from modules.financehub.backend.models.stock import FinBotStockResponse
from modules.financehub.backend.core.services.stock.response import StockResponseBuilder

logger = get_logger("aevorex_finbot.StockOrchestrator")

class StockOrchestrator:
    """
    High-level orchestration service for stock data operations.
    
    Coordinates between fetcher, processor, and response builder services
    to provide unified stock data responses.
    """
    
    def __init__(self, cache: CacheService):
        self.fetcher = StockDataFetcher(cache=cache)
        self.processor = StockDataProcessor()
        self.response_builder = StockResponseBuilder()
        
    async def get_basic_stock_data(self, symbol: str, client: httpx.AsyncClient) -> dict[str, Any] | None:
        """Orchestrate basic stock data retrieval for ticker-tape and simple displays."""
        request_id = f"basic-{symbol}-{uuid.uuid4().hex[:6]}"
        start_time = time.monotonic()
        
        logger.info(f"[{request_id}] Starting basic stock data orchestration for {symbol}")
        
        try:
            ticker_info = await self.fetcher.fetch_company_info(symbol, request_id)
            if not ticker_info:
                logger.warning(f"[{request_id}] Primary fetcher failed – falling back to direct yfinance lookup for {symbol}.")
                try:
                    import yfinance as yf
                    yf_ticker = yf.Ticker(symbol)
                    ticker_info = yf_ticker.info or {}
                except Exception as yf_error:
                    logger.error(f"[{request_id}] yfinance fallback failed: {yf_error}")
                    return None
            
            price_metrics = self.processor.calculate_price_metrics(ticker_info, request_id)
            
            basic_data = {
                "symbol": symbol,
                "company_name": ticker_info.get('longName') or ticker_info.get('shortName'),
                **price_metrics,
                "currency": ticker_info.get('currency', 'USD'),
                "exchange": ticker_info.get('exchange'),
                "market_cap": ticker_info.get('marketCap'),
                "sector": ticker_info.get('sector'),
                "industry": ticker_info.get('industry'),
                "timestamp": datetime.utcnow().isoformat(),
                "request_id": request_id
            }
            
            basic_data = self.processor.validate_and_clean_data(basic_data, ['symbol', 'current_price'], request_id)
            
            duration = round((time.monotonic() - start_time) * 1000, 2)
            logger.info(f"[{request_id}] Basic data orchestration completed in {duration}ms")
            return basic_data
            
        except Exception as e:
            logger.error(f"[{request_id}] Error in basic stock data orchestration: {e}")
            return None
    
    async def get_chart_data(
        self,
        symbol: str,
        client: httpx.AsyncClient,
        period: str = "1y",
        interval: str = "1d"
    ) -> dict[str, Any] | None:
        """Orchestrate chart data retrieval and processing."""
        request_id = f"chart-{symbol}-{uuid.uuid4().hex[:6]}"
        start_time = time.monotonic()
        
        logger.info(f"[{request_id}] Starting chart data orchestration for {symbol}")
        
        try:
            # Fetch OHLCV data
            ohlcv_df = await self.fetcher.fetch_ohlcv_data(
                symbol, client, period, interval, request_id
            )
            
            if ohlcv_df is None or ohlcv_df.empty:
                logger.warning(f"[{request_id}] No chart data available for {symbol}")
                return None
            
            # Process OHLCV data
            latest_ohlcv = self.processor.process_ohlcv_dataframe(ohlcv_df, symbol, request_id)
            
            # Build chart response
            chart_data = self.response_builder.build_chart_response(
                symbol, ohlcv_df, latest_ohlcv, request_id
            )
            
            duration = round((time.monotonic() - start_time) * 1000, 2)
            logger.info(f"[{request_id}] Chart data orchestration completed in {duration}ms")
            
            return chart_data
            
        except Exception as e:
            logger.error(f"[{request_id}] Error in chart data orchestration: {e}")
            return None
    
    async def get_fundamentals_data(
        self,
        symbol: str,
        client: httpx.AsyncClient
    ) -> dict[str, Any] | None:
        """Orchestrate fundamentals data retrieval and processing."""
        request_id = f"fundamentals-{symbol}-{uuid.uuid4().hex[:6]}"
        start_time = time.monotonic()
        
        logger.info(f"[{request_id}] Starting fundamentals data orchestration for {symbol}")
        
        try:
            # Fetch company information
            ticker_info = await self.fetcher.fetch_company_info(symbol, request_id)
            
            if not ticker_info:
                logger.warning(f"[{request_id}] No fundamentals data available for {symbol}")
                return None
            
            # Process company information
            company_overview = self.processor.process_company_info(ticker_info, symbol, request_id)
            price_metrics = self.processor.calculate_price_metrics(ticker_info, request_id)
            
            # Build fundamentals response
            fundamentals_data = self.response_builder.build_fundamentals_response(
                symbol, company_overview, price_metrics, ticker_info, request_id
            )
            
            duration = round((time.monotonic() - start_time) * 1000, 2)
            logger.info(f"[{request_id}] Fundamentals data orchestration completed in {duration}ms")
            
            return fundamentals_data
            
        except Exception as e:
            logger.error(f"[{request_id}] Error in fundamentals data orchestration: {e}")
            return None

    async def get_stock_data(self, symbol: str) -> FinBotStockResponse:
        # ...
        return await build_stock_response_from_parallel_data(
            symbol,
            # ...
        ) 

    async def fetch_parallel_data(
        self,
        symbol: str,
        client,
        cache,
        request_id: str,
        force_refresh: bool = False,
        period: str = "1y",
        interval: str = "1d",
    ):
        """Compatibility wrapper that forwards to the next-gen StockOrchestrator living at
        modules.financehub.backend.core.services.orchestrator.

        This keeps legacy callers (e.g. technical_analysis_stock and tech_calc) working
        until we complete the full service merge.  The signature purposefully matches
        the newer orchestrator so we can act as a drop-in replacement.
        """
        # Lazy import – import the modern orchestrator implementation that has
        # a parameter-less constructor (located in core/orchestrator/orchestrator.py)
        from modules.financehub.backend.core.orchestrator.orchestrator import StockOrchestrator as _MasterOrchestrator

        master = _MasterOrchestrator(cache=cache)
        return await master.fetch_parallel_data(
            symbol=symbol,
            client=client,
            cache=cache,
            request_id=request_id,
            period=period,
            interval=interval,
        ) 