import os
import re

def find_absolute_imports(directory, patterns):
    """
    Scans a directory for files containing specific absolute import patterns.

    Args:
        directory (str): The path to the directory to scan.
        patterns (list): A list of regex patterns to search for.
    """
    print(f"🔍 Starting scan in directory: {directory}")
    print(f"🎯 Searching for patterns: {patterns}")
    print("-" * 50)

    matches_found = False
    compiled_patterns = [re.compile(p) for p in patterns]

    for root, _, files in os.walk(directory):
        if "__pycache__" in root or "node_modules" in root or ".git" in root:
            continue

        for file in files:
            if file.endswith(".py"):
                file_path = os.path.join(root, file)
                try:
                    with open(file_path, 'r', encoding='utf-8') as f:
                        lines = f.readlines()
                    
                    for i, line in enumerate(lines):
                        for pattern in compiled_patterns:
                            if pattern.search(line):
                                print(f"  📄 File: {os.path.relpath(file_path, directory)}")
                                print(f"     Line {i + 1}: {line.strip()}")
                                print("-" * 20)
                                matches_found = True
                except Exception as e:
                    print(f"  ❌ Error reading file {file_path}: {e}")

    if not matches_found:
        print("✅ No absolute imports matching the patterns were found.")
    else:
        print("⚠️ Found absolute imports that may need to be converted to relative imports.")

    print("-" * 50)


if __name__ == "__main__":
    search_directory = "modules"
    import_patterns = [
        r"from\s+modules\.financehub\.",
        r"import\s+modules\.financehub\.",
        r"from\s+Aevorex_codes\.",
        r"import\s+Aevorex_codes\."
    ]
    
    if not os.path.isdir(search_directory):
        print(f"Error: Directory '{search_directory}' not found.")
    else:
        find_absolute_imports(search_directory, import_patterns) 