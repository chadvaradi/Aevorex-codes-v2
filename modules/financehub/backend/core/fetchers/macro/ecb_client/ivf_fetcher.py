"""ECB Investment Funds Statistics (IVF) fetcher."""
from __future__ import annotations

from datetime import date
from typing import Dict, Optional

from modules.financehub.backend.utils.cache_service import CacheService
from .config import (
    KEY_ECB_IVF_TOTAL_ASSETS,
    KEY_ECB_IVF_NET_FLOWS,
    ECB_DATAFLOWS,
)
from .generic_fetcher import fetch_multi_series

_SERIES = [
    ("Total_Assets", KEY_ECB_IVF_TOTAL_ASSETS),
    ("Net_Flows", KEY_ECB_IVF_NET_FLOWS),
]

async def fetch_ecb_ivf_data(
    cache: CacheService | None,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
) -> Dict[str, Dict[str, float]]:
    return await fetch_multi_series(
        cache,
        ECB_DATAFLOWS["IVF"],
        _SERIES,
        start_date,
        end_date,
        cache_ttl=7200,
    ) 