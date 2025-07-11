from __future__ import annotations
from typing import Literal
from httpx import AsyncClient
from modules.financehub.backend.utils.cache_service import CacheService
from modules.financehub.backend.core.fetchers.common.base_fetcher import BaseFetcher
from modules.financehub.backend.core.fetchers.yfinance.yfinance_fetcher import YFinanceFetcher
from modules.financehub.backend.core.fetchers.eodhd.eodhd_fetcher import EODHDFetcher
from modules.financehub.backend.core.fetchers.alphavantage.alphavantage_fetcher import AlphaVantageFetcher
from modules.financehub.backend.core.fetchers.fmp.fmp_fetcher import FMPFetcher
from modules.financehub.backend.core.fetchers.marketaux.marketaux_fetcher import MarketAuxFetcher
from modules.financehub.backend.utils.helpers_service import get_api_key

Provider = Literal["yfinance", "eodhd", "alphavantage", "fmp", "marketaux"]

async def get_fetcher(
    provider: Provider,
    http_client: AsyncClient | None = None,
    cache: CacheService | None = None,
) -> BaseFetcher:
    """Factory that supports both legacy (provider, cache) and new (provider, http_client, cache) calls."""
    # Handle legacy positional usage (provider, cache)
    if cache is None and isinstance(http_client, CacheService):
        cache, http_client = http_client, None

    if cache is None:
        raise ValueError("cache parameter is required")

    if provider == "yfinance":
        return YFinanceFetcher(cache)

    if http_client is None:
        raise ValueError("http_client must be provided for provider that requires HTTP access (eodhd, alphavantage, fmp, marketaux)")

    if provider == "eodhd":
        # EODHDFetcher resolves its own API key internally; constructor expects (cache, client)
        return EODHDFetcher(cache, http_client)
    if provider == "alphavantage":
        api_key = await get_api_key("ALPHAVANTAGE")
        return AlphaVantageFetcher(http_client, cache, api_key)
    if provider == "fmp":
        api_key = await get_api_key("FMP")
        return FMPFetcher(http_client, cache, api_key)
    if provider == "marketaux":
        api_key = await get_api_key("MARKETAUX")
        return MarketAuxFetcher(http_client, cache, api_key)

    raise ValueError(f"Unknown provider: {provider}") 