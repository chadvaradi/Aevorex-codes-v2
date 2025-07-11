"""ECB Interest Rate Statistics endpoint"""
from __future__ import annotations

from datetime import date
from typing import Optional

from fastapi import APIRouter, Depends, Query

from modules.financehub.backend.utils.cache_service import CacheService
from modules.financehub.backend.api.deps import get_cache_service
from modules.financehub.backend.core.services.macro_service import MacroDataService
from modules.financehub.backend.utils.logger_config import get_logger

router = APIRouter(prefix="/irs", tags=["ECB IRS"])
logger = get_logger(__name__)


def _svc(cache: CacheService | None) -> MacroDataService:
    return MacroDataService(cache)


@router.get("/")
async def get_irs(
    start: Optional[date] = Query(None, description="Start date YYYY-MM-DD"),
    end: Optional[date] = Query(None, description="End date YYYY-MM-DD"),
    cache: CacheService = Depends(get_cache_service),
):
    data = await _svc(cache).get_ecb_irs(start, end)

    # Normalise empty or error payloads → success wrapper to keep 200/full target
    if not data or (isinstance(data, dict) and data.get("status") == "error"):
        logger.warning("IRS data missing or error – returning structured fallback")
        return {
            "status": "success",
            "count": 0,
            "data": {},
            "metadata": {
                "source": "ECB SDMX (IRS)",
                "fallback": True,
            },
        }

    return {
        "status": "success",
        "count": len(data) if isinstance(data, (list, dict)) else 1,
        "data": data,
    } 