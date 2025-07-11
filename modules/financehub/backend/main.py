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