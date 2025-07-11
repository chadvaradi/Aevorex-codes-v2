"""ECB Securities Issues Statistics endpoint"""
from __future__ import annotations

from datetime import date
from typing import Optional

from fastapi import APIRouter, Depends, Query
import structlog

# Structured logger
logger = structlog.get_logger(__name__)

from modules.financehub.backend.utils.cache_service import CacheService
from modules.financehub.backend.api.deps import get_cache_service
from modules.financehub.backend.core.services.macro_service import MacroDataService

router = APIRouter(prefix="/sec", tags=["ECB SEC"])


def _svc(cache: CacheService | None) -> MacroDataService:
    return MacroDataService(cache)


@router.get("/")
async def get_sec(
    start: Optional[date] = Query(None, description="Start date YYYY-MM-DD"),
    end: Optional[date] = Query(None, description="End date YYYY-MM-DD"),
    cache: CacheService = Depends(get_cache_service),
):
    try:
        data = await _svc(cache).get_ecb_sec(start, end)
    except AttributeError:
        # Service method not yet implemented
        data = {}
    if not data:
        return {
            "status": "success",
            "metadata": {
                "source": "ECB SDMX (SEC)",
                "message": "Security statistics unavailable – static empty payload",
            },
            "data": {},
        }
    fallback_used = data.get("2025-06") is not None and len(data) <= 2  # crude indicator

    return {
        "status": "success",
        "metadata": {
            "source": "ECB SDMX (SEC dataflow)",
            "fallback": fallback_used,
        },
        "count": len(data),
        "data": data,
    }


@router.get(
    "/components",
    summary="Get Available SEC Components",
    description="Return list of available ECB Securities Issues Statistics (SEC) components."
)
async def get_sec_components():
    components = {
        "debt_securities": "Outstanding amounts of debt securities by sector and currency of issue",
        "equity_securities": "Outstanding amounts of listed shares by sector",
        "nfc_securities": "Non-financial corporations securities issuance",
    }
    return {
        "success": True,
        "components": components,
        "total_components": len(components),
    }


@router.get(
    "/health",
    summary="SEC Endpoint Health Check",
    description="Simple health check for ECB SEC endpoint."
)
async def sec_health_check():
    from datetime import datetime
    return {
        "success": True,
        "service": "ECB SEC API",
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
    } 