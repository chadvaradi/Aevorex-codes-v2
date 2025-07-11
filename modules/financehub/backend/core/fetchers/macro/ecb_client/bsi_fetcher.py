"""ECB Monetary Aggregates (BSI dataflow) fetcher.

Provides async helper to download M1/M2/M3 monthly series and return
`{date: {aggregate: value}}` JSON-ready dict.
LOC ≤ 120 (rule compliance).
"""
from __future__ import annotations

import asyncio
from datetime import date, timedelta
from typing import Dict, Optional

import structlog

from .client import ECBSDMXClient
from .config import (
    KEY_ECB_MONETARY_M1,
    KEY_ECB_MONETARY_M2,
    KEY_ECB_MONETARY_M3,
    ECB_DATAFLOWS,
)
from modules.financehub.backend.utils.cache_service import CacheService
from modules.financehub.backend.core.fetchers.macro.ecb_client.exceptions import ECBAPIError

logger = structlog.get_logger(__name__)

_SERIES_MAP = {
    "M1": KEY_ECB_MONETARY_M1,
    "M2": KEY_ECB_MONETARY_M2,
    "M3": KEY_ECB_MONETARY_M3,
}

CACHE_TTL = 3600  # 1 h

async def fetch_ecb_bsi_data(
    cache: CacheService | None,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
) -> Dict[str, Dict[str, float]]:
    """Return monthly monetary aggregates (M1–M3) from ECB SDMX.

    Structure: `{YYYY-MM: {M1: float, M2: float, M3: float}}`.
   """
    if not end_date:
        end_date = date.today()
    if not start_date:
        start_date = end_date - timedelta(days=365 * 3)  # default 3Y window

    cache_key = f"ecb_bsi:{start_date}:{end_date}"
    if cache:
        cached = await cache.get(cache_key)
        if cached:
            logger.debug("BSI cache HIT")
            return cached  # type: ignore[return-value]

    logger.info("Fetching ECB BSI data %s → %s", start_date, end_date)

    client = ECBSDMXClient(cache)
    combined: Dict[str, Dict[str, float]] = {}
    try:
        for label, series_key in _SERIES_MAP.items():
            try:
                payload = await client.http_client.download_ecb_sdmx(
                    ECB_DATAFLOWS["MONETARY"],
                    series_key,
                    start_date,
                    end_date,
                )
                from .parsers import parse_ecb_comprehensive_json

                single_series = parse_ecb_comprehensive_json(payload, label)
                for d, val in single_series.items():
                    combined.setdefault(d, {})[label] = val
                await asyncio.sleep(0.15)  # polite to WAF
            except Exception as inner:
                logger.warning("BSI series %s failed: %s", label, inner)
                continue
        if cache and combined:
            await cache.set(cache_key, combined, ttl=CACHE_TTL)
        return combined
    except Exception as exc:
        logger.error("BSI fetcher error: %s", exc)
        raise ECBAPIError(f"Failed to fetch BSI data: {exc}") from exc
    finally:
        await client.close() 