"""Main router for all Macroeconomic endpoints."""

from fastapi import APIRouter

from .ecb import router as ecb_router
from .rates import router as rates_router
from .bubor import router as bubor_router
from .forex import router as forex_router
from .curve import curve_router

macro_router = APIRouter(
    tags=["Macro"]
)

macro_router.include_router(ecb_router)
macro_router.include_router(rates_router)
macro_router.include_router(bubor_router, prefix="/bubor")
macro_router.include_router(forex_router)
macro_router.include_router(curve_router)

__all__ = ["macro_router"] 