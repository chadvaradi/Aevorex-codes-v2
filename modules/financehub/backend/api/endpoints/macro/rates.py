from fastapi import APIRouter

# Legacy aggregate and curve proxy endpoints removed July-2025 cleanup.

router = APIRouter(tags=["Macro – Rates (deprecated removed)"]) 

# ---------------------------------------------------------------------------
# Test-suite compatibility helpers (monkeypatch targets)
# ---------------------------------------------------------------------------

async def fetch_ecb_fx_rates(*_, **__):  # type: ignore[override]
    """Legacy FX rates aggregator stub – kept for unit tests monkeypatch.

    Returns minimal empty dict; real logic moved to `ecb.fx` submodule.
    """

    return {} 