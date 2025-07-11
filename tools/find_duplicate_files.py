import os
from collections import defaultdict

def find_duplicate_provider_files(directory):
    """
    Finds provider files that exist both as a single file and within a subdirectory.
    Example: `fmp.py` and `fmp/some_file.py`.

    Args:
        directory (str): The path to the directory to scan (e.g., 'core/fetchers').
    """
    print(f"🔍 Scanning for duplicate provider structures in: {directory}")
    print("-" * 50)

    files_map = defaultdict(list)
    for item in os.listdir(directory):
        full_path = os.path.join(directory, item)
        if os.path.isdir(full_path):
            # It's a directory, like 'fmp/'
            provider_name = item
            files_map[provider_name].append('dir')
        elif item.endswith('.py') and item != '__init__.py':
            # It's a file, like 'fmp.py'
            provider_name = os.path.splitext(item)[0]
            files_map[provider_name].append('file')

    duplicates_found = False
    for provider, types in files_map.items():
        if 'dir' in types and 'file' in types:
            print(f"  ⚠️ Duplicate Found: '{provider}' exists as both a file and a directory.")
            print(f"     - File: {os.path.join(directory, provider + '.py')}")
            print(f"     - Directory: {os.path.join(directory, provider, '')}")
            print("-" * 20)
            duplicates_found = True

    if not duplicates_found:
        print("✅ No duplicate provider structures found.")
    
    print("-" * 50)
    return duplicates_found

if __name__ == "__main__":
    fetchers_dir = "modules/financehub/backend/core/fetchers"
    mappers_dir = "modules/financehub/backend/core/mappers"
    
    print("--- Running Fetcher Duplication Check ---")
    if os.path.isdir(fetchers_dir):
        find_duplicate_provider_files(fetchers_dir)
    else:
        print(f"❌ Directory not found: {fetchers_dir}")

    print("\n--- Running Mapper Duplication Check ---")
    if os.path.isdir(mappers_dir):
        find_duplicate_provider_files(mappers_dir)
    else:
        print(f"❌ Directory not found: {mappers_dir}") 