"""FX business logic extracted from fx.py (Rule #008)"""
from __future__ import annotations

from datetime import date, timedelta
from typing import Optional, Dict, Any

from modules.financehub.backend.core.services.macro_service import MacroDataService
from modules.financehub.backend.utils.logger_config import get_logger

logger = get_logger(__name__)

__all__ = ["build_fx_response"]

_static_spot = {
    "USD": 1.0895,
    "GBP": 0.8482,
    "JPY": 173.41,
    "CHF": 0.9578,
}

async def build_fx_response(
    service: MacroDataService,
    start_date: Optional[date],
    end_date: Optional[date],
) -> Dict[str, Any]:
    if end_date is None:
        end_date = date.today()
    if start_date is None:
        start_date = end_date - timedelta(days=30)

    try:
        fx_data = await service.get_ecb_fx_rates(start_date, end_date)
    except Exception as exc:
        logger.warning("ECB FX fetch failed: %s", exc)
        fx_data = None

    if not fx_data:
        fx_data = {k: {end_date.isoformat(): v} for k, v in _static_spot.items()}
        source = "static-fallback (ECB reference)"
    else:
        source = "ECB SDMX (EXR dataflow)"

    return {
        "status": "success",
        "metadata": {
            "source": source,
            "date_range": {"start": start_date.isoformat(), "end": end_date.isoformat()},
        },
        "data": {"fx_rates": fx_data},
    } 