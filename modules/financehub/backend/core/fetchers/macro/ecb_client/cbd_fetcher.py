"""ECB Consolidated Banking Data (CBD) fetcher."""
from __future__ import annotations

from datetime import date
from typing import Dict, Optional

from modules.financehub.backend.utils.cache_service import CacheService
from .config import (
    KEY_ECB_CBD_TIER1_RATIO,
    KEY_ECB_CBD_NPL_RATIO,
    ECB_DATAFLOWS,
)
from .generic_fetcher import fetch_multi_series

_SERIES = [
    ("Tier1_Ratio", KEY_ECB_CBD_TIER1_RATIO),
    ("NPL_Ratio", KEY_ECB_CBD_NPL_RATIO),
]

async def fetch_ecb_cbd_data(
    cache: CacheService | None,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
) -> Dict[str, Dict[str, float]]:
    return await fetch_multi_series(
        cache,
        ECB_DATAFLOWS["CBD"],
        _SERIES,
        start_date,
        end_date,
        cache_ttl=86400,
    ) 