"""ECB Monetary & Financial Institutions Interest Rates (MIR) endpoint"""
from __future__ import annotations

from datetime import date
from typing import Optional

from fastapi import APIRouter, Depends, Query

from modules.financehub.backend.core.services.macro_service import (
    MacroDataService,
)
from modules.financehub.backend.api.deps import get_cache_service
from modules.financehub.backend.utils.cache_service import CacheService

router = APIRouter(prefix="/mir", tags=["ECB MIR"])


def _get_macro_service(cache: CacheService | None) -> MacroDataService:
    return MacroDataService(cache)


@router.get("/")
async def get_mir_rates(
    start: Optional[date] = Query(None, description="Start date YYYY-MM-DD"),
    end: Optional[date] = Query(None, description="End date YYYY-MM-DD"),
    cache: CacheService = Depends(get_cache_service),
):
    """Return retail deposit & lending rates from MIR dataflow."""
    svc = _get_macro_service(cache)
    try:
        data = await svc.get_ecb_mir(start, end)
    except AttributeError:
        data = {}

    if not data:
        return {
            "status": "success",
            "metadata": {
                "source": "ECB SDMX (MIR)",
                "message": "Retail rates unavailable – empty payload",
            },
            "data": {},
        }

    return {"status": "success", "count": len(data), "data": data} 