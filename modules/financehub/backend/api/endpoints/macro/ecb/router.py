"""
ECB Main Router
==============

Main router that combines all ECB endpoint modules.
"""

from fastapi import APIRouter

from .rates import rates_router
from .yield_curve import yield_curve_router
from .fx import fx_router
from .comprehensive import comprehensive_router
from .bop import router as bop_router
from .sts import router as sts_router
from .bsi import router as bsi_router
from .mir import router as mir_router  # noqa: F401

# Advanced dataflows – fully integrated
from .sec import router as sec_router  # noqa: F401
from .ivf import router as ivf_router  # noqa: F401
from .cbd import router as cbd_router  # noqa: F401
from .rpp import router as rpp_router  # noqa: F401
# Optional CPP router – may be missing in early builds
try:
    from .cpp import router as cpp_router  # noqa: F401
except ModuleNotFoundError:  # Rule #008 tolerate missing dataflow but keep success responses
    from fastapi import APIRouter

    cpp_router = APIRouter(prefix="/cpp", tags=["ECB CPP"])

    @cpp_router.get("/")
    async def cpp_placeholder():
        return {
            "status": "success",
            "count": 0,
            "data": {},
            "metadata": {
                "source": "placeholder",
                "missing": True,
            },
        }
from .bls import router as bls_router  # noqa: F401
from .spf import router as spf_router  # noqa: F401
from .ciss import router as ciss_router  # noqa: F401
from .trd import router as trd_router  # noqa: F401
from .pss import router as pss_router  # noqa: F401
from .irs import router as irs_router  # noqa: F401

# Create main ECB router
router = APIRouter(
    prefix="/ecb",
    tags=["ECB", "European Central Bank"]
)

# Include all sub-routers
router.include_router(rates_router)
router.include_router(yield_curve_router)
router.include_router(fx_router)
router.include_router(comprehensive_router)
router.include_router(bop_router)
router.include_router(sts_router)
router.include_router(bsi_router)
router.include_router(mir_router)

# Advanced dataflows
router.include_router(sec_router)
router.include_router(ivf_router)
router.include_router(cbd_router)
router.include_router(rpp_router)
router.include_router(cpp_router)
router.include_router(bls_router)
router.include_router(spf_router)
router.include_router(ciss_router)
router.include_router(trd_router)
router.include_router(pss_router)
# Final sub-router
router.include_router(irs_router) 

# Lightweight policy-notes placeholder to avoid 404 in UI tooltips
@router.get("/policy-notes", tags=["ECB"], summary="Policy notes (placeholder)")
async def policy_notes_placeholder():
    return {
        "status": "success",
        "data": [
            {
                "date": "2025-08-08",
                "note": "ECB policy notes service not configured in dev; this is a placeholder.",
                "source": "ecb",
                "relevance_score": 0.7,
            }
        ],
    }