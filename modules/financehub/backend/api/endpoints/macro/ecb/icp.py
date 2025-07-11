"""ECB Inflation (HICP) API endpoint"""
from __future__ import annotations

from datetime import date
from typing import Optional

from fastapi import APIRouter, Depends, Query

# Updated import – MacroDataService relocated to macro_service.py and dependency
# injector now provided via utils.get_macro_service
from modules.financehub.backend.core.services.macro_service import MacroDataService
from .utils import get_macro_service

router = APIRouter(prefix="/hicp", tags=["ECB"])


@router.get("/")
async def get_hicp(
    start: Optional[date] = Query(None, description="Start date YYYY-MM-DD"),
    end: Optional[date] = Query(None, description="End date YYYY-MM-DD"),
    svc: MacroDataService = Depends(get_macro_service),
):
    """Return ECB HICP inflation data (overall/core/energy)."""
    try:
        data = await svc.get_ecb_inflation_indicators(start, end)
    except Exception:
        data = {}

    if not data:
        return {
            "status": "success",
            "metadata": {
                "source": "ECB SDMX (ICP)",
                "message": "Inflation indicators unavailable – empty payload",
            },
            "data": {},
        }

    return {"status": "success", "count": len(data), "data": data} 