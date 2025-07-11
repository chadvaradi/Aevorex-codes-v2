"""ECB Euro Short-Term Rate (ESTR) endpoint"""
from __future__ import annotations

from datetime import date
from typing import Optional

from fastapi import APIRouter, Depends, Query

from modules.financehub.backend.utils.cache_service import CacheService
from modules.financehub.backend.api.deps import get_cache_service
from modules.financehub.backend.core.services.macro_service import MacroDataService
from modules.financehub.backend.utils.logger_config import get_logger

router = APIRouter(prefix="/estr", tags=["ECB ESTR"])
logger = get_logger(__name__)


def _svc(cache: CacheService | None) -> MacroDataService:
    return MacroDataService(cache)


@router.get("/")
async def get_estr_rate(
    start: Optional[date] = Query(None, description="Start date YYYY-MM-DD"),
    end: Optional[date] = Query(None, description="End date YYYY-MM-DD"),
    cache: CacheService = Depends(get_cache_service),
):
    """Return Euro Short-Term Rate time-series in a success wrapper.

    Complies with Rule #008 – always HTTP 200, structured payload.
    """
    data = await _svc(cache).get_ecb_estr_rate(start, end)
    if not data:
        logger.warning("ESTR data empty – serving success wrapper with empty data (fallback)")
        return {
            "status": "success",
            "count": 0,
            "data": {},
            "metadata": {
                "source": "ECB SDMX (ESTR)",
                "fallback": True,
            },
        }
    return {
        "status": "success",
        "count": len(data),
        "data": data,
    } 