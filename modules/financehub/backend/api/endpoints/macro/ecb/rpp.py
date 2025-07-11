"""ECB Residential Property Prices endpoint"""
from __future__ import annotations

from datetime import date
from typing import Optional

from fastapi import APIRouter, Depends, Query

from modules.financehub.backend.utils.cache_service import CacheService
from modules.financehub.backend.api.deps import get_cache_service
from modules.financehub.backend.core.services.macro_service import MacroDataService
from modules.financehub.backend.utils.logger_config import get_logger

router = APIRouter(prefix="/rpp", tags=["ECB RPP"])
logger = get_logger(__name__)


def _svc(cache: CacheService | None) -> MacroDataService:
    return MacroDataService(cache)


@router.get("/")
async def get_rpp(
    start: Optional[date] = Query(None, description="Start date YYYY-MM-DD"),
    end: Optional[date] = Query(None, description="End date YYYY-MM-DD"),
    cache: CacheService = Depends(get_cache_service),
):
    data = await _svc(cache).get_ecb_rpp(start, end)
    if not data:
        logger.warning("RPP data empty – serving success wrapper with empty data (fallback)")
        return {
            "status": "success",
            "count": 0,
            "data": {},
            "metadata": {
                "source": "ECB SDMX (RPP)",
                "fallback": True,
            },
        }
    return {"status": "success", "count": len(data), "data": data}

# Register a second route without trailing slash so both /rpp and /rpp/ return 200 OK
router.add_api_route(
    path="",
    endpoint=get_rpp,  # type: ignore[arg-type]
    methods=["GET"],
    include_in_schema=False,
    name="get_rpp_no_slash",
) 