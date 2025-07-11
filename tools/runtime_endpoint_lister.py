import json
import sys
import inspect
from pathlib import Path
import os
import logging
from typing import Any

# Disable logging to prevent it from interfering with the JSON output
logging.disable(logging.CRITICAL)

# Add project root to path to allow module imports
# tools/runtime_endpoint_lister.py -> tools -> <root>
project_root = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(project_root))

# --- Tool-specific environment setup ---
# Set env var to disable Google Auth, which we don't need for this tool
os.environ["FINBOT_GOOGLE_AUTH__ENABLED"] = "false"

from fastapi.routing import APIRoute
from modules.financehub.backend.app_factory import create_app

def get_source_file_for_endpoint(endpoint_func: Any) -> str:
    """Tries to find the source file of an endpoint function."""
    try:
        # For decorated functions, the real function is often in .func
        actual_func = endpoint_func
        while hasattr(actual_func, 'func'):
            actual_func = actual_func.func
            
        source_file = inspect.getsourcefile(actual_func)
        if source_file:
            return str(Path(source_file).relative_to(project_root))
    except (TypeError, ValueError):
        # Fallback for complex cases like functools.partial or other wrappers
        pass

    # Last resort using __code__ object if inspect fails
    if hasattr(endpoint_func, '__code__'):
        return str(Path(endpoint_func.__code__.co_filename).relative_to(project_root))
        
    return "N/A (dynamic or wrapped)"

def list_routes():
    """Creates the FastAPI app and lists all registered APIRoutes."""
    try:
        app = create_app()
        output = []
        PRIMARY_METHODS = {"GET", "POST", "PUT", "PATCH", "DELETE"}

        for route in app.routes:
            if not isinstance(route, APIRoute):
                continue  # Skip non-HTTP routes (e.g., WebSocket, Mount)

            # 1) Filter for /api/v1 prefix only
            if not route.path.startswith("/api/v1"):
                continue

            # 2) Filter methods to primary HTTP verbs
            allowed_methods = sorted(m for m in route.methods if m in PRIMARY_METHODS)

            if not allowed_methods:
                continue  # Skip OPTIONS/HEAD-only helper routes

            output.append({
                "path": route.path,
                "methods": allowed_methods,
                "name": route.name,
                "source_file": get_source_file_for_endpoint(route.endpoint),
            })
        
        # Successful output to stdout
        print(json.dumps(output, indent=2))
        return 0

    except ImportError as e:
        error_output = {
            "error": "Failed to list routes due to an ImportError.",
            "details": str(e),
            "module_name": e.name,
            "suggestion": "An import cycle or missing dependency is likely preventing the app from starting."
        }
        # Error output to stderr
        print(json.dumps(error_output, indent=2), file=sys.stderr)
        return 2 # Explicit exit code as per plan
    except Exception as e:
        error_output = {
            "error": "An unexpected error occurred while creating the app.",
            "details": str(e),
            "type": type(e).__name__
        }
        print(json.dumps(error_output, indent=2), file=sys.stderr)
        return 1

if __name__ == "__main__":
    # The function now returns an exit code
    exit_code = list_routes()
    sys.exit(exit_code) 