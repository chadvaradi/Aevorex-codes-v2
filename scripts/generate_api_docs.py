#!/usr/bin/env python3
"""
API Documentation Autogenerator
================================

This script generates the API_DOCUMENTATION.md file from the normalized
endpoint matrix TSV file.
"""

import argparse
import csv
from pathlib import Path

def generate_mermaid_diagram(rows):
    """Generates a Mermaid sequence diagram from the endpoint data."""
    diagram = "sequenceDiagram\n"
    diagram += "    participant User\n"
    diagram += "    participant Frontend\n"
    diagram += "    participant Backend\n\n"

    for row in rows:
        endpoint, method, _, status = row
        diagram += f"    User->>Frontend: Interacts to trigger {method} {endpoint}\n"
        diagram += f"    Frontend->>Backend: {method} {endpoint}\n"
        diagram += "    Backend-->>Frontend: Response\n"
        diagram += f"    Note right of Backend: Status: {status}\n\n"
        
    return diagram

def generate_markdown_table(rows):
    """Generates a Markdown table from the endpoint data."""
    table = "| Method | Endpoint | Status | Implemented in |\n"
    table += "|---|---|---|---|\n"
    for row in rows:
        method, endpoint, impl_path, status = row[1], row[0], row[3], row[2]
        table += f"| {method} | `{endpoint}` | {status} | `{impl_path}` |\n"
    return table

def main():
    parser = argparse.ArgumentParser(description="Generate API documentation from a normalized TSV matrix.")
    parser.add_argument("input", type=Path, help="Source TSV file (normalized matrix)")
    parser.add_argument("-o", "--output", type=Path, required=True, help="Output Markdown file")
    args = parser.parse_args()

    rows = []
    with args.input.open(newline="", encoding="utf-8") as f:
        reader = csv.reader(f, delimiter="\t")
        header = next(reader)
        for row in reader:
            rows.append(row)

    mermaid_diagram = generate_mermaid_diagram(rows)
    markdown_table = generate_markdown_table(rows)

    with args.output.open("w", encoding="utf-8") as f:
        f.write("# Aevorex API Documentation\n\n")
        f.write("## Endpoints Overview (Mermaid Diagram)\n\n")
        f.write("```mermaid\n")
        f.write(mermaid_diagram)
        f.write("```\n\n")
        f.write("## Endpoints Details (Table)\n\n")
        f.write(markdown_table)

    print(f"✅ API documentation generated at {args.output}")

if __name__ == "__main__":
    main() 