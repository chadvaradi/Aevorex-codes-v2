# backend/main.py
# =============================================================================
# Main Application Entry Point
# =============================================================================

import sys
import os
from pathlib import Path
from modules.financehub.backend.config.env_loader import load_environment_once

# Ensure env variables are loaded once at startup
load_environment_once()

# ---------------------------------------------------------------------------
# Python 3.13 compatibility shim – pandas_ta still imports `pkg_resources` from
# setuptools.  The package is deprecated and may be missing in slim venvs.  We
# create a minimal stub so any third-party import succeeds without having to
# install the full setuptools payload or require root permissions.
# ---------------------------------------------------------------------------
import types, sys

if "pkg_resources" not in sys.modules:  # pragma: no cover – define only once
    _pkg_resources = types.ModuleType("pkg_resources")

    class _DistNotFound(Exception):
        """Placeholder for pkg_resources.DistributionNotFound."""

    def _get_distribution(_: str):  # noqa: D401 – exact signature not needed
        """Return a dummy distribution object with `.version` attr."""
        class _Dummy:  # noqa: D401 – simple stub
            version = "0.0.0"

        return _Dummy()

    _pkg_resources.DistributionNotFound = _DistNotFound  # type: ignore[attr-defined]
    _pkg_resources.get_distribution = _get_distribution  # type: ignore[attr-defined]

    sys.modules["pkg_resources"] = _pkg_resources

# --- Path setup to allow module imports ---
current_dir = Path(__file__).resolve().parent
project_root = current_dir.parent.parent.parent
if str(project_root) not in sys.path:
    sys.path.insert(0, str(project_root))

# --- Import modules after path is set ---
from modules.financehub.backend.app_factory import create_app

# --- Create FastAPI application ---
app = create_app()

# --- Development server execution ---
if __name__ == "__main__":
    import uvicorn
    reload_enabled = os.getenv("UVICORN_RELOAD", "false").lower() in {"1", "true", "yes"}
    uvicorn.run(
        "modules.financehub.backend.main:app",
        host="127.0.0.1",
        port=8084,
        reload=reload_enabled,
        reload_dirs=["modules/financehub/backend"] if reload_enabled else None,
    )