import ast
from pathlib import Path
from typing import List, Dict
import json

def get_public_functions(filepath: Path) -> List[str]:
    """Parses a Python file and returns a list of public function names."""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    tree = ast.parse(content)
    functions = []
    for node in ast.walk(tree):
        if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef)) and not node.name.startswith('_'):
            functions.append(node.name)
    return functions

def generate_module_map(package_dir: Path) -> Dict[str, List[str]]:
    """Generates the MODULE_MAP for a given package directory."""
    module_map = {}
    for provider_dir in sorted(package_dir.iterdir()):
        if provider_dir.is_dir() and (provider_dir / '__init__.py').exists():
            provider_name = provider_dir.name
            module_path = f".{provider_name}"
            functions = []
            for py_file in sorted(provider_dir.glob('*.py')):
                if py_file.name in ['__init__.py'] or py_file.name.startswith('_'):
                    continue
                functions.extend(get_public_functions(py_file))
            if functions:
                module_map[module_path] = sorted(list(set(functions)))
    return module_map

def main():
    """Main function to generate and print module maps."""
    base_dir = Path("modules/financehub/backend/core")
    packages_to_scan = ["mappers", "fetchers"]

    for package_name in packages_to_scan:
        package_dir = base_dir / package_name
        
        print(f"--- MODULE_MAP for '{package_name}' ---")
        
        if not package_dir.is_dir():
            print(f"❌ Directory not found: {package_dir}\n")
            continue

        module_map = generate_module_map(package_dir)
        
        # Special handling for mappers' _shared module
        if package_name == "mappers":
            shared_file = package_dir / "_shared_mappers.py"
            if shared_file.exists():
                shared_functions = get_public_functions(shared_file)
                if shared_functions:
                    module_map["._shared"] = sorted(shared_functions)

        # Pretty print the dictionary
        formatted_map = json.dumps(module_map, indent=4)
        print(formatted_map)
        print("-" * 40 + "\n")

if __name__ == "__main__":
    main() 