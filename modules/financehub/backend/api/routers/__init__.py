from fastapi import APIRouter

from ..endpoints.ai import ai_router
from ..endpoints.auth import router as auth_router
from ..endpoints.macro import macro_router
from ..endpoints.stock_endpoints import stock_router
from ..market_data import router as market_data_router

api_router = APIRouter()

api_router.include_router(stock_router, prefix="/stock", tags=["Stock"])
api_router.include_router(auth_router, prefix="/auth", tags=["Auth"])
api_router.include_router(macro_router, prefix="/macro", tags=["Macro"])
api_router.include_router(ai_router, prefix="/ai", tags=["AI"])
api_router.include_router(market_data_router, prefix="/market", tags=["Market Data"]) 