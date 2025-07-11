"""
BUBOR Data Endpoint
Provides BUBOR (Budapest Interbank Offered Rate) data.
"""
from fastapi import APIRouter, status, Depends, Query
from fastapi.responses import JSONResponse
from datetime import datetime, date, timedelta
from typing import Optional
# Unified date utilities
from modules.financehub.backend.utils.date_utils import PeriodEnum, calculate_start_date

from modules.financehub.backend.core.services.macro_service import MacroDataService
from modules.financehub.backend.api.endpoints.macro.ecb import get_macro_service

# Local PeriodEnum and helper function removed – using canonical implementation from utils.date_utils.

router = APIRouter(
    prefix="",
    tags=["Macroeconomic Data", "BUBOR"]
)

# Canonical path without trailing slash – exposed in OpenAPI
@router.get("", summary="Get BUBOR Rates", status_code=status.HTTP_200_OK)
async def get_bubor_curve(
    service: MacroDataService = Depends(get_macro_service),
    start_date: Optional[date] = Query(None, description="Start date for historical data (YYYY-MM-DD)"),
    end_date: Optional[date] = Query(None, description="End date for historical data (YYYY-MM-DD)"),
    period: Optional[PeriodEnum] = Query(None, description="Time period for data retrieval (1d, 1w, 1m, 6m, 1y)")
):
    """
    Returns historical BUBOR rates for a specified date range.
    Enhanced with period support for consistent API interface.
    
    Parameters:
    - start_date: Custom start date
    - end_date: Custom end date (defaults to today)
    - period: Predefined time period (overrides start_date if both provided)
    """
    # Set default end date
    if end_date is None:
        end_date = date.today()
    
    # Calculate start date based on period or use provided start_date
    if period:
        start_date = calculate_start_date(period, end_date)
    elif start_date is None:
        start_date = end_date - timedelta(days=30)  # Default 1 month

    try:
        bubor_data = await service.get_bubor_history(start_date, end_date)
        
        return {
            "status": "success",
            "metadata": {
                "source": "MNB (Live XLS)",
                "timestamp": datetime.utcnow().isoformat(),
                "date_range": {
                    "start": start_date.isoformat(),
                    "end": end_date.isoformat(),
                    "period": period.value if period else "custom"
                }
            },
            "rates": bubor_data,
            "message": "BUBOR rates retrieved successfully."
        }
    except Exception as e:
        return JSONResponse(
            status_code=status.HTTP_200_OK,
            content={
                "status": "success",
                "metadata": {
                    "source": "MNB (BUBOR)",
                    "message": f"BUBOR fetch error – {str(e)}",
                },
                "rates": {},
            }
        ) 

# Hidden trailing-slash alias maintained for backwards compatibility
@router.get("/", summary="Get BUBOR Rates (trailing slash alias)", include_in_schema=False, status_code=status.HTTP_200_OK)
async def get_bubor_curve_trailing_slash(
    service: MacroDataService = Depends(get_macro_service),
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
    period: Optional[PeriodEnum] = Query(None),
):
    """Thin wrapper – delegates to canonical no-slash handler."""
    return await get_bubor_curve(service, start_date, end_date, period) 