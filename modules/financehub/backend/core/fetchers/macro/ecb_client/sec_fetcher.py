"""ECB Securities Issues Statistics (SEC) fetcher."""
from __future__ import annotations

from datetime import date
from typing import Dict, Optional

from modules.financehub.backend.utils.cache_service import CacheService

from .config import (
    KEY_ECB_SEC_DEBT_SECURITIES,
    KEY_ECB_SEC_LISTED_SHARES,
    ECB_DATAFLOWS,
)
from .generic_fetcher import fetch_multi_series

_SERIES = [
    ("Debt_Securities", KEY_ECB_SEC_DEBT_SECURITIES),
    ("Listed_Shares", KEY_ECB_SEC_LISTED_SHARES),
]

async def fetch_ecb_sec_data(
    cache: CacheService | None,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
) -> Dict[str, Dict[str, float]]:
    return await fetch_multi_series(
        cache,
        ECB_DATAFLOWS["SEC"],  # dataflow code
        _SERIES,
        start_date,
        end_date,
        cache_ttl=7200,
    ) 