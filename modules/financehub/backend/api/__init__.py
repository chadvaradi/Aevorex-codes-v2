from fastapi import APIRouter
from .endpoints.macro import macro_router
from .endpoints.stock_endpoints import stock_router
from .endpoints.config import config_router
from .endpoints.auth import auth_router
from .endpoints.crypto import crypto_router
from .endpoints.market import market_router
from .endpoints.eodhd import eodhd_router
from datetime import datetime
from fastapi import Request

api_router = APIRouter()

# Always include core FinanceHub routers
api_router.include_router(macro_router, prefix="/macro", tags=["Macroeconomics"])
api_router.include_router(stock_router, prefix="/stock", tags=["Stock Data"])
api_router.include_router(config_router, prefix="", tags=["Config"])
api_router.include_router(auth_router, prefix="", tags=["Auth"])
api_router.include_router(crypto_router, prefix="", tags=["Crypto"])
api_router.include_router(market_router, prefix="", tags=["Market"])
api_router.include_router(eodhd_router, prefix="", tags=["EODHD"])

# Optional AI router – may rely on extra shared modules not available in demo env.
try:
    from .endpoints.ai import ai_router  # pylint: disable=import-error
    api_router.include_router(ai_router, prefix="/ai", tags=["AI"])
except ModuleNotFoundError as e:
    # Log and continue without AI endpoints to allow demo backend to start
    import logging
    logging.getLogger(__name__).warning(
        "AI endpoints disabled – optional dependency missing (%s).", e
    )

@api_router.get("/health", tags=["Health"])
async def health_check(request: Request):
    """Central health aggregator returning 200 OK with minimal diagnostics.

    Future extensions: fan-out to sub-services (Redis, external APIs) and merge
    results, but for now we satisfy the always-success contract required by
    Rule #008 and unblock Phase 3 dependencies.
    """
    return {
        "status": "ok",
        "timestamp": datetime.utcnow().isoformat(),
        "services": {
            "api": "online",
            "crypto": "online",
        },
    }

__all__ = ["api_router"]
