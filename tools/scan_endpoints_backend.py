import ast
import json
from pathlib import Path

# --- Constants ---
WORKSPACE_ROOT = Path(__file__).resolve().parent.parent
BACKEND_ROOT = WORKSPACE_ROOT / "modules" / "financehub" / "backend"
OUTPUT_FILE = WORKSPACE_ROOT / "audits" / "backend_endpoints_ast.json"

class EndpointVisitor(ast.NodeVisitor):
    """AST visitor to find FastAPI endpoint decorators."""
    def __init__(self, filepath):
        self.endpoints = []
        self.filepath = filepath
        self.router_names = {"router"} # Default router name

    def visit_Assign(self, node):
        # Find all APIRouter assignments, e.g., `auth_router = APIRouter()`
        if isinstance(node.value, ast.Call) and isinstance(node.value.func, ast.Name):
            if node.value.func.id == 'APIRouter':
                for target in node.targets:
                    if isinstance(target, ast.Name):
                        self.router_names.add(target.id)
        self.generic_visit(node)

    def visit_FunctionDef(self, node):
        """Visit function definitions to check for decorators."""
        for decorator in node.decorator_list:
            if (isinstance(decorator, ast.Call) and
                isinstance(decorator.func, ast.Attribute) and
                isinstance(decorator.func.value, ast.Name) and
                decorator.func.value.id in self.router_names and
                decorator.func.attr in ('get', 'post', 'put', 'delete', 'patch')):
                
                method = decorator.func.attr.upper()
                path = "N/A"
                if decorator.args:
                    path_arg = decorator.args[0]
                    if isinstance(path_arg, ast.Constant):
                        path = path_arg.value
                    elif isinstance(path_arg, ast.Str): # For older Python versions
                        path = path_arg.s

                self.endpoints.append({
                    "method": method,
                    "path": path,
                    "function_name": node.name,
                    "file": str(self.filepath.relative_to(BACKEND_ROOT))
                })
        self.generic_visit(node)

def scan_backend_endpoints():
    """Scans all Python files in the backend for FastAPI endpoints using AST."""
    all_endpoints = []
    py_files = list(BACKEND_ROOT.rglob("*.py"))
    print(f"Scanning {len(py_files)} Python files in backend...")

    for filepath in py_files:
        try:
            with open(filepath, "r", encoding="utf-8") as f:
                content = f.read()
                tree = ast.parse(content, filename=str(filepath))
                visitor = EndpointVisitor(filepath)
                visitor.visit(tree)
                all_endpoints.extend(visitor.endpoints)
        except Exception as e:
            print(f"Warning: Could not parse {filepath}: {e}")
    
    return all_endpoints

def main():
    """Main function to scan endpoints and save them to a file."""
    print("Starting backend endpoint scan using AST...")
    backend_endpoints = scan_backend_endpoints()

    OUTPUT_FILE.parent.mkdir(parents=True, exist_ok=True)
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(backend_endpoints, f, indent=2)

    print(f"✅ Backend endpoint scan complete. Found {len(backend_endpoints)} endpoints.")
    print(f"Results saved to: {OUTPUT_FILE}")

if __name__ == "__main__":
    main() 