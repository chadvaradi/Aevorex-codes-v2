"""ECB Payment Systems Statistics (PSS) fetcher."""
from __future__ import annotations

from datetime import date
from typing import Dict, Optional

from modules.financehub.backend.utils.cache_service import CacheService

from .config import (
    KEY_ECB_PSS_PAYMENTS_VOLUME,
    ECB_DATAFLOWS,
)
from .generic_fetcher import fetch_multi_series

_SERIES = [
    ("Payments_Volume", KEY_ECB_PSS_PAYMENTS_VOLUME),
]

async def fetch_ecb_pss_data(
    cache: CacheService | None,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
) -> Dict[str, Dict[str, float]]:
    return await fetch_multi_series(
        cache,
        ECB_DATAFLOWS["PSS"],
        _SERIES,
        start_date,
        end_date,
        cache_ttl=7200,
    ) 