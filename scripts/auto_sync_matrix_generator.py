#!/usr/bin/env python3
"""
Automatikus Macro Endpoint Szinkronizációs Mátrix Generátor
============================================================

Ez a script automatikusan generálja és frissíti a macro endpoint szinkronizációs mátrixot
a backend routerek, frontend hookok és UI komponensek alapján.

Használat:
    python3 scripts/auto_sync_matrix_generator.py

Output:
    - docs/ENDPOINT_MATRIX.md frissítése
    - docs/MACRO_ENDPOINT_SYNC_MATRIX.md frissítése
    - Konzol output a szinkronizációs státuszról
"""

import os
import re
import json
import ast
from pathlib import Path
from typing import Dict, List, Tuple, Optional
from datetime import datetime
import subprocess
import sys

class MacroSyncMatrixGenerator:
    def __init__(self):
        self.project_root = Path(__file__).parent.parent
        self.backend_path = self.project_root / "modules" / "financehub" / "backend"
        self.frontend_path = self.project_root / "shared" / "frontend" / "src"
        self.docs_path = self.project_root / "docs"
        
        # Macro/ECB endpoint patterns
        self.macro_endpoints = [
            "/api/v1/macro/ecb/rates",
            "/api/v1/macro/ecb/yield-curve",
            "/api/v1/macro/ecb/fx",
            "/api/v1/macro/ecb/comprehensive",
            "/api/v1/macro/ecb/sts",
            "/api/v1/macro/ecb/bop",
            "/api/v1/macro/ecb/mir",
            "/api/v1/macro/ecb/bsi"
        ]
        
        # Expected hook patterns
        self.hook_patterns = {
            "rates": r"useECBPolicyRates",
            "yield-curve": r"useECBYieldCurve",
            "fx": r"useFxRates",
            "comprehensive": r"useECBComprehensiveData",
            "sts": r"useECBSts",
            "bop": r"useECBBop",
            "mir": r"useECBMir",
            "bsi": r"useECBBsi"
        }
        
        # Expected UI component patterns
        self.component_patterns = {
            "rates": r"ECBPolicyRatesCard",
            "yield-curve": r"ECBYieldCurveCard",
            "fx": r"FxRatesCard",
            "comprehensive": r"ECBComprehensiveCard",
            "sts": r"StsCard",
            "bop": r"BopCard",
            "mir": r"MirCard",
            "bsi": r"BsiCard"
        }

    def scan_backend_endpoints(self) -> Dict[str, Dict]:
        """Backend endpoint-ok szkennelése és adatmezők kinyerése"""
        endpoints_data = {}
        
        # Scan API endpoints directory
        api_path = self.backend_path / "api" / "endpoints"
        if api_path.exists():
            for file_path in api_path.rglob("*.py"):
                # Skip __init__.py files
                if file_path.name == "__init__.py":
                    continue
                content = file_path.read_text(encoding='utf-8')
                
                # Look for @router.get decorators and route patterns
                route_patterns = [
                    r'@\w+\.get\(["\'](.*?)["\']',
                    r'@router\.get\(["\'](.*?)["\']',
                ]
                
                for pattern in route_patterns:
                    matches = re.findall(pattern, content)
                    for match in matches:
                        # Check if this is a macro endpoint
                        for endpoint in self.macro_endpoints:
                            endpoint_suffix = endpoint.replace("/api/v1/macro/ecb/", "")
                            if match.endswith(endpoint_suffix) or match == f"/{endpoint_suffix}":
                                key = endpoint_suffix
                                
                                # Try to extract response model/fields
                                fields = self._extract_response_fields(content)
                                
                                endpoints_data[key] = {
                                    "endpoint": endpoint,
                                    "file": str(file_path.relative_to(self.project_root)),
                                    "fields": fields,
                                    "status": "found",
                                    "route_pattern": match
                                }
        
        return endpoints_data

    def _extract_response_fields(self, content: str) -> List[str]:
        """Response model mezők kinyerése a kódból"""
        fields = []
        
        # Look for Pydantic model definitions
        model_patterns = [
            r"class\s+\w+Response\(BaseModel\):",
            r"class\s+\w+Data\(BaseModel\):",
            r"@router\.get.*response_model=(\w+)",
        ]
        
        for pattern in model_patterns:
            matches = re.findall(pattern, content, re.MULTILINE)
            if matches:
                # Try to extract field names from the model
                field_pattern = r"(\w+):\s*(?:str|int|float|bool|Optional|List|Dict)"
                field_matches = re.findall(field_pattern, content)
                fields.extend(field_matches)
        
        return list(set(fields)) if fields else ["date", "value", "source"]

    def scan_frontend_hooks(self) -> Dict[str, Dict]:
        """Frontend hook-ok szkennelése"""
        hooks_data = {}
        
        # Scan hooks directory
        hooks_path = self.frontend_path / "hooks"
        if hooks_path.exists():
            for file_path in hooks_path.rglob("*.ts"):
                content = file_path.read_text(encoding='utf-8')
                
                # Check for macro hooks by export names
                for key, pattern in self.hook_patterns.items():
                    # Look for export const hookName or export function hookName
                    hook_export_pattern = f"export.*{pattern}"
                    if re.search(hook_export_pattern, content):
                        # Extract hook fields
                        fields = self._extract_hook_fields(content)
                        
                        hooks_data[key] = {
                            "hook": pattern,
                            "file": str(file_path.relative_to(self.project_root)),
                            "fields": fields,
                            "status": "found"
                        }
        
        return hooks_data

    def _extract_hook_fields(self, content: str) -> List[str]:
        """Hook mezők kinyerése a TypeScript kódból"""
        fields = []
        
        # Look for interface definitions
        interface_pattern = r"interface\s+\w+\s*\{([^}]+)\}"
        matches = re.findall(interface_pattern, content, re.DOTALL)
        
        for match in matches:
            # Extract field names
            field_pattern = r"(\w+):\s*(?:string|number|boolean|any|Date)"
            field_matches = re.findall(field_pattern, match)
            fields.extend(field_matches)
        
        return list(set(fields)) if fields else ["data", "loading", "error"]

    def scan_ui_components(self) -> Dict[str, Dict]:
        """UI komponensek szkennelése"""
        components_data = {}
        
        # Scan components directory
        components_path = self.frontend_path / "components" / "financehub" / "macro"
        if components_path.exists():
            for file_path in components_path.rglob("*.tsx"):
                content = file_path.read_text(encoding='utf-8')
                
                # Check for macro components by export names or component definitions
                for key, pattern in self.component_patterns.items():
                    # Look for const ComponentName or export default ComponentName
                    component_patterns = [
                        f"const {pattern}",
                        f"export default {pattern}",
                        f"function {pattern}",
                        f"export.*{pattern}",
                    ]
                    
                    found = any(re.search(cp, content) for cp in component_patterns)
                    if found:
                        # Extract component props
                        props = self._extract_component_props(content)
                        
                        components_data[key] = {
                            "component": pattern,
                            "file": str(file_path.relative_to(self.project_root)),
                            "props": props,
                            "status": "found"
                        }
        
        return components_data

    def _extract_component_props(self, content: str) -> List[str]:
        """Komponens props kinyerése"""
        props = []
        
        # Look for interface Props or component props
        props_patterns = [
            r"interface\s+\w+Props\s*\{([^}]+)\}",
            r"const\s+\w+\s*=\s*\(\s*\{([^}]+)\}\s*:\s*\w+Props\s*\)",
        ]
        
        for pattern in props_patterns:
            matches = re.findall(pattern, content, re.DOTALL)
            for match in matches:
                # Extract prop names
                prop_pattern = r"(\w+)(?:\?)?:\s*(?:string|number|boolean|any)"
                prop_matches = re.findall(prop_pattern, match)
                props.extend(prop_matches)
        
        return list(set(props)) if props else ["data", "loading"]

    def generate_sync_matrix(self) -> str:
        """Szinkronizációs mátrix generálása"""
        backend_data = self.scan_backend_endpoints()
        hooks_data = self.scan_frontend_hooks()
        components_data = self.scan_ui_components()
        
        matrix_lines = [
            "# 🗂️ FinanceHub Macro/ECB Endpoints – Szinkronizációs Mátrix (Auto-Generated)",
            "",
            f"**Generálva:** {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}",
            f"**Backend Endpoints:** {len(backend_data)}",
            f"**Frontend Hooks:** {len(hooks_data)}",
            f"**UI Components:** {len(components_data)}",
            "",
            "| Backend Endpoint | Backend Adatmezők | Frontend Hook | Frontend Adatmezők | UI Komponens | UI Props | Státusz |",
            "|------------------|-------------------|---------------|-------------------|--------------|----------|---------|"
        ]
        
        for endpoint in self.macro_endpoints:
            key = endpoint.split("/")[-1]
            
            backend_info = backend_data.get(key, {"fields": [], "status": "missing"})
            hook_info = hooks_data.get(key, {"fields": [], "status": "missing"})
            component_info = components_data.get(key, {"props": [], "status": "missing"})
            
            # Determine status
            if backend_info["status"] == "found" and hook_info["status"] == "found" and component_info["status"] == "found":
                status = "✅ Teljesen bekötve"
            elif backend_info["status"] == "found" and hook_info["status"] == "found":
                status = "⚠️ Hook kész, UI hiányzik"
            elif backend_info["status"] == "found":
                status = "❌ Backend kész, frontend hiányzik"
            else:
                status = "❌ Hiányzik"
            
            matrix_lines.append(
                f"| {endpoint} | {', '.join(backend_info['fields'])} | "
                f"{hook_info.get('hook', 'N/A')} | {', '.join(hook_info['fields'])} | "
                f"{component_info.get('component', 'N/A')} | {', '.join(component_info['props'])} | {status} |"
            )
        
        matrix_lines.extend([
            "",
            "## 📊 Összefoglaló",
            "",
            f"- **Backend Endpoints:** {len(backend_data)}",
            f"- **Frontend Hooks:** {len(hooks_data)}",
            f"- **UI Components:** {len(components_data)}",
            f"- **Teljesen bekötve:** {sum(1 for k in self.macro_endpoints if self._is_fully_integrated(k, backend_data, hooks_data, components_data))}",
            f"- **Hiányzó integráció:** {sum(1 for k in self.macro_endpoints if not self._is_fully_integrated(k, backend_data, hooks_data, components_data))}",
            "",
            "## 🔧 Fejlesztési prioritások",
            "",
            "### 🔴 KRITIKUS (Azonnali fejlesztés)"
        ])
        
        # Add critical missing items
        critical_items = []
        for endpoint in self.macro_endpoints:
            key = endpoint.split("/")[-1]
            if not self._is_fully_integrated(key, backend_data, hooks_data, components_data):
                if backend_data.get(key) and not hooks_data.get(key):
                    critical_items.append(f"**{key} Hook** - Backend kész, hook hiányzik")
                elif hooks_data.get(key) and not components_data.get(key):
                    critical_items.append(f"**{key} UI Card** - Hook kész, UI hiányzik")
        
        for item in critical_items[:3]:  # Top 3 critical
            matrix_lines.append(f"1. {item}")
        
        matrix_lines.extend([
            "",
            "### 🟡 MAGAS PRIORITÁS",
            "1. **Mobil optimalizáció** - yield-curve/lite kártya",
            "2. **KPI Dashboard** - STS, inflation, monetary aggregates grid",
            "3. **AI magyarázatok** - Policy notes tooltip minden kártyához",
            "",
            "---",
            "",
            "*Ez a mátrix automatikusan generálódik a `scripts/auto_sync_matrix_generator.py` script által.*"
        ])
        
        return "\n".join(matrix_lines)

    def _is_fully_integrated(self, key: str, backend_data: Dict, hooks_data: Dict, components_data: Dict) -> bool:
        """Ellenőrzi, hogy egy endpoint teljesen integrált-e"""
        return (backend_data.get(key) and 
                hooks_data.get(key) and 
                components_data.get(key))

    def update_documentation(self):
        """Dokumentáció frissítése"""
        matrix_content = self.generate_sync_matrix()
        
        # Update ENDPOINT_MATRIX.md
        endpoint_matrix_file = self.docs_path / "ENDPOINT_MATRIX.md"
        if endpoint_matrix_file.exists():
            content = endpoint_matrix_file.read_text(encoding='utf-8')
            
            # Replace the auto-generated section
            pattern = r"(# 🗂️ FinanceHub Macro/ECB Endpoints – Szinkronizációs Mátrix.*?)(?=#|\Z)"
            if re.search(pattern, content, re.DOTALL):
                content = re.sub(pattern, matrix_content, content, flags=re.DOTALL)
            else:
                # Prepend if no existing section
                content = matrix_content + "\n\n" + content
            
            endpoint_matrix_file.write_text(content, encoding='utf-8')
            print(f"✅ Updated: {endpoint_matrix_file}")
        
        # Update MACRO_ENDPOINT_SYNC_MATRIX.md
        sync_matrix_file = self.docs_path / "MACRO_ENDPOINT_SYNC_MATRIX.md"
        sync_matrix_file.write_text(matrix_content, encoding='utf-8')
        print(f"✅ Updated: {sync_matrix_file}")

    def run_audit(self):
        """Audit futtatása és eredmények kiírása"""
        print("🔍 Macro Endpoint Szinkronizációs Audit")
        print("=" * 50)
        
        backend_data = self.scan_backend_endpoints()
        hooks_data = self.scan_frontend_hooks()
        components_data = self.scan_ui_components()
        
        print(f"\n📊 Eredmények:")
        print(f"- Backend Endpoints: {len(backend_data)}")
        print(f"- Frontend Hooks: {len(hooks_data)}")
        print(f"- UI Components: {len(components_data)}")
        
        fully_integrated = sum(1 for k in self.macro_endpoints 
                             if self._is_fully_integrated(k, backend_data, hooks_data, components_data))
        
        print(f"- Teljesen bekötve: {fully_integrated}/{len(self.macro_endpoints)}")
        print(f"- Hiányzó integráció: {len(self.macro_endpoints) - fully_integrated}")
        
        print(f"\n🔴 KRITIKUS hiányzó elemek:")
        for endpoint in self.macro_endpoints:
            key = endpoint.split("/")[-1]
            if not self._is_fully_integrated(key, backend_data, hooks_data, components_data):
                if backend_data.get(key) and not hooks_data.get(key):
                    print(f"  ❌ {key}: Backend kész, hook hiányzik")
                elif hooks_data.get(key) and not components_data.get(key):
                    print(f"  ⚠️ {key}: Hook kész, UI hiányzik")
                else:
                    print(f"  ❌ {key}: Teljesen hiányzik")

def main():
    """Main function"""
    generator = MacroSyncMatrixGenerator()
    
    try:
        print("🚀 Macro Endpoint Szinkronizációs Mátrix Generátor")
        print("=" * 60)
        
        # Run audit
        generator.run_audit()
        
        # Update documentation
        print(f"\n📝 Dokumentáció frissítése...")
        generator.update_documentation()
        
        print(f"\n✅ Kész! A szinkronizációs mátrix frissítve.")
        print(f"📁 Fájlok:")
        print(f"  - docs/ENDPOINT_MATRIX.md")
        print(f"  - docs/MACRO_ENDPOINT_SYNC_MATRIX.md")
        
    except Exception as e:
        print(f"❌ Hiba: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main() 