import json
import os
import sys
from pathlib import Path
import importlib

# Mock environment variables before importing any application code
os.environ["IS_OPENAPI_GENERATION"] = "true"
os.environ["FINBOT_GOOGLE_AUTH__ENABLED"] = "true"
os.environ["FINBOT_REDIS__HOST"] = "mock-redis"
os.environ["FINBOT_API_KEYS__EODHD"] = "mock-key"

# Add project root to the Python path to allow module imports
project_root = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(project_root))

from fastapi import FastAPI
# from modules.financehub.backend.api.endpoints.stock_endpoints import stock_router

# List of routers to include in the schema.
# Each entry is a tuple: (module_path, router_variable_name, prefix, tags)
ROUTERS_TO_INCLUDE = [
    ("modules.financehub.backend.api.endpoints.auth", "router", "/auth", ["Authentication"]),
    ("modules.financehub.backend.api.market_data", "router", "/market", ["Market Data"]),
    ("modules.financehub.backend.api.endpoints.ai.models", "router", "/ai", ["AI Services"]),
    ("modules.financehub.backend.api.endpoints.macro.rates", "router", "/macro", ["Macroeconomic Data"]),
    # The main stock router, re-enabled with error handling
    ("modules.financehub.backend.api.endpoints.stock_endpoints.router", "stock_router", "/stock", ["Stock Data"]),
]

output_dir = project_root / "docs"
output_path = output_dir / "openapi.json"

def generate_openapi_schema():
    """
    Generates the OpenAPI schema from a minimal FastAPI app instance,
    including all the API routers and mocking environment variables.
    """
    print("Generating OpenAPI schema...")

    # Create a minimal app instance with only the necessary components for schema generation
    app = FastAPI(
        title="AEVOREX FinanceHub API",
        version="2.5.0", # Bump version
        description="REST API for the AEVOREX FinanceHub, providing real-time stock data, news, and AI-driven analysis.",
    )
    
    # Include all routers dynamically and with error handling
    api_prefix = "/api/v1"
    
    print("Including routers...")
    for module_path, router_name, prefix, tags in ROUTERS_TO_INCLUDE:
        try:
            module = importlib.import_module(module_path)
            router_obj = getattr(module, router_name)
            app.include_router(router_obj, prefix=f"{api_prefix}{prefix}", tags=tags)
            print(f"  ✅ Successfully included router from: {module_path}")
        except Exception as e:
            print(f"  ⚠️  WARNING: Could not include router from '{module_path}'. Reason: {e}")
            print("      Skipping this router, but continuing schema generation.")

    openapi_schema = app.openapi()
    
    try:
        output_dir.mkdir(parents=True, exist_ok=True)
    except OSError as e:
        print(f"Error: Could not create directory {output_dir}. {e}")
        sys.exit(1)

    try:
        with open(output_path, "w", encoding="utf-8") as f:
            json.dump(openapi_schema, f, indent=2)
        print(f"✅ OpenAPI schema generated successfully at {output_path}")
    except IOError as e:
        print(f"Error: Could not write to file {output_path}. {e}")
        sys.exit(1)


if __name__ == "__main__":
    generate_openapi_schema() 