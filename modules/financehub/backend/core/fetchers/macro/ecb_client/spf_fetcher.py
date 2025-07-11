"""ECB Survey of Professional Forecasters (SPF) fetcher – GDP forecast median."""
from __future__ import annotations

from datetime import date
from typing import Dict, Optional

from modules.financehub.backend.utils.cache_service import CacheService
from .config import ECB_DATAFLOWS, KEY_ECB_SPF_GDP_FORECAST
from .generic_fetcher import fetch_multi_series

_SERIES = [("GDP_Forecast", KEY_ECB_SPF_GDP_FORECAST)]

async def fetch_ecb_spf_data(
    cache: CacheService | None,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
) -> Dict[str, Dict[str, float]]:
    return await fetch_multi_series(
        cache,
        ECB_DATAFLOWS["SPF"],
        _SERIES,
        start_date,
        end_date,
        cache_ttl=86400,
    ) 