import argparse
import ast
import os
import sys
from pathlib import Path
from typing import List, NamedTuple

# Add project root to sys.path to allow module imports
project_root = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(project_root))

# --- Constants ---
APP_FACTORY_PATH = project_root / "modules/financehub/backend/app_factory.py"
ENDPOINTS_DIR = project_root / "modules/financehub/backend/api/endpoints"
API_ROUTERS_DIR = project_root / "modules/financehub/backend/api/routers"
MARKET_DATA_PATH = project_root / "modules/financehub/backend/api/market_data.py"

class RouterInfo(NamedTuple):
    """Holds information about a discovered router."""
    path: Path
    variable_name: str
    import_path: str
    alias: str

def find_routers_in_path(search_path: Path) -> List[RouterInfo]:
    """
    Scans a directory for Python files containing APIRouter instances and returns their info.
    Handles __init__.py files which may re-export or define their own routers.
    """
    routers = []
    for root, _, files in os.walk(search_path):
        for file in files:
            if not file.endswith(".py"):
                continue

            file_path = Path(root) / file
            try:
                with open(file_path, "r", encoding="utf-8") as f:
                    tree = ast.parse(f.read(), filename=str(file_path))
            except (SyntaxError, UnicodeDecodeError) as e:
                print(f"  [Warning] Skipping file due to parsing error: {file_path} - {e}", file=sys.stderr)
                continue


            for node in ast.walk(tree):
                if isinstance(node, ast.Assign):
                    if (isinstance(node.value, ast.Call) and
                            isinstance(node.value.func, ast.Name) and
                            node.value.func.id == 'APIRouter'):
                        
                        for target in node.targets:
                            if isinstance(target, ast.Name):
                                var_name = target.id
                                relative_path = file_path.relative_to(project_root)
                                import_path = str(relative_path.with_suffix("")).replace(os.path.sep, ".")
                                
                                # Create a unique alias
                                alias_parts = list(relative_path.parts)[3:-1] # e.g., ['stock_endpoints', 'chat']
                                if relative_path.stem != "__init__":
                                    alias_parts.append(relative_path.stem)

                                alias = "_".join(alias_parts)
                                if not alias: # Top-level files like auth.py
                                    alias = relative_path.stem
                                alias += "_router"
                                alias = alias.replace("_py", "") # cleanup

                                routers.append(RouterInfo(file_path, var_name, import_path, alias))

    return routers

def get_registered_routers(file_path: Path) -> List[str]:
    """
    Parses app_factory.py to find which router aliases are already included.
    """
    registered = []
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            tree = ast.parse(f.read(), filename=str(file_path))
    except (SyntaxError, FileNotFoundError) as e:
        print(f"  [Error] Could not parse app_factory: {e}", file=sys.stderr)
        return registered

    # Find registered routers via `app.include_router(ROUTER_VARIABLE, ...)`
    for node in ast.walk(tree):
        if (isinstance(node, ast.Call) and
                isinstance(node.func, ast.Attribute) and
                node.func.attr == 'include_router' and
                node.args):
            
            router_arg = node.args[0]
            # It could be the router directly (e.g., `stock_router`) or an attribute (`auth_router.router`)
            if isinstance(router_arg, ast.Name):
                registered.append(router_arg.id)
            elif isinstance(router_arg, ast.Attribute) and isinstance(router_arg.value, ast.Name):
                registered.append(router_arg.value.id)

    # Find imported routers via `from ... import ... as ALIAS`
    for node in ast.walk(tree):
        if isinstance(node, ast.ImportFrom):
            for name in node.names:
                if name.asname:
                    registered.append(name.asname)
                # It's possible the variable itself is the alias
                elif name.name.endswith("_router"):
                     registered.append(name.name)


    return list(set(registered))

def generate_import_and_include_statements(all_routers: List[RouterInfo]) -> str:
    """
    Generates the import and include_router statements for all routers.
    """
    import_block = ""
    include_block = ""

    # De-duplicate routers based on the final alias to prevent double registration
    unique_routers = {r.alias: r for r in all_routers}.values()

    # Imports
    import_block += "    # Auto-generated imports:\n"
    sorted_routers = sorted(list(unique_routers), key=lambda r: r.import_path)

    for router in sorted_routers:
        if router.variable_name == "router":
            import_statement = f"    from {router.import_path} import router as {router.alias}\n"
        else:
            import_statement = f"    from {router.import_path} import {router.variable_name} as {router.alias}\n"
        import_block += import_statement
    import_block += "\n"
    
    # Include statements
    include_block += "    # Auto-generated include_router calls:\n"
    for router in sorted_routers:
        # Determine prefix from the top-level directory inside 'endpoints'
        try:
            # e.g., .../api/endpoints/stock_endpoints/search -> stock_endpoints
            top_level_dir = router.path.relative_to(ENDPOINTS_DIR).parts[0]
            # stock_endpoints -> stock
            prefix = "/" + top_level_dir.replace("_endpoints", "")
        except (ValueError, IndexError):
            # Fallback for routers not directly under 'endpoints' (e.g. /api/routers)
            # In this case, we assume no extra prefix is needed as it's handled by a higher-level router
            prefix = ""
        
        # Generate include_router statement
        # The main prefix /api/v1 is already handled in app_factory, so we only add the sub-prefix
        tag = router.path.stem.replace('_', ' ').title()
        include_statement = f'    app.include_router({router.alias}, prefix=f"{{settings.API_PREFIX}}{prefix}", tags=[\"{tag}\"])'
        include_block += include_statement + "\n"

    # Return the complete block of code
    return f"{import_block}\n\n{include_block}"

def fix_app_factory(file_path: Path, all_routers: List[RouterInfo]):
    """
    Atomically rewrites the router registration section in app_factory.py.
    It finds markers, deletes the content between them, and inserts the full, correct list.
    """
    generated_code = generate_import_and_include_statements(all_routers)

    with open(file_path, "r", encoding="utf-8") as f:
        lines = f.readlines()

    # Find marker lines
    start_marker = -1
    end_marker = -1
    for i, line in enumerate(lines):
        if "--- ROUTER_REGISTRATION_START ---" in line:
            start_marker = i
        if "--- ROUTER_REGISTRATION_END ---" in line:
            end_marker = i

    if start_marker == -1 or end_marker == -1 or end_marker <= start_marker:
        print("  [Error] Could not find START/END markers in app_factory.py. Aborting fix.", file=sys.stderr)
        print("          Ensure these lines exist and are in the correct order:")
        print("          # --- ROUTER_REGISTRATION_START ---")
        print("          # --- ROUTER_REGISTRATION_END ---")
        return

    # Prepare lines to insert
    new_lines = lines[:start_marker + 1] + [generated_code + "\n"] + lines[end_marker:]

    with open(file_path, "w", encoding="utf-8") as f:
        f.writelines(new_lines)
    
    print(f"✅ Successfully rewrote router registrations for {len(all_routers)} routers in {file_path.name}")


def main():
    """Main execution function."""
    parser = argparse.ArgumentParser(
        description="Verify all FastAPI routers are registered in app_factory.py and optionally fix it.",
        epilog="Exit codes: 0 = OK, 1 = Missing routers found, 2 = Error."
    )
    parser.add_argument(
        "--fix",
        action="store_true",
        help="Automatically add missing imports and app.include_router calls to app_factory.py."
    )
    parser.add_argument(
        "--force-fix",
        action="store_true",
        help="Force a complete rewrite of the router registration section in app_factory.py."
    )
    args = parser.parse_args()

    print("🚀 PHOENIX SYNC v5-R4: A1 - Router Inclusion Audit")
    print("-" * 50)
    
    # 1. Discover all routers
    print("1. Discovering all APIRouter instances...")
    all_routers = find_routers_in_path(ENDPOINTS_DIR)
    # Manually add routers outside the main endpoints dir if necessary
    all_routers.extend(find_routers_in_path(API_ROUTERS_DIR))
    all_routers.extend(find_routers_in_path(MARKET_DATA_PATH.parent))


    print(f"   Found {len(all_routers)} potential routers.")

    # 2. Check registration status
    print(f"2. Checking registration status in {APP_FACTORY_PATH.name}...")
    registered_aliases = get_registered_routers(APP_FACTORY_PATH)
    
    # Filter out already registered routers
    missing_routers = [r for r in all_routers if r.alias not in registered_aliases]
    
    # 3. Report and Exit/Fix
    print("-" * 50)
    if not missing_routers and not args.force_fix:
        print("✅ SUCCESS: All discovered routers appear to be registered.")
        sys.exit(0)
    
    all_router_aliases = [r.alias for r in all_routers]
    unrecognized_in_file = [alias for alias in registered_aliases if alias not in all_router_aliases]

    if unrecognized_in_file:
        print("⚠️ WARNING: Found stale router registrations in the file that do not exist anymore:")
        for alias in unrecognized_in_file:
            print(f"  - {alias}")

    if missing_routers:
        print(f"🔥 BLOCKER: Found {len(missing_routers)} unregistered routers:")
        for router in missing_routers:
            print(f"   - Import needed for: {router.import_path} ({router.variable_name}) -> alias '{router.alias}'")

    print("-" * 50)

    if args.fix or args.force_fix:
        print("🛠️ Applying atomic fix (--fix or --force-fix specified)...")
        # With the new logic, we pass all routers to the fix function to ensure a clean rewrite
        fix_app_factory(APP_FACTORY_PATH, all_routers)
        print("\nRe-run the script without --fix to verify the changes.")
        sys.exit(0)
    else:
        print("   Run with the --fix flag to attempt automatic registration.")
        sys.exit(1)


if __name__ == "__main__":
    main() 