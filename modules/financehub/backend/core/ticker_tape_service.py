"""
Ticker Tape Service - Main Orchestrator
=======================================

This service orchestrates the fetching and caching of ticker tape data
using the refactored, modular components from the `services.ticker` package.
"""
import httpx
import asyncio
import json
import os
from datetime import datetime, timedelta

import re

from modules.financehub.backend.config import settings
from modules.financehub.backend.utils.logger_config import get_logger
from modules.financehub.backend.utils.cache_service import CacheService
from .services.ticker.fetcher import (
    API_CONFIG, 
    normalize_symbol_for_provider, 
    fetch_single_ticker_quote
)

logger = get_logger(__name__)
MODULE_PREFIX = "[TickerTape Service]"

# ---------------------------------------------------------------------------
# Provider-specific helpers
# ---------------------------------------------------------------------------

_EODHD_UNSUPPORTED_PATTERN = re.compile(r"[.=]")  # contains '=' (futures) or '.' (region suffix)


def _is_eodhd_supported(symbol: str) -> bool:  # noqa: D401 – simple helper
    """Return True if the symbol is compatible with EODHD real-time endpoint."""
    return not bool(_EODHD_UNSUPPORTED_PATTERN.search(symbol))

# ---------------------------------------------------------------------------
# Configurable provider selection - Moved into a function to avoid import-time issues
# ---------------------------------------------------------------------------
def get_selected_provider() -> str:  # noqa: D401 – simple helper
    """Return the first provider with valid credentials, falling back to key-less *Yahoo Finance* (``"YF"``).

    Priority order:
    1. ``FINBOT_TT_PROVIDER`` env var – **only** if the referenced provider has a usable key.
    2. Hard-coded list (``EODHD → FMP → ALPHA_VANTAGE``).
    3. Final fallback: ``"YF"`` which requires no API key at all.
    """

    # Collect candidates while preserving intent order & uniqueness
    env_pref = os.getenv("FINBOT_TT_PROVIDER", "").upper()
    candidates: list[str] = [c for c in [env_pref] if c and c.upper() != "EODHD"] + [
        "FMP",
        "ALPHA_VANTAGE",
        "YF",
    ]

    seen: set[str] = set()
    for candidate in candidates:
        if candidate in seen:
            continue
        seen.add(candidate)
        if _check_api_keys_available(candidate):
            return candidate

    # Absolute last resort – always available offline provider (will still raise in _select if disabled)
    return "YF"

class TickerTapeMemoryCache:
    """Singleton in-memory cache for ticker tape data."""
    _instance = None
    _cache = {}
    _expiry = {}
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance
    
    def set(self, key: str, data: list, ttl: int):
        """Set data in memory cache with TTL."""
        self._cache[key] = data
        self._expiry[key] = datetime.utcnow() + timedelta(seconds=ttl)
        logger.info(f"{MODULE_PREFIX} [MemoryCache] Set {key} with {len(data)} items, TTL: {ttl}s")
    
    def get(self, key: str) -> list | None:
        """Get data from memory cache if not expired."""
        if key not in self._cache:
            return None
        
        expiry = self._expiry.get(key)
        if expiry and datetime.utcnow() < expiry:
            logger.info(f"{MODULE_PREFIX} [MemoryCache] Hit for {key} with {len(self._cache[key])} items")
            return self._cache[key]
        else:
            # Expired, remove from cache
            self._cache.pop(key, None)
            self._expiry.pop(key, None)
            logger.info(f"{MODULE_PREFIX} [MemoryCache] Expired and removed {key}")
            return None
    
    def clear(self):
        """Clear all cached data."""
        self._cache.clear()
        self._expiry.clear()

# Global singleton instance
_memory_cache = TickerTapeMemoryCache()

# The list of tickers to display on the tape - IBKR-grade 29-symbol master list
TICKER_SYMBOLS = [
    # US Equities - Magnificent 7 + High Volume
    "NVDA", "AAPL", "MSFT", "AMZN", "GOOGL", "META", "TSLA",
    "BAC", "HOOD", "PLTR", "AMD", "INTC",
    
    # Global Index ETFs
    "SPY", "QQQ", "DIA", "IWM",
    
    # Index Futures (cash equivalent)
    "ES=F", "NQ=F", "YM=F", "RTY=F", "VIX", "DAX", "FTSE",
    
    # Forex Majors + 2 Cross
    "EURUSD=X", "USDJPY=X", "GBPUSD=X", "AUDUSD=X", "USDCAD=X", "USDCHF=X", "EURJPY=X", "GBPJPY=X",
    
    # Crypto Market-cap TOP 5 + 2 Narrative
    "BTC-USD", "ETH-USD", "BNB-USD", "SOL-USD", "XRP-USD", "DOGE-USD", "TON-USD",
    
    # Commodities (High Macro Correlation)
    "GC=F", "SI=F", "CL=F", "NG=F"
]

def _check_api_keys_available(provider: str) -> bool:
    """Check if an API provider can be used (i.e. has a usable key or requires none).

    Yahoo-Finance ("YF") does not need an API key, therefore it is **always**
    considered available. We short-circuit early to avoid the generic provider
    config and API-key checks below.
    """

    # ------------------------------------------------------------------
    # 1) Key-less provider → always available
    # ------------------------------------------------------------------
    if provider.upper() == "YF":
        return True  # Yahoo Finance requires no credentials

    # ------------------------------------------------------------------
    # 2) Providers that DO require an API key
    # ------------------------------------------------------------------
    print(f"DEBUG: Checking API keys for provider: {provider}")
    provider_config = API_CONFIG.get(provider)
    if not provider_config:
        print(f"DEBUG: No provider config found for {provider}")
        return False
    
    api_key_getter = provider_config.get('api_key_getter')
    print(f"DEBUG: api_key_getter function: {api_key_getter}")
    api_key = api_key_getter() if api_key_getter else None

    # Settings-based fallback (pydantic SecretStr) – handles nested delimiter env parsing
    if (api_key is None or api_key == "") and hasattr(settings.API_KEYS, provider):
        secret = getattr(settings.API_KEYS, provider)
        if secret:
            api_key = secret.get_secret_value()

    # Fallback: direct env var lookup (handles late-loaded env.local)
    if (api_key is None or api_key == ""):
        # Elsődleges nested env kulcs (FINBOT_API_KEYS__PROVIDER)
        env_key = f"FINBOT_API_KEYS__{provider}"
        api_key = os.getenv(env_key)
    # Alternatív, legacy env kulcs ( pl. EODHD_KEY )
    if (api_key is None or api_key == ""):
        legacy_key = f"{provider}_KEY"
        api_key = os.getenv(legacy_key)
    print(f"DEBUG: Retrieved API key: {api_key}")
    
    # Provider-specific validation ------------------------------------------------
    if provider == "YF":
        # Yahoo Finance requires no key – always available
        is_available = True
    else:
        # Reject obviously malformed keys (contain dot, whitespace, or shorter than 8)
        if api_key is None:
            is_available = False
        else:
            cleaned = api_key.strip()
            is_available = (
                cleaned != "" and
                len(cleaned) >= 8 and  # minimum sensible length
                " " not in cleaned
            )
    logger.info(f"{MODULE_PREFIX} [API Key Check] Provider: {provider}, Key Available: {is_available}")
    print(f"DEBUG: Final result - Key Available: {is_available}")
    return is_available

# ---------------------------------------------------------------------------
# Dynamic provider fallback helper
# ---------------------------------------------------------------------------

def _select_available_provider() -> str:
    """Return the first provider that has a valid API key configured at runtime.

    Order of precedence:
    1) Provider set explicitly through FINBOT_TT_PROVIDER env var
    2) Preferred defaults (EODHD, FMP, ALPHA_VANTAGE)
    """

    env_pref: str | None = os.getenv("FINBOT_TT_PROVIDER", "").upper() if os.getenv("FINBOT_TT_PROVIDER") else None

    # Build candidate list while keeping original ordering and uniqueness
    candidates: list[str] = []
    if env_pref:
        candidates.append(env_pref)
    for default in ("FMP", "ALPHA_VANTAGE", "YF"):
        if default not in candidates:
            candidates.append(default)

    for candidate in candidates:
        if _check_api_keys_available(candidate):
            logger.info(f"{MODULE_PREFIX} [ProviderSelect] Using provider '{candidate}' based on available API key")
            return candidate

    # No fizetős provider – végső fallback a Yahoo Finance (YF), mert ez key-less.
    logger.warning(
        f"{MODULE_PREFIX} [ProviderSelect] No provider with valid API key, falling back to free 'YF' provider."
    )
    return "YF"

async def _set_cache_with_fallback(cache: CacheService, key: str, data: list, ttl: int) -> bool:
    """Set cache data with in-memory fallback if Redis fails."""
    redis_success = False
    try:
        # Try Redis first
        await cache.set(key, json.dumps(data), ttl=ttl)
        logger.info(f"{MODULE_PREFIX} [Redis] Successfully set {key} with {len(data)} items")
        redis_success = True
    except Exception as e:
        logger.warning(f"{MODULE_PREFIX} Redis cache set failed: {e}")
    
    # Always set in-memory cache as backup
    _memory_cache.set(key, data, ttl)
    
    return True  # Always return True since we have in-memory fallback

async def _get_cache_with_fallback(cache: CacheService, key: str):
    """Get cache data with in-memory fallback if Redis fails."""
    # Try Redis first
    try:
        cached_data = await cache.get(key)
        if cached_data:
            data = json.loads(cached_data) if isinstance(cached_data, str) else cached_data
            logger.info(f"{MODULE_PREFIX} [Redis] Cache hit for {key} with {len(data)} items")
            return data
    except Exception as e:
        logger.warning(f"{MODULE_PREFIX} Redis cache read failed: {e}")
    
    # Check in-memory cache
    return _memory_cache.get(key)

async def update_ticker_tape_data_in_cache(
    client: httpx.AsyncClient,
    cache: CacheService
) -> bool:
    """Fetch quotes for the ticker tape and populate cache.

    No-mock policy: If no provider has a valid API key the function aborts and returns ``False``.
    """
    log_prefix = f"{MODULE_PREFIX} [CacheUpdate]"
    
    # Determine provider dynamically – prefer env override but NO fallback to mock
    selected_provider = _select_available_provider()
    logger.info(f"{log_prefix} Selected provider at runtime after validation: {selected_provider}")

    # If the chosen provider has no usable key, attempt a graceful fallback to the
    # key-less Yahoo Finance ("YF") provider before aborting. This guarantees that
    # the endpoint can always return live market data without violating the
    # no-mock policy, even on developer machines where paid API keys are absent.
    if not selected_provider or not _check_api_keys_available(selected_provider):
        yf_available = _check_api_keys_available("YF")
        if yf_available:
            logger.warning(
                f"{log_prefix} Provider '{selected_provider or 'NONE'}' unavailable. "
                "Falling back to key-less 'YF' provider."
            )
            selected_provider = "YF"
        else:
            logger.error(
                f"{log_prefix} Aborting ticker-tape update – no valid API provider available "
                "even after 'YF' fallback."
            )
            return False
    
    provider_config = API_CONFIG.get(selected_provider)
    if not provider_config:
        logger.error(f"{log_prefix} Invalid API provider selected: {selected_provider}")
        return False
        
    logger.info(f"{log_prefix} Starting ticker tape update with provider: {selected_provider}")
    
    # Filter out symbols unsupported by the selected provider (prevents 422 spam)
    symbols_iter = [
        s for s in TICKER_SYMBOLS
        if selected_provider != "EODHD" or _is_eodhd_supported(s)
    ]

    tasks = []
    for symbol in symbols_iter:
        normalized_symbol = normalize_symbol_for_provider(symbol, selected_provider)
        task = fetch_single_ticker_quote(
            symbol=normalized_symbol,
            client=client,
            provider_config=provider_config
        )
        tasks.append(task)
    
    results = await asyncio.gather(*tasks, return_exceptions=True)
    
    processed_data = []
    for original_symbol, result in zip(symbols_iter, results):
        if isinstance(result, dict):
            # The symbol might have been normalized (e.g., AAPL -> AAPL.US)
            # We want to return the original symbol in the final output.
            result['symbol'] = original_symbol
            processed_data.append(result)
        elif isinstance(result, Exception):
            logger.error(f"{log_prefix} Exception fetching data for {original_symbol}: {result}")
        # None results are already logged in the fetcher, so we just skip them.
            
    if not processed_data:
        logger.warning(f"{log_prefix} No data was successfully fetched. Cache will not be updated.")
        return False
        
    try:
        cache_key = settings.TICKER_TAPE.CACHE_KEY
        cache_ttl = settings.TICKER_TAPE.CACHE_TTL_SECONDS
        success = await _set_cache_with_fallback(cache, cache_key, processed_data, cache_ttl)
        if success:
            logger.info(f"{log_prefix} Successfully updated cache with {len(processed_data)} items. Key: {cache_key}")
            return True
        else:
            logger.error(f"{log_prefix} Failed to update cache")
            return False
    except Exception as e:
        logger.error(f"{log_prefix} Failed to update cache. Error: {e}")
        return False

async def get_ticker_tape_data_from_cache(cache: CacheService) -> list | None:
    """
    Get ticker tape data from cache with fallback support.
    """
    cache_key = settings.TICKER_TAPE.CACHE_KEY
    return await _get_cache_with_fallback(cache, cache_key)

# --- Modul betöltés jelzése ---
logger.info(f"{MODULE_PREFIX} Service module loaded. Provider selection and key checks will happen at runtime.")