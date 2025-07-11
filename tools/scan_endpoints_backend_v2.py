import ast
import json
import os
from pathlib import Path

# --- Constants ---
WORKSPACE_ROOT = Path(__file__).resolve().parent.parent
BACKEND_ROOT = WORKSPACE_ROOT / "modules" / "financehub" / "backend"
OUTPUT_FILE = WORKSPACE_ROOT / "audits" / "backend_routes_full.json"
ENTRYPOINTS = [
    BACKEND_ROOT / "main.py",
    BACKEND_ROOT / "app_factory.py"
]

class PythonFileVisitor(ast.NodeVisitor):
    """
    Visits a Python file's AST to extract info about routers, endpoints, and imports.
    """
    def __init__(self, filepath: Path):
        self.filepath = filepath
        self.routers = {}  # var_name -> {prefix: str}
        self.endpoints = [] # {router_var: str, method: str, path: str, name: str}
        self.imports = {} # alias -> module_path
        self.includes = [] # {router_var: str, prefix: str}

    def visit_Assign(self, node: ast.Assign):
        # Find `router = APIRouter(prefix="/api")`
        if isinstance(node.value, ast.Call) and \
           isinstance(node.value.func, ast.Name) and \
           node.value.func.id == 'APIRouter':
            
            var_name = node.targets[0].id if isinstance(node.targets[0], ast.Name) else None
            if var_name:
                prefix = ""
                for kw in node.value.keywords:
                    if kw.arg == 'prefix' and isinstance(kw.value, ast.Constant):
                        prefix = kw.value.value
                self.routers[var_name] = {'prefix': prefix}
        self.generic_visit(node)

    def visit_FunctionDef(self, node: ast.FunctionDef):
        # Find `@router.get("/path")`
        for decorator in node.decorator_list:
            if isinstance(decorator, ast.Call) and \
               isinstance(decorator.func, ast.Attribute) and \
               isinstance(decorator.func.value, ast.Name):
                
                router_var = decorator.func.value.id
                method = decorator.func.attr.upper()
                
                if method in ('GET', 'POST', 'PUT', 'DELETE', 'PATCH'):
                    path = ""
                    if decorator.args:
                        path_arg = decorator.args[0]
                        if isinstance(path_arg, ast.Constant):
                            path = path_arg.value
                    
                    self.endpoints.append({
                        'router_var': router_var,
                        'method': method,
                        'path': path,
                        'name': node.name
                    })
        self.generic_visit(node)

    def visit_ImportFrom(self, node: ast.ImportFrom):
        # Find `from .sub import router`
        module_path = "." * node.level
        if node.module:
            module_path += node.module
        
        for alias in node.names:
            self.imports[alias.asname or alias.name] = module_path
        self.generic_visit(node)

    def visit_Call(self, node: ast.Call):
        # Find `app.include_router(router, prefix="/api")`
        if isinstance(node.func, ast.Attribute) and node.func.attr == 'include_router':
            if node.args and isinstance(node.args[0], ast.Name):
                router_var = node.args[0].id
                prefix = ""
                for kw in node.keywords:
                    if kw.arg == 'prefix' and isinstance(kw.value, ast.Constant):
                        prefix = kw.value.value
                self.includes.append({'router_var': router_var, 'prefix': prefix})
        self.generic_visit(node)

def analyze_file(filepath: Path) -> dict:
    """Parses a single python file and returns its analysis."""
    try:
        with open(filepath, "r", encoding="utf-8") as f:
            content = f.read()
            tree = ast.parse(content, filename=str(filepath))
            visitor = PythonFileVisitor(filepath)
            visitor.visit(tree)
            return {
                "filepath": str(filepath.relative_to(WORKSPACE_ROOT)),
                "routers": visitor.routers,
                "endpoints": visitor.endpoints,
                "imports": visitor.imports,
                "includes": visitor.includes,
            }
    except Exception:
        return None

def main():
    print("Starting backend endpoint scan v2 (AST)...")
    all_files_analysis = {}
    py_files = list(BACKEND_ROOT.rglob("*.py"))
    
    print(f"Analyzing {len(py_files)} Python files...")
    for filepath in py_files:
        analysis = analyze_file(filepath)
        if analysis:
            all_files_analysis[str(filepath)] = analysis

    final_endpoints = []
    
    def find_routes_recursive(file_path_str: str, prefix: str):
        if file_path_str not in all_files_analysis:
            return

        analysis = all_files_analysis[file_path_str]
        
        # Add endpoints defined in this file
        for router_var, router_info in analysis['routers'].items():
            for endpoint in analysis['endpoints']:
                if endpoint['router_var'] == router_var:
                    # Construct path and normalize
                    full_path = os.path.normpath(f"{prefix}{router_info['prefix']}{endpoint['path']}")
                    final_endpoints.append({
                        "method": endpoint['method'],
                        "path": full_path,
                        "function_name": endpoint['name'],
                        "file": analysis['filepath']
                    })

        # Follow includes
        for include in analysis['includes']:
            router_var = include['router_var']
            new_prefix = os.path.normpath(f"{prefix}/{include['prefix']}")
            
            if router_var in analysis['imports']:
                import_str = analysis['imports'][router_var]
                current_file_path = WORKSPACE_ROOT / analysis['filepath']
                base_dir = current_file_path.parent
                
                # Simplified import resolution
                path_parts = import_str.lstrip('.').split('.')
                
                if import_str.startswith('.'):
                    levels = len(import_str) - len(import_str.lstrip('.'))
                    for _ in range(levels - 1):
                        base_dir = base_dir.parent
                
                imported_module_path = base_dir
                for part in path_parts:
                    if part:
                         imported_module_path = imported_module_path / part

                next_file_path = None
                if (imported_module_path.with_suffix('.py')).exists():
                    next_file_path = str(imported_module_path.with_suffix('.py'))
                elif (imported_module_path / "__init__.py").exists():
                    next_file_path = str(imported_module_path / "__init__.py")

                if next_file_path:
                    find_routes_recursive(next_file_path, new_prefix)

    print("Resolving routes from entrypoints...")
    for entrypoint in ENTRYPOINTS:
        if str(entrypoint) in all_files_analysis:
            find_routes_recursive(str(entrypoint), "")

    print(f"✅ Scan complete. Found {len(final_endpoints)} endpoints.")
    OUTPUT_FILE.parent.mkdir(parents=True, exist_ok=True)
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(final_endpoints, f, indent=2, sort_keys=True)
    print(f"Results saved to: {OUTPUT_FILE}")
    
    if len(final_endpoints) < 40:
        print("Warning: Found fewer than 40 endpoints. The scanner might be incomplete.")
        
if __name__ == "__main__":
    main() 