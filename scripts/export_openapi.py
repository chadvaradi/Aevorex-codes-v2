#!/usr/bin/env python3
"""Export FastAPI OpenAPI spec to docs/openapi.json
Usage:  python scripts/export_openapi.py
"""
from pathlib import Path
import json
from importlib import import_module

# Assume modules.financehub.backend.app_factory provides create_app()
app_factory = import_module('modules.financehub.backend.app_factory')
app = app_factory.create_app(test_mode=True) if hasattr(app_factory, 'create_app') else getattr(app_factory, 'app')

spec = app.openapi()
out_path = Path('docs/openapi.json')
out_path.write_text(json.dumps(spec, indent=2))
print(f"✅ OpenAPI spec exported to {out_path.relative_to(Path().resolve())}") 