"""BOP business logic extracted from bop.py (Rule #008)"""
from __future__ import annotations

from datetime import date, timedelta
from typing import Optional, Dict, Any

from modules.financehub.backend.core.fetchers.macro.ecb_client import fetch_ecb_bop_data
from modules.financehub.backend.utils.logger_config import get_logger
from modules.financehub.backend.utils.cache_service import CacheService

logger = get_logger(__name__)

_static_bop = {
    "2024-Q2": {"Current_Account": 67.3, "Trade_Balance": 52.1, "Services_Balance": 26.4},
}

__all__ = ["build_bop_response"]

async def _fetch_bop(cache: CacheService | None, s: date, e: date) -> dict | None:
    try:
        return await fetch_ecb_bop_data(cache=cache, start_date=s, end_date=e)
    except Exception as exc:
        logger.warning("ECB BOP fetch failed: %s", exc)
        return None

async def build_bop_response(
    cache: CacheService | None,
    start_date: Optional[date],
    end_date: Optional[date],
    components: Optional[list[str]] = None,
) -> Dict[str, Any]:
    if end_date is None:
        end_date = date.today()
    if start_date is None:
        start_date = end_date - timedelta(days=730)

    data = await _fetch_bop(cache, start_date, end_date)
    source = "ECB SDMX (BOP dataflow)"

    if not data:
        data = _static_bop
        source = "static-fallback (Eurostat public)"

    # Filter components if requested
    if components:
        filt: dict[str, dict[str, float]] = {}
        for dkey, rec in data.items():
            filt[dkey] = {k: v for k, v in rec.items() if k in components}
        data = filt

    metadata: Dict[str, Any] = {
        "source": source,
        "start_date": start_date.isoformat(),
        "end_date": end_date.isoformat(),
        "records": len(data),
        "components": list({k for rec in data.values() for k in rec}) if data else [],
    }

    return {"status": "success", "metadata": metadata, "data": data} 