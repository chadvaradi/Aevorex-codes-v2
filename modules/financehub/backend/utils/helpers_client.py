"""
HTTP kliens segédfüggvények a FinanceHub alkalmazáshoz.

Ez a modul egyetlen, robusztus funkciót biztosít külső API-k
aszinkron lekérdezésére, hibakezeléssel és a tartós hibák
cache-elésével.
"""

import logging
from typing import Any
import uuid

import httpx
from fastapi import Request

from .logger_config import get_logger

try:
    from ..core.cache_init import CacheService
    package_logger = get_logger(f"aevorex_finbot.utils.{__name__}")
except ImportError:
    logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
    package_logger = logging.getLogger(f"aevorex_finbot.utils_fallback.{__name__}")
    CacheService = object # Placeholder

# --- Constants ---
FETCH_FAILED_MARKER: str = "FETCH_FAILED_V1"

# Initialize logger
logger = get_logger(__name__)

async def make_api_request(
    client: httpx.AsyncClient,
    method: str,
    url: str,
    *,
    source_name_for_log: str,
    params: dict[str, Any] | None = None,
    headers: dict[str, Any] | None = None,
    cache_service: CacheService | None = None,
    cache_key_for_failure: str | None = None,
    http_timeout: float = 30.0,
    cache_enabled: bool = True,
    fetch_failure_cache_ttl: int = 600,
) -> dict | list | str | None:
    """
    Végrehajt egy aszinkron HTTP kérést robusztus hibakezeléssel és
    opcionálisan a tartós hibák cache-elésével.
    """
    log_prefix = f"[{source_name_for_log}]"

    can_check_cache_failure = cache_enabled and cache_service is not None and cache_key_for_failure is not None
    if can_check_cache_failure:
        try:
            cached_failure = await cache_service.get(cache_key_for_failure)
            if cached_failure == FETCH_FAILED_MARKER:
                package_logger.warning(f"{log_prefix} Found persistent failure marker in cache (Key: {cache_key_for_failure}). Skipping live request.")
                return None
        except Exception as e_cache_get:
             package_logger.error(f"{log_prefix} Error checking cache for failure marker (Key: {cache_key_for_failure}): {e_cache_get}", exc_info=False)

    request_headers = {"User-Agent": "Mozilla/5.0"}
    if headers:
        request_headers.update(headers)

    try:
        response = await client.request(
            method.upper(), 
            url, 
            params=params, 
            headers=request_headers, 
            timeout=http_timeout,
            follow_redirects=True
        )
        response.raise_for_status()

        # Próbáljuk JSON-ként feldolgozni, ha nem sikerül, text-ként adjuk vissza
        try:
            return response.json()
        except Exception:
            return response.text

    except httpx.TimeoutException as e:
        package_logger.warning(f"{log_prefix} Request timed out for {url}: {e}")
    except httpx.HTTPStatusError as e:
        package_logger.warning(f"{log_prefix} HTTP Error {e.response.status_code} for {url}: {e.response.text[:200]}")
    except httpx.RequestError as e:
        package_logger.error(f"{log_prefix} Request error for {url}: {e}")
    except Exception as e:
        package_logger.error(f"{log_prefix} Unexpected error during request for {url}: {e}", exc_info=True)

    # Hibakezelés: ha a kérés sikertelen, és a cache engedélyezve van, tegyünk egy "sírkövet" a cache-be.
    if can_check_cache_failure:
        try:
            await cache_service.set(cache_key_for_failure, FETCH_FAILED_MARKER, ttl=fetch_failure_cache_ttl)
            package_logger.debug(f"{log_prefix} Set failure marker in cache for key {cache_key_for_failure} with TTL {fetch_failure_cache_ttl}s.")
        except Exception as e_cache_set:
            package_logger.error(f"{log_prefix} Failed to set failure marker in cache for key {cache_key_for_failure}: {e_cache_set}")

    return None

def get_request_id(symbol: str, context: str) -> str:
    """Generates a unique request ID for logging and tracing."""
    return f"[{symbol.upper()}:{context}:{uuid.uuid4().hex[:6]}]"

def get_user_id(request: Request) -> str:
    """
    Retrieves a user identifier from the request session.

    In a real application, this would involve looking up the user from
    a session cookie or a decoded JWT. For now, it supports a mock
    user for development purposes.

    Args:
        request: The FastAPI request object.

    Returns:
        A string representing the user ID.
    """
    # TODO: Replace with real user session lookup
    if 'user' in request.session and 'email' in request.session['user']:
        return request.session['user']['email']
    
    return "mock_user_id_for_dev"
