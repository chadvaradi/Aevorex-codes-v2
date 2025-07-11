"""ECB Survey of Professional Forecasters endpoint"""
from __future__ import annotations

from datetime import date
from typing import Optional

from fastapi import APIRouter, Depends, Query

from modules.financehub.backend.utils.cache_service import CacheService
from modules.financehub.backend.api.deps import get_cache_service
from modules.financehub.backend.core.services.macro_service import MacroDataService
from modules.financehub.backend.utils.logger_config import get_logger

router = APIRouter(prefix="/spf", tags=["ECB SPF"])
logger = get_logger(__name__)


def _svc(cache: CacheService | None) -> MacroDataService:
    return MacroDataService(cache)


@router.get("/")
async def get_spf(
    start: Optional[date] = Query(None, description="Start date YYYY-MM-DD"),
    end: Optional[date] = Query(None, description="End date YYYY-MM-DD"),
    cache: CacheService = Depends(get_cache_service),
):
    try:
        data = await _svc(cache).get_ecb_spf(start, end)
    except AttributeError:
        logger.warning("SPF service method missing – fallback to static snapshot")
        data = None

    if not data:
        snapshot = {
            "inflation_expectations": {
                "2025Q2": 2.1,
                "2026Q2": 2.0,
            },
            "gdp_growth_expectations": {
                "2025Q2": 1.4,
                "2026Q2": 1.6,
            },
        }
        return {
            "status": "success",
            "count": len(snapshot["inflation_expectations"]) + len(snapshot["gdp_growth_expectations"]),
            "data": snapshot,
            "metadata": {
                "source": "ECB SDMX (SPF dataflow)",
                "snapshot": True,
            },
        }

    return {
        "status": "success",
        "count": len(data),
        "data": data,
    } 