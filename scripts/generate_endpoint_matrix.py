import re
import argparse
import json
import sys
from pathlib import Path
from collections import defaultdict
import subprocess

# --- Tool-specific Imports ---
# Add project root to path to allow direct import of the lister tool
WORKSPACE_ROOT = Path(__file__).parent.parent
sys.path.insert(0, str(WORKSPACE_ROOT))

# --- Constants ---
# Paths
BACKEND_ROOT = WORKSPACE_ROOT / "modules" / "financehub" / "backend"
FRONTEND_ROOT = WORKSPACE_ROOT / "shared" / "frontend" / "src"

# Regex patterns
#   1) FastAPI method decorators
ENDPOINT_REGEX = re.compile(r'@router\.(get|post|put|delete|patch)\s*\(\s*[fF]?["\'`](/[^"\'`)]*)')
#   2) APIRouter instantiation with an inline prefix, e.g. APIRouter(prefix="/fundamentals")
ROUTER_PREFIX_REGEX = re.compile(r'APIRouter\s*\([^\)]*?prefix\s*=\s*[fF]?["\'`](/[^"\'`]*)')
#   3) Frontend API-call detection regex – v6
#  – Támogatja: fetch(`..`), axios.get(".."), api.post('..'), useSWR("..", …)
#  – Elfogad backtick-es template stringet, idézőjeles literált, a hívófüggvény előtagját pedig
#    rugalmasan kezeli.
#  – A kifogott 1. csoport mindig a path-literal (pl. /api/v1/stock/search).

FETCH_REGEX = re.compile(
    r'(?:fetch|axios\.(?:get|post|put|delete|patch)|api\.(?:get|post|put|delete)|useSWR)\s*'  # hívó
    r'\(\s*(?:<[^>]+>\s*)?'                              # opcionális TypeScript generics
    r'(?:[`\'\"])'                                       # nyitó string
    r'([^`\'\"]+)'                                        # >>> path literal <<<
    r'(?:[`\'\"])',                                       # string vége
    re.IGNORECASE,
)

# Fallback: bármilyen string literal, ha /api/v1 vagy /stock stb. szerepel benne
ANY_API_LITERAL_REGEX = re.compile(r'[`\'\"](/(?:api/v[0-9]|stock|macro|auth|market)[^`\'\"]+)[`\'\"]', re.IGNORECASE)

def _derive_api_prefix_from_path(relative_path: str) -> str:
    """More robust heuristic to map file path segments to api/v1 prefixes."""
    path_str = str(relative_path)
    
    # Highest priority: check for explicit router files first
    if "api/endpoints/stock_endpoints/chat/router.py" in path_str:
        return "/api/v1/stock/chat" # Handle specific nested router

    # General prefixes based on directory structure
    if "stock_endpoints" in path_str:
        return "/api/v1/stock"
    if "macro" in path_str:
        return "/api/v1/macro"
    if "auth.py" in path_str:
        return "/api/v1/auth"
        
    # Fallback for general top-level routers
    if "api/market_data.py" in path_str:
        return "/api/v1/market"
    if "api/endpoints/health.py" in path_str:
        return "" # Health endpoint is at the root
        
    return "/api/v1" # Default fallback

def _extract_router_prefix(content: str) -> str:
    """Return the first router-level prefix defined in the file, if any."""
    m = ROUTER_PREFIX_REGEX.search(content)
    if m:
        prefix = m.group(1)
        # Ignore absolute prefixes that already contain /api/v (they will duplicate base prefix)
        if prefix.startswith("/api"):
            return ""
        return prefix
    return ""  # No prefix found

def discover_backend_endpoints_runtime():
    """
    Finds all FastAPI endpoints by calling the runtime introspection function directly.
    Returns a dictionary of endpoints.
    """
    print("Executing runtime endpoint lister via direct function call...")
    project_root = Path(__file__).parent.parent
    lister_script_path = project_root / "tools" / "runtime_endpoint_lister.py"
    
    try:
        process = subprocess.run(
            [sys.executable, str(lister_script_path)],
            capture_output=True,
            text=True,
            check=True
        )

        raw_out = process.stdout.lstrip()
        # Some versions of app_factory print an env-loaded banner before the JSON '['
        first_json_idx = raw_out.find("[") if raw_out.strip().startswith("[") else raw_out.find("[")
        if first_json_idx == -1:
            raise json.JSONDecodeError("No JSON array found in runtime lister output", raw_out, 0)
        json_payload = raw_out[first_json_idx:]

        endpoints_data = json.loads(json_payload)
        if not endpoints_data:
            print("Warning: Runtime lister returned no endpoints. The app might have failed to start.")
            return {}

        # Restructure the data to match the expected format: {path: [details]}
        endpoints = defaultdict(list)
        for ep in endpoints_data:
            # The lister gives the full path, which is what we want.
            full_path = ep["path"]
            endpoints[full_path].append({
                "method": ", ".join(ep["methods"]),
                "file": ep.get("source_file", "N/A")
            })
        
        print(f"Successfully found {len(endpoints)} unique endpoint paths via runtime introspection.")
        return endpoints

    except (subprocess.CalledProcessError, json.JSONDecodeError) as e:
        print(f"An unexpected error occurred during runtime endpoint discovery: {e}")
        sys.exit(1)

def find_frontend_api_calls():
    """Finds all API calls in the frontend source code."""
    print(f"Scanning for API calls in: {FRONTEND_ROOT}")
    frontend_calls = set()
    # Ensure we scan both .ts and .tsx files, avoiding duplicates
    ts_files = list(FRONTEND_ROOT.rglob("*.ts")) + list(FRONTEND_ROOT.rglob("*.tsx"))
    print(f"Found {len(set(ts_files))} unique TypeScript files to scan.")
    
    for filepath in set(ts_files):
        try:
            with open(filepath, "r", encoding="utf-8") as f:
                content = f.read()
                matches = list(FETCH_REGEX.finditer(content)) + list(ANY_API_LITERAL_REGEX.finditer(content))
                for match in matches:
                    call = match.group(1)
                    if not call.startswith('/api/v1'):
                        call = f"/api/v1{call}"

                    normalized_call = re.sub(r'\$\{[^}]+\}', '{ticker}', call)
                    frontend_calls.add(normalized_call)
        except Exception as e:
            print(f"Warning: Could not read {filepath}: {e}")
            
    print(f"Found {len(frontend_calls)} unique frontend API calls.")
    return frontend_calls

def generate_matrix_tsv(backend_endpoints, frontend_calls):
    """Generates the TSV content for the endpoint matrix."""
    header = "Backend Endpoint\tMethod\tImplemented in\tFrontend Usage"
    lines = [header]

    all_paths = sorted(backend_endpoints.keys())
    
    # Normalize frontend calls for faster lookup
    normalized_frontend_calls = {re.sub(r'\{.*?\}', '{ticker}', call) for call in frontend_calls}
    
    for path in all_paths:
        normalized_backend_path = re.sub(r'\{.*?\}', '{ticker}', path)
        
        usage_status = "NOT_USED"
        if normalized_backend_path in normalized_frontend_calls:
            usage_status = "USED"
            
        for endpoint in backend_endpoints[path]:
            lines.append(f"{path}\t{endpoint['method']}\t{endpoint['file']}\t{usage_status}")

    return "\n".join(lines)

def main():
    """Main function to generate and write the endpoint matrix."""
    parser = argparse.ArgumentParser(
        description="Generate an API-Frontend endpoint matrix.",
        formatter_class=argparse.RawTextHelpFormatter
    )
    parser.add_argument(
        "-v", "--version",
        required=True,
        help="Version for the report (e.g., v5R4). This is required."
    )
    args = parser.parse_args()
    
    # The output file is now derived directly from the version argument
    output_file = WORKSPACE_ROOT / f"audits/ENDPOINT_MATRIX_{args.version}.tsv"

    print("--- Phase 1: Discovering Backend Endpoints (Runtime Analysis) ---")
    backend_endpoints = discover_backend_endpoints_runtime()
    if not backend_endpoints:
        print("\n❌ Critical error during backend endpoint discovery. Aborting.")
        sys.exit(1)

    print("\n--- Phase 2: Discovering Frontend API Calls ---")
    frontend_calls = find_frontend_api_calls()

    print("\n--- Phase 3: Generating TSV Matrix ---")
    tsv_content = generate_matrix_tsv(backend_endpoints, frontend_calls)

    output_file.parent.mkdir(parents=True, exist_ok=True)
    with open(output_file, "w", encoding="utf-8") as f:
        f.write(tsv_content)

    print(f"\n✅ Endpoint matrix successfully generated at: {output_file.relative_to(WORKSPACE_ROOT)}")

if __name__ == "__main__":
    main() 