import ast
import json
from pathlib import Path
from collections import defaultdict

# --- Configuration ---
BACKEND_API_ROOT = Path("modules/financehub/backend/api")
OUTPUT_MD = Path("docs/ENDPOINT_MATRIX_auto.md")
OUTPUT_JSON = Path("docs/ENDPOINT_MATRIX_auto.json")

# --- Data Structures ---
# { file_path: { "routers": { "router_name": "prefix" }, "includes": [ (parent, child, prefix) ], "imports": { "alias": "source_module"} } }
file_data = defaultdict(lambda: {"routers": {}, "includes": [], "imports": {}})

# { router_id: full_prefix } where router_id is a unique tuple (file_path, router_name)
router_prefixes = {}

# --- Phase 1: AST Visitor for Info Gathering ---

class InfoVisitor(ast.NodeVisitor):
    def __init__(self, file_path):
        self.file_path = file_path
        self.routers = {}
        self.includes = []
        self.imports = {}

    def visit_ImportFrom(self, node: ast.ImportFrom):
        if node.module:
            for alias in node.names:
                # This is a simplification; doesn't resolve relative paths well.
                # It assumes we can map module path to file path later.
                self.imports[alias.asname or alias.name] = node.module
        self.generic_visit(node)

    def visit_Assign(self, node: ast.Assign):
        if isinstance(node.value, ast.Call) and isinstance(node.value.func, ast.Name) and node.value.func.id == 'APIRouter':
            if len(node.targets) == 1 and isinstance(node.targets[0], ast.Name):
                router_name = node.targets[0].id
                prefix = ""
                for kw in node.value.keywords:
                    if kw.arg == 'prefix' and isinstance(kw.value, ast.Constant):
                        prefix = kw.value.value
                self.routers[router_name] = prefix
        self.generic_visit(node)

    def visit_Call(self, node: ast.Call):
        if isinstance(node.func, ast.Attribute) and node.func.attr == 'include_router' and isinstance(node.func.value, ast.Name):
            parent = node.func.value.id
            if node.args and isinstance(node.args[0], ast.Name):
                child = node.args[0].id
                prefix = ""
                for kw in node.keywords:
                    if kw.arg == 'prefix' and isinstance(kw.value, ast.Constant):
                        prefix = kw.value.value
                self.includes.append((parent, child, prefix))
        self.generic_visit(node)

# --- Phase 3: AST Visitor for Endpoint Extraction ---

class EndpointVisitor(ast.NodeVisitor):
    def __init__(self, file_path, prefixes):
        self.file_path = file_path
        self.prefixes = prefixes
        self.endpoints = []

    def visit_FunctionDef(self, node: ast.FunctionDef):
        for decorator in node.decorator_list:
            if isinstance(decorator, ast.Call) and isinstance(decorator.func, ast.Attribute) and isinstance(decorator.func.value, ast.Name):
                router_name = decorator.func.value.id
                router_id = (str(self.file_path), router_name)
                if router_id in self.prefixes:
                    base_prefix = self.prefixes[router_id]
                    method = decorator.func.attr.upper()
                    path = decorator.args[0].value if decorator.args and isinstance(decorator.args[0], ast.Constant) else ""
                    
                    summary, tags = "N/A", []
                    for kw in decorator.keywords:
                        if kw.arg == 'summary' and isinstance(kw.value, ast.Constant): summary = kw.value.value
                        if kw.arg == 'tags' and isinstance(kw.value, ast.List): tags = [el.value for el in kw.value.elts]

                    self.endpoints.append({
                        "method": method,
                        "path": f"{base_prefix}{path}".replace("//", "/"),
                        "summary": summary, "tags": ", ".join(tags), "file": str(self.file_path)
                    })
        self.generic_visit(node)


def main():
    print("🚀 Phase 1: Gathering information from all python files...")
    py_files = list(BACKEND_API_ROOT.rglob("*.py"))
    for file in py_files:
        try:
            tree = ast.parse(file.read_text(encoding="utf-8"))
            visitor = InfoVisitor(file)
            visitor.visit(tree)
            file_data[str(file)]["routers"] = visitor.routers
            file_data[str(file)]["includes"] = visitor.includes
            file_data[str(file)]["imports"] = visitor.imports
        except Exception as e:
            print(f"  - Error parsing {file}: {e}")

    print("🧩 Phase 2: Resolving router prefixes...")
    
    router_source_map = {}
    for file_str, data in list(file_data.items()):
        for imp_name, module_path in data["imports"].items():
            if not module_path: continue

            # Convert module path to file path
            # e.g., modules.a.b -> modules/a/b.py
            source_file = Path(module_path.replace(".", "/") + ".py")

            if source_file.exists():
                source_file_str = str(source_file)
                # Find which router variable was imported (it's not always 'router')
                if imp_name in file_data[source_file_str]["routers"]:
                     router_source_map[imp_name] = (source_file_str, imp_name)


    # Iteratively build prefixes. May need multiple passes.
    for _ in range(5): # Limit iterations to prevent infinite loops
        for file_str, data in list(file_data.items()): # FIX: Iterate over a copy
            for r_name, r_prefix in data["routers"].items():
                router_id = (file_str, r_name)
                if router_id not in router_prefixes:
                    router_prefixes[router_id] = r_prefix

            for parent_name, child_name, inc_prefix in data["includes"]:
                parent_id = (file_str, parent_name)
                
                # Find the child router's original file and name
                child_source_file, child_original_name = router_source_map.get(child_name, (None, None))
                if not child_source_file:
                    # Maybe it's defined in the same file
                    if child_name in data["routers"]:
                        child_source_file, child_original_name = file_str, child_name
                    else:
                        continue # Cannot resolve this include

                child_id = (child_source_file, child_original_name)

                if parent_id in router_prefixes and child_id in router_prefixes:
                    # Concatenate prefixes
                    new_prefix = f"{router_prefixes[parent_id]}{inc_prefix}{router_prefixes[child_id]}".replace("//", "/")
                    # Update child's prefix, this is how we propagate down the tree
                    router_prefixes[child_id] = new_prefix


    print("🔍 Phase 3: Extracting all endpoints...")
    all_endpoints = []
    for file in py_files:
        visitor = EndpointVisitor(Path(file), router_prefixes)
        tree = ast.parse(Path(file).read_text(encoding="utf-8"))
        visitor.visit(tree)
        all_endpoints.extend(visitor.endpoints)

    if not all_endpoints:
        print("⚠️ No endpoints found. The script's logic for resolving router prefixes might be incomplete.")
        return

    print(f"✅ Found {len(all_endpoints)} endpoints.")
    
    # --- Writing Output ---
    OUTPUT_MD.parent.mkdir(parents=True, exist_ok=True)
    with open(OUTPUT_MD, "w", encoding="utf-8") as f:
        f.write("# Auto-Generated Backend Endpoint Matrix\n\n")
        f.write("> **Warning:** This file is auto-generated. Do not edit manually.\n\n")
        f.write("| Method | Path | Summary | Tags | Source File |\n")
        f.write("|--------|------|---------|------|-------------|\n")
        for ep in sorted(all_endpoints, key=lambda x: x['path']):
            f.write(f"| `{ep['method']}` | `{ep['path']}` | {ep['summary']} | {ep['tags']} | `{ep['file']}` |\n")

    OUTPUT_JSON.parent.mkdir(parents=True, exist_ok=True)
    with open(OUTPUT_JSON, "w", encoding="utf-8") as f:
        json.dump(sorted(all_endpoints, key=lambda x: x['path']), f, indent=2)
    
    print(f"✨ Success! Reports written to {OUTPUT_MD} and {OUTPUT_JSON}")


if __name__ == "__main__":
    main() 