"""ECB Inflation (HICP) fetcher – overall / core / energy.
Returns `{YYYY-MM: {HICP_Overall: val, HICP_Core: val, HICP_Energy: val}}`.
Strictly live SDMX data – no mock fallback.
"""
from __future__ import annotations

import asyncio
from datetime import date, timedelta
from typing import Dict, Optional

import structlog

from .client import ECBSDMXClient
from .config import (
    KEY_ECB_HICP_OVERALL,
    KEY_ECB_HICP_CORE,
    KEY_ECB_HICP_ENERGY,
    ECB_DATAFLOWS,
)
from modules.financehub.backend.utils.cache_service import CacheService
from modules.financehub.backend.core.fetchers.macro.ecb_client.exceptions import ECBAPIError

logger = structlog.get_logger(__name__)

_SERIES = {
    "HICP_Overall": KEY_ECB_HICP_OVERALL,
    "HICP_Core": KEY_ECB_HICP_CORE,
    "HICP_Energy": KEY_ECB_HICP_ENERGY,
}
CACHE_TTL = 3600  # 1h

async def fetch_ecb_hicp_data(
    cache: CacheService | None,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
) -> Dict[str, Dict[str, float]]:
    if end_date is None:
        end_date = date.today()
    if start_date is None:
        start_date = end_date - timedelta(days=365 * 5)  # 5Y window

    cache_key = f"ecb:hicp:{start_date}:{end_date}"
    if cache:
        cached = await cache.get(cache_key)
        if cached:
            logger.debug("HICP cache HIT")
            return cached  # type: ignore[return-value]

    client = ECBSDMXClient(cache)
    combined: Dict[str, Dict[str, float]] = {}
    try:
        for label, series_key in _SERIES.items():
            payload = await client.http_client.download_ecb_sdmx(
                ECB_DATAFLOWS["INFLATION"],
                series_key,
                start_date,
                end_date,
            )
            from .parsers import parse_ecb_comprehensive_json
            single = parse_ecb_comprehensive_json(payload, label)
            for d, val in single.items():
                combined.setdefault(d, {})[label] = val
            await asyncio.sleep(0.15)
        if cache and combined:
            await cache.set(cache_key, combined, ttl=CACHE_TTL)
        return combined
    except Exception as exc:
        logger.error("HICP fetch error: %s", exc)
        raise ECBAPIError(f"Failed to fetch HICP data: {exc}") from exc
    finally:
        await client.close() 