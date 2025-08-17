"""Yield Curve business logic (extracted from yield_curve.py)
Keeps complex fallback handling out of the FastAPI view so that the view
remains <160 LOC in compliance with Rule #008.
"""

from __future__ import annotations

from datetime import date, timedelta
from typing import Dict, Any, Optional

from modules.financehub.backend.core.services.macro_service import MacroDataService
from modules.financehub.backend.utils.date_utils import calculate_start_date
from modules.financehub.backend.api.endpoints.macro.ecb.models import ECBPeriod
from modules.financehub.backend.utils.logger_config import get_logger

logger = get_logger(__name__)

__all__ = [
    "build_yield_curve_response",
]

# ---------------------------------------------------------------------------
# Internal helpers -----------------------------------------------------------
# ---------------------------------------------------------------------------

async def _fetch_ecb(service: MacroDataService, s: date, e: date) -> dict | None:
    """Try the primary ECB SDMX source."""
    try:
        return await service.get_ecb_yield_curve(s, e)
    except Exception as exc:  # pragma: no cover – logged & handled upstream
        logger.warning("ECB SDMX yield-curve fetch failed: %s", exc)
        return None


# Fallback removed – Rule #008: no synthetic or alternate data sources. Only genuine ECB.


# ---------------------------------------------------------------------------
# Public builders ------------------------------------------------------------
# ---------------------------------------------------------------------------

async def build_yield_curve_response(
    service: MacroDataService,
    start_date: Optional[date],
    end_date: Optional[date],
    period: Optional[ECBPeriod],
) -> Dict[str, Any]:
    """End-to-end builder used by the main `/yield-curve` endpoint."""
    if end_date is None:
        end_date = date.today()

    if period:
        start_date = calculate_start_date(period, end_date)
    elif start_date is None:
        start_date = end_date - timedelta(days=365)

    data = await _fetch_ecb(service, start_date, end_date)
    if not data:
        from fastapi import HTTPException
        raise HTTPException(status_code=503, detail="Yield curve data unavailable (ECB unreachable)")

    source = "ECB SDMX (YC dataflow)"

    from datetime import datetime as _dt
    last_updated = _dt.utcnow().isoformat()
    return {
        "status": "success",
        "metadata": {
            "source": source,
            "unit": "%",
            "last_updated": last_updated,
            "date_range": {
                "start": start_date.isoformat(),
                "end": end_date.isoformat(),
                "period": period.value if period else "custom",
            },
        },
        "data": {"yields": data},
    }


# Deprecated lightweight variant removed – only full builder remains (no fallbacks) 