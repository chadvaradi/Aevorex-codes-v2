"""ECB Bank Lending Survey (BLS) fetcher – credit standards net percentage balance."""
from __future__ import annotations

from datetime import date
from typing import Dict, Optional

from modules.financehub.backend.utils.cache_service import CacheService
from .config import ECB_DATAFLOWS, KEY_ECB_BLS_CREDIT_STANDARDS
from .generic_fetcher import fetch_multi_series

_SERIES = [("Credit_Standards", KEY_ECB_BLS_CREDIT_STANDARDS)]

async def fetch_ecb_bls_data(
    cache: CacheService | None,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
) -> Dict[str, Dict[str, float]]:
    return await fetch_multi_series(
        cache,
        ECB_DATAFLOWS["BLS"],
        _SERIES,
        start_date,
        end_date,
        cache_ttl=86400,
    ) 