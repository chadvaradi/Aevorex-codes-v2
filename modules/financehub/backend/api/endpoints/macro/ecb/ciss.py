"""ECB CISS endpoint"""
from __future__ import annotations

from datetime import date
from typing import Optional

from fastapi import APIRouter, Depends, Query

from modules.financehub.backend.utils.cache_service import CacheService
from modules.financehub.backend.api.deps import get_cache_service
from modules.financehub.backend.core.services.macro_service import MacroDataService
from modules.financehub.backend.utils.logger_config import get_logger

router = APIRouter(prefix="/ciss", tags=["ECB CISS"])
logger = get_logger(__name__)


def _svc(cache: CacheService | None) -> MacroDataService:
    return MacroDataService(cache)


@router.get("/")
async def get_ciss(
    start: Optional[date] = Query(None, description="Start date YYYY-MM-DD"),
    end: Optional[date] = Query(None, description="End date YYYY-MM-DD"),
    cache: CacheService = Depends(get_cache_service),
):
    try:
        data = await _svc(cache).get_ecb_ciss(start, end)
    except AttributeError as exc:
        logger.error("CISS service dependency missing: %s", exc)
        data = None

    if not data:
        from fastapi import HTTPException
        raise HTTPException(status_code=503, detail="ECB CISS data unavailable")

    return {
        "status": "success",
        "count": len(data),
        "data": data,
    } 