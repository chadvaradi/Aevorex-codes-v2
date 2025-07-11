"""ECB Investment Funds Statistics endpoint"""
from __future__ import annotations

from datetime import date
from typing import Optional

from fastapi import APIRouter, Depends, Query
import structlog

logger = structlog.get_logger(__name__)

from modules.financehub.backend.utils.cache_service import CacheService
from modules.financehub.backend.api.deps import get_cache_service
from modules.financehub.backend.core.services.macro_service import MacroDataService

router = APIRouter(prefix="/ivf", tags=["ECB IVF"])


def _svc(cache: CacheService | None) -> MacroDataService:
    return MacroDataService(cache)


@router.get("/")
async def get_ivf(
    start: Optional[date] = Query(None, description="Start date YYYY-MM-DD"),
    end: Optional[date] = Query(None, description="End date YYYY-MM-DD"),
    cache: CacheService = Depends(get_cache_service),
):
    try:
        data = await _svc(cache).get_ecb_ivf(start, end)
    except AttributeError:
        data = {}

    if not data:
        return {
            "status": "success",
            "metadata": {
                "source": "ECB SDMX (IVF)",
                "message": "Investment fund statistics unavailable – empty payload",
            },
            "data": {},
        }

    return {
        "status": "success",
        "count": len(data),
        "data": data,
    } 