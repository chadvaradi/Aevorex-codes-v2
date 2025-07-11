"""ECB External Trade (TRD) fetcher."""
from __future__ import annotations

from datetime import date
from typing import Dict, Optional

from modules.financehub.backend.utils.cache_service import CacheService

from .config import (
    KEY_ECB_TRD_EXPORTS,
    KEY_ECB_TRD_IMPORTS,
    ECB_DATAFLOWS,
)
from .generic_fetcher import fetch_multi_series

_SERIES = [
    ("Exports", KEY_ECB_TRD_EXPORTS),
    ("Imports", KEY_ECB_TRD_IMPORTS),
]

async def fetch_ecb_trd_data(
    cache: CacheService | None,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
) -> Dict[str, Dict[str, float]]:
    return await fetch_multi_series(
        cache,
        ECB_DATAFLOWS["TRD"],
        _SERIES,
        start_date,
        end_date,
        cache_ttl=7200,
    ) 