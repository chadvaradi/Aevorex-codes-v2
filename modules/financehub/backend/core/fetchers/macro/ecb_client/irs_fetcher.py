"""ECB Interest Rate Statistics (IRS) fetcher."""
from __future__ import annotations

from datetime import date
from typing import Dict, Optional

from modules.financehub.backend.utils.cache_service import CacheService

from .config import (
    KEY_ECB_IRS_SWAP_RATE_10Y,
    ECB_DATAFLOWS,
)
from .generic_fetcher import fetch_multi_series

_SERIES = [
    ("Swap_Rate_10Y", KEY_ECB_IRS_SWAP_RATE_10Y),
]

async def fetch_ecb_irs_data(
    cache: CacheService | None,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
) -> Dict[str, Dict[str, float]]:
    return await fetch_multi_series(
        cache,
        ECB_DATAFLOWS["IRS"],
        _SERIES,
        start_date,
        end_date,
        cache_ttl=7200,
    ) 