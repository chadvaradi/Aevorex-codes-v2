import os
import re
from pathlib import Path

# The root directory of the backend module to be processed.
BACKEND_ROOT_DIR = Path("modules/financehub/backend")

def convert_relative_to_absolute(match, file_path):
    """
    Converts a single relative import match to an absolute import.
    This function is designed to be used as a replacement function for re.sub().
    """
    from_keyword, dots, rest_of_module, import_statement = match.groups()
    
    num_dots = len(dots)
    file_dir = file_path.parent
    
    try:
        # Resolve the path by going up from the current file's directory
        base_path = file_dir.resolve()
        for _ in range(num_dots - 1):
            base_path = base_path.parent
    except IndexError:
        print(f"  [ERROR] Invalid relative import in {file_path}: '{match.group(0).strip()}' goes beyond project root.")
        return match.group(0)

    # Convert the file system path to a Python module path
    # We assume the script is run from the project root.
    try:
        # Get path relative to the current working directory
        module_path_parts = list(base_path.relative_to(Path.cwd()).parts)
    except ValueError:
         print(f"  [ERROR] Could not determine relative path for {base_path} from {Path.cwd()}.")
         return match.group(0)

    base_module_path = '.'.join(module_path_parts)

    if rest_of_module:
        full_module_path = f"{base_module_path}.{rest_of_module}"
    else:
        # Handles 'from . import ...'
        full_module_path = base_module_path
        
    # Clean up potential artifacts like double dots
    full_module_path = full_module_path.replace("..", ".")
    
    new_import_line = f"{from_keyword}{full_module_path} {import_statement}"
    
    # Uncomment for verbose logging
    # print(f"  {match.group(0).strip()} -> {new_import_line.strip()}")
    
    return new_import_line

def process_file(file_path):
    """
    Reads a Python file, replaces all relative imports with absolute ones,
    and writes the changes back to the file.
    """
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            original_content = f.read()
    except Exception as e:
        print(f"Could not read file {file_path}: {e}")
        return

    # Regex to find relative imports: from .mod, from ..mod, from . import mod, etc.
    relative_import_regex = re.compile(
        r"^(from\s+)(\.+)(\S*)\s+(import\s+.*)$", 
        re.MULTILINE
    )

    replacement_function = lambda match: convert_relative_to_absolute(match, file_path)
    
    new_content = relative_import_regex.sub(replacement_function, original_content)

    if new_content != original_content:
        print(f"Updating imports in: {file_path}")
        try:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(new_content)
        except Exception as e:
            print(f"Could not write to file {file_path}: {e}")

def main():
    """
    Main function to walk through the backend directory and process all Python files.
    """
    print(f"Starting import fixing process for directory: {BACKEND_ROOT_DIR}")
    
    if not BACKEND_ROOT_DIR.is_dir():
        print(f"[ERROR] Directory not found: {BACKEND_ROOT_DIR.resolve()}")
        return

    for root, _, files in os.walk(BACKEND_ROOT_DIR):
        for file in files:
            if file.endswith(".py"):
                file_path = Path(root) / file
                process_file(file_path)

    print("Import fixing process completed.")

if __name__ == "__main__":
    main() 