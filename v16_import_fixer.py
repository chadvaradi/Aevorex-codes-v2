import os
from pathlib import Path
import re

def fix_imports_in_file(file_path: Path, backend_root: Path):
    """
    Reads a Python file, replaces absolute backend imports with relative ones,
    and writes the changes back.
    """
    try:
        content = file_path.read_text(encoding='utf-8')
        original_content = content
        
        # Regex to find 'from modules.financehub.backend...'
        # It captures the part of the import path *after* 'backend'
        pattern = r"from\s+(modules\.financehub\.backend((?:\.[a-zA-Z0-9_]+)*))\s+import"
        
        def replacement_function(match):
            full_import_path = match.group(1)
            sub_path = match.group(2) # e.g., .utils.logger_config
            
            # Calculate the relative path from the file's directory to the backend root
            file_dir = file_path.parent
            try:
                relative_path_to_backend = os.path.relpath(backend_root, start=file_dir)
            except ValueError:
                # This can happen on Windows if paths are on different drives.
                # For this project, we can assume it won't happen.
                return match.group(0) # Return original string on error

            # Convert the relative file path to dots
            # e.g., '../../..' -> '...'
            dots = ""
            if relative_path_to_backend != '.':
                dots = '.' * (relative_path_to_backend.count('..') + 1)

            # Assemble the new relative import path
            new_import_path = f"from {dots}{sub_path.strip()} import"
            print(f"  - Replacing '{match.group(0)}' -> '{new_import_path}'")
            return new_import_path

        content = re.sub(pattern, replacement_function, content)

        if content != original_content:
            file_path.write_text(content, encoding='utf-8')
            print(f"Patched file: {file_path}")
            return True

    except Exception as e:
        print(f"Error processing file {file_path}: {e}")
    
    return False

def main():
    """
    Main function to traverse the backend directory and fix imports.
    """
    project_root = Path(__file__).resolve().parent
    backend_root = project_root / "modules" / "financehub" / "backend"
    
    if not backend_root.is_dir():
        print(f"Error: Backend root directory not found at {backend_root}")
        return

    print(f"Starting import scan in: {backend_root}")
    patched_file_count = 0
    
    for py_file in backend_root.rglob("*.py"):
        if py_file.name == os.path.basename(__file__):
            continue # Don't process the script itself
            
        if fix_imports_in_file(py_file, backend_root):
            patched_file_count += 1
            
    print(f"\nScan complete. Patched {patched_file_count} files.")

if __name__ == "__main__":
    main() 