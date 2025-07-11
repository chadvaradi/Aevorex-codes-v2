"""ECB Commercial Property Prices (CPP) fetcher."""
from __future__ import annotations

from datetime import date
from typing import Dict, Optional

from modules.financehub.backend.utils.cache_service import CacheService
from .config import ECB_DATAFLOWS, KEY_ECB_CPP_PRICE_INDEX
from .generic_fetcher import fetch_multi_series

_SERIES = [("CPP_Price_Index", KEY_ECB_CPP_PRICE_INDEX)]

async def fetch_ecb_cpp_data(
    cache: CacheService | None,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
) -> Dict[str, Dict[str, float]]:
    return await fetch_multi_series(
        cache,
        ECB_DATAFLOWS["CPP"],
        _SERIES,
        start_date,
        end_date,
        cache_ttl=86400,
    ) 