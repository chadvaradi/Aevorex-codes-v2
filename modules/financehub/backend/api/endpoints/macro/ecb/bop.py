"""
ECB Balance of Payments Endpoints
================================

FastAPI endpoints for ECB Balance of Payments data.
"""

# ------------- BOP view – <160 LOC -------------
from datetime import date
from typing import Optional

from fastapi import APIRouter, Depends, Query

from modules.financehub.backend.utils.cache_service import CacheService
from modules.financehub.backend.api.deps import get_cache_service

from .bop_logic import build_bop_response


router = APIRouter(prefix="/bop", tags=["ECB Balance of Payments"])


@router.get("/", summary="Get ECB Balance of Payments Data")
async def get_ecb_bop(
    start_date: Optional[date] = Query(None, description="Start date (YYYY-MM-DD), default = 3Y ago"),
    end_date: Optional[date] = Query(None, description="End date (YYYY-MM-DD), default = today"),
    cache_service: CacheService = Depends(get_cache_service),
    components: Optional[str] = Query(None, description="Comma-separated BOP components"),
):
    comp = [c.strip() for c in components.split(",")] if components else None
    return await build_bop_response(cache_service, start_date, end_date, comp)

@router.get(
    "/components",
    summary="Get Available BOP Components",
    description="Get list of available Balance of Payments components."
)
async def get_bop_components():
    """
    Get available BOP components.
    
    Returns:
        List of available BOP components with descriptions
    """
    components = {
        "current_account": "Current Account Balance",
        "trade_balance": "Trade Balance (Goods)",
        "services_balance": "Services Balance",
        "income_balance": "Primary Income Balance",
        "capital_account": "Capital Account Balance",
        "direct_investment": "Direct Investment",
        "portfolio_investment": "Portfolio Investment",
        "financial_derivatives": "Financial Derivatives"
    }
    
    return {
        "success": True,
        "components": components,
        "total_components": len(components)
    }

@router.get(
    "/health",
    summary="BOP Endpoint Health Check",
    description="Check if the BOP endpoint is healthy."
)
async def bop_health_check():
    """Health check for BOP endpoint."""
    return {
        "success": True,
        "service": "ECB BOP API",
        "status": "healthy",
        "timestamp": date.today().isoformat()
    } 