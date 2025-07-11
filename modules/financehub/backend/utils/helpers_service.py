"""
Szolgáltatás-szintű segédfüggvények az Aevorex FinBot alkalmazáshoz.

Ez a modul olyan magasabb szintű logikákat tartalmaz, mint az API kulcsok
kezelése, cache-elés vezérlése és DataFrame-specifikus műveletek.
"""
# Added os for env var fallback
import os
import hashlib
import logging
from typing import Any
from collections.abc import Callable, Awaitable
import pandas as pd
from pydantic import SecretStr

try:
    from ..config import settings
    from .logger_config import get_logger
    from ..core.cache_init import CacheService
    package_logger = get_logger(f"aevorex_finbot.utils.{__name__}")
except ImportError:
    logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
    package_logger = logging.getLogger(f"aevorex_finbot.utils_fallback.{__name__}")
    CacheService = object # Placeholder

FETCH_FAILED_MARKER = "FETCH_FAILED_V1"

async def get_api_key(key_name: str) -> str | None:
    """
    Visszaadja az API kulcsot stringként, ha megtalálható és érvényes.
    """
    log_prefix = f"[get_api_key({key_name})]"
    key_name_upper = key_name.upper()

    try:
        if not hasattr(settings, 'API_KEYS') or settings.API_KEYS is None:
            package_logger.warning(f"{log_prefix} 'settings.API_KEYS' structure not found or is None.")
            return None

        api_key_secret = getattr(settings.API_KEYS, key_name_upper, None)
        
        if api_key_secret is None:
            package_logger.warning(f"{log_prefix} API Key attribute '{key_name_upper}' not found.")
            # Legacy fallback lookup (deprecated 2025-Q4)
            legacy_env_variants = [f"{key_name_upper}_API_KEY", f"FINBOT_API_KEYS_{key_name_upper}"]
            for legacy_var in legacy_env_variants:
                if os.getenv(legacy_var):
                    package_logger.warning(
                        f"{log_prefix} Using legacy env var '{legacy_var}'. Please migrate to 'FINBOT_API_KEYS__{key_name_upper}'."
                    )
                    return os.getenv(legacy_var).strip()
            return None

        if not isinstance(api_key_secret, SecretStr):
            package_logger.error(f"{log_prefix} API Key '{key_name_upper}' is not a SecretStr type.")
            return None

        secret_value = api_key_secret.get_secret_value()

        if not secret_value or not secret_value.strip():
            package_logger.warning(f"{log_prefix} API Key '{key_name_upper}' is empty.")
            return None

        return secret_value.strip()

    except Exception as e:
        package_logger.error(f"{log_prefix} Error retrieving API key: {e}")
        return None

def generate_cache_key(
    data_type: str,
    source: str,
    identifier: str,
    params: dict[str, Any] | None = None
) -> str:
    """
    Generál egy konzisztens cache kulcsot a megadott paraméterek alapján.
    MD5 hash-t használ a rövidség és konzisztencia érdekében.
    """
    if not all([data_type, source, identifier]):
        raise ValueError("data_type, source, and identifier cannot be empty.")

    key_parts = [data_type.lower(), source.lower(), identifier.upper()]

    if params:
        sorted_params = sorted((str(k), str(v)) for k, v in params.items() if v is not None)
        param_string = "&".join([f"{k}={v}" for k, v in sorted_params])
        key_parts.append(param_string)

    raw_key = ":".join(key_parts)

    MAX_KEY_LENGTH_BEFORE_HASH: int = 150
    if len(raw_key) > MAX_KEY_LENGTH_BEFORE_HASH:
        prefix = ":".join([data_type.lower(), source.lower(), identifier.upper()])
        hashed_suffix = hashlib.md5(raw_key.encode('utf-8')).hexdigest()
        return f"{prefix}:MD5:{hashed_suffix}"
    else:
        return raw_key

async def get_from_cache_or_fetch(
    cache_key: str,
    fetch_func: Callable[[], Awaitable[Any]],
    cache_service: CacheService,
    ttl_seconds: int,
) -> Any | None:
    """
    Adatot kér le a cache-ből, vagy meghívja a fetch_func-ot, ha nincs találat.
    """
    log_prefix = f"[CacheOrFetch({cache_key})]"
    try:
        cached_data = await cache_service.get(cache_key)
        if cached_data is not None:
            if cached_data == FETCH_FAILED_MARKER:
                package_logger.warning(f"{log_prefix} Found persistent failure marker. Skipping.")
                return None
            package_logger.debug(f"{log_prefix} Cache hit.")
            return cached_data
        
        package_logger.debug(f"{log_prefix} Cache miss. Fetching fresh data.")
        fresh_data = await fetch_func()
        
        if fresh_data is not None:
            await cache_service.set(cache_key, fresh_data, ttl=ttl_seconds)
            package_logger.debug(f"{log_prefix} Fresh data cached for {ttl_seconds}s.")
        
        return fresh_data
        
    except Exception as e:
        package_logger.error(f"{log_prefix} Operation failed: {e}", exc_info=True)
        return None

# --- DataFrame Helpers ---

def safe_get(df: pd.DataFrame | None, index: Any, column: str, default: Any = None, *, context: str = "") -> Any:
    """
    Biztonságosan lekér egy értéket egy pandas DataFrame-ből index és oszlop alapján.
    """
    if df is None or df.empty:
        return default
    try:
        if index in df.index:
            value = df.at[index, column]
            return value if pd.notna(value) else default
        return default
    except (KeyError, AttributeError):
        return default

def _ensure_datetime_index(df: pd.DataFrame, function_name: str = "caller") -> pd.DataFrame | None:
    """
    Biztosítja, hogy a DataFrame indexe datetime típusú legyen.
    """
    if not isinstance(df.index, pd.DatetimeIndex):
        try:
            df.index = pd.to_datetime(df.index, errors='coerce')
            df = df[df.index.notna()]
            if not isinstance(df.index, pd.DatetimeIndex):
                 raise ValueError("Index conversion to DatetimeIndex failed silently.")
        except Exception as e:
            package_logger.error(f"Function '{function_name}' requires a DatetimeIndex, but conversion failed: {e}", exc_info=True)
            return None
    
    if df.index.tz is None:
        df = df.tz_localize('UTC')

    return df

def safe_get_from_df(df: pd.DataFrame, index: Any, column: str, default: Any = None, context: str = "") -> Any:
    """
    Biztonságosan lekér egy értéket egy pandas DataFrame-ből index és oszlop alapján.
    """
    if df is None or df.empty:
        return default
    try:
        val = df.loc[index, column]
        return val if pd.notna(val) else default
    except (KeyError, AttributeError):
        return default

