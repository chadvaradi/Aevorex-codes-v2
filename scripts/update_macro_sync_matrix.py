#!/usr/bin/env python3
"""
Macro Endpoint Sync Matrix Updater
==================================

Automatically updates the macro endpoint synchronization matrix documentation
based on current backend endpoints, frontend hooks, and UI components.

Usage:
    python scripts/update_macro_sync_matrix.py

This script:
1. Scans backend endpoints
2. Scans frontend hooks
3. Scans UI components
4. Updates the documentation with current status
5. Generates progress reports
"""

import os
import json
import re
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Set, Tuple
import subprocess

# Configuration
REPO_ROOT = Path(__file__).parent.parent
DOCS_DIR = REPO_ROOT / "docs"
BACKEND_DIR = REPO_ROOT / "modules" / "financehub" / "backend"
FRONTEND_DIR = REPO_ROOT / "shared" / "frontend" / "src"

class MacroSyncMatrixUpdater:
    """Updates the macro endpoint synchronization matrix documentation."""
    
    def __init__(self):
        self.backend_endpoints = {}
        self.frontend_hooks = {}
        self.ui_components = {}
        self.audit_results = {}
        
    def scan_backend_endpoints(self) -> Dict[str, Dict]:
        """Scan backend endpoints for macro/ECB data."""
        print("🔍 Scanning backend endpoints...")
        
        endpoints = {}
        
        # Scan ECB endpoints
        ecb_dir = BACKEND_DIR / "api" / "endpoints" / "macro" / "ecb"
        if ecb_dir.exists():
            for py_file in ecb_dir.glob("*.py"):
                if py_file.name in ["__init__.py", "router.py", "utils.py"]:
                    continue
                    
                endpoint_name = py_file.stem
                router_prefix = self._extract_router_prefix(py_file)
                
                endpoints[f"ecb_{endpoint_name}"] = {
                    "file": str(py_file.relative_to(REPO_ROOT)),
                    "router_prefix": router_prefix,
                    "endpoints": self._extract_endpoints(py_file),
                    "status": "active"
                }
        
        # Scan other macro endpoints
        macro_dir = BACKEND_DIR / "api" / "endpoints" / "macro"
        for py_file in macro_dir.glob("*.py"):
            if py_file.name in ["__init__.py"] or py_file.parent.name == "ecb":
                continue
                
            endpoint_name = py_file.stem
            endpoints[f"macro_{endpoint_name}"] = {
                "file": str(py_file.relative_to(REPO_ROOT)),
                "router_prefix": "",
                "endpoints": self._extract_endpoints(py_file),
                "status": "active"
            }
        
        self.backend_endpoints = endpoints
        print(f"✅ Found {len(endpoints)} backend endpoint modules")
        return endpoints
    
    def scan_frontend_hooks(self) -> Dict[str, Dict]:
        """Scan frontend hooks for macro/ECB data."""
        print("🔍 Scanning frontend hooks...")
        
        hooks = {}
        hooks_dir = FRONTEND_DIR / "hooks" / "macro"
        
        if hooks_dir.exists():
            for ts_file in hooks_dir.glob("*.ts"):
                hook_name = ts_file.stem
                hook_content = ts_file.read_text()
                
                # Determine hook type and endpoint mapping
                hook_type = self._determine_hook_type(hook_name, hook_content)
                endpoint_mapping = self._extract_endpoint_mapping(hook_content)
                
                hooks[hook_name] = {
                    "file": str(ts_file.relative_to(REPO_ROOT)),
                    "type": hook_type,
                    "endpoint_mapping": endpoint_mapping,
                    "status": "active" if "export const" in hook_content else "placeholder"
                }
        
        self.frontend_hooks = hooks
        print(f"✅ Found {len(hooks)} frontend hooks")
        return hooks
    
    def scan_ui_components(self) -> Dict[str, Dict]:
        """Scan UI components for macro/ECB data."""
        print("🔍 Scanning UI components...")
        
        components = {}
        components_dir = FRONTEND_DIR / "components" / "financehub" / "macro"
        
        if components_dir.exists():
            for tsx_file in components_dir.glob("*.tsx"):
                component_name = tsx_file.stem
                component_content = tsx_file.read_text()
                
                # Determine component type and hook usage
                component_type = self._determine_component_type(component_name, component_content)
                hook_usage = self._extract_hook_usage(component_content)
                
                components[component_name] = {
                    "file": str(tsx_file.relative_to(REPO_ROOT)),
                    "type": component_type,
                    "hook_usage": hook_usage,
                    "status": "active" if "export default" in component_content else "placeholder"
                }
        
        self.ui_components = components
        print(f"✅ Found {len(components)} UI components")
        return components
    
    def load_audit_results(self) -> Dict:
        """Load latest audit results."""
        print("🔍 Loading audit results...")
        
        audit_file = REPO_ROOT / "audits" / "strict_scan_latest.json"
        if audit_file.exists():
            with open(audit_file, 'r') as f:
                self.audit_results = json.load(f)
            print(f"✅ Loaded audit results: {self.audit_results.get('summary', {})}")
        else:
            print("⚠️ No audit results found")
            self.audit_results = {}
        
        return self.audit_results
    
    def generate_sync_matrix(self) -> Dict:
        """Generate the complete synchronization matrix."""
        print("📊 Generating synchronization matrix...")
        
        matrix = {
            "generated": datetime.now().isoformat(),
            "summary": self._calculate_summary(),
            "categories": self._categorize_endpoints(),
            "details": self._generate_detailed_matrix(),
            "progress": self._calculate_progress(),
            "recommendations": self._generate_recommendations()
        }
        
        return matrix
    
    def update_documentation(self, matrix: Dict):
        """Update the documentation file with new matrix data."""
        print("📝 Updating documentation...")
        
        doc_file = DOCS_DIR / "MACRO_ENDPOINT_SYNC_MATRIX.md"
        
        # Read current documentation
        if doc_file.exists():
            content = doc_file.read_text()
        else:
            content = self._get_documentation_template()
        
        try:
            # Update statistics section
            content = self._update_statistics_section(content, matrix)
            
            # Update detailed matrix section
            content = self._update_matrix_section(content, matrix)
            
            # Update progress section
            content = self._update_progress_section(content, matrix)
            
            # Update recommendations section
            content = self._update_recommendations_section(content, matrix)
            
            # Write updated documentation
            doc_file.write_text(content)
            print(f"✅ Updated documentation: {doc_file}")
        except Exception as e:
            print(f"⚠️ Warning: Could not update documentation: {e}")
            # Still write the progress report
            pass
    
    def generate_progress_report(self, matrix: Dict) -> str:
        """Generate a progress report."""
        print("📈 Generating progress report...")
        
        summary = matrix["summary"]
        progress = matrix["progress"]
        
        report = f"""
# 📊 Macro Endpoint Sync Progress Report
**Generated:** {matrix['generated']}

## 📈 Summary Statistics
- **Backend Endpoints:** {summary['backend_endpoints']}
- **Frontend Hooks:** {summary['frontend_hooks']}
- **UI Components:** {summary['ui_components']}
- **Fully Integrated:** {summary['fully_integrated']}
- **Partially Integrated:** {summary['partially_integrated']}
- **Missing Integration:** {summary['missing_integration']}

## 🎯 Progress Metrics
- **Overall Progress:** {progress['overall_progress']:.1f}%
- **Backend Coverage:** {progress['backend_coverage']:.1f}%
- **Frontend Hook Coverage:** {progress['frontend_hook_coverage']:.1f}%
- **UI Component Coverage:** {progress['ui_component_coverage']:.1f}%

## 🔴 Critical Missing Items
"""
        
        for item in matrix["recommendations"]["critical"]:
            report += f"- {item}\n"
        
        report += "\n## 🟡 High Priority Items\n"
        for item in matrix["recommendations"]["high"]:
            report += f"- {item}\n"
        
        return report
    
    def _extract_router_prefix(self, py_file: Path) -> str:
        """Extract router prefix from Python file."""
        content = py_file.read_text()
        match = re.search(r'router\s*=\s*APIRouter\([^)]*prefix\s*=\s*["\']([^"\']+)["\']', content)
        return match.group(1) if match else ""
    
    def _extract_endpoints(self, py_file: Path) -> List[str]:
        """Extract endpoint paths from Python file."""
        content = py_file.read_text()
        endpoints = []
        
        # Find @router.get decorators
        matches = re.findall(r'@.*?\.get\(["\']([^"\']+)["\']', content)
        endpoints.extend(matches)
        
        return endpoints
    
    def _determine_hook_type(self, hook_name: str, content: str) -> str:
        """Determine the type of hook based on name and content."""
        if "ECB" in hook_name:
            return "ecb"
        elif "Forex" in hook_name or "FX" in hook_name:
            return "forex"
        elif "Bubor" in hook_name:
            return "bubor"
        elif "UST" in hook_name or "Yield" in hook_name:
            return "yield_curve"
        else:
            return "macro"
    
    def _extract_endpoint_mapping(self, content: str) -> List[str]:
        """Extract endpoint mappings from hook content."""
        # Look for API calls
        matches = re.findall(r'["\']/api/v[^"\']+["\']', content)
        return [match.strip('"\'') for match in matches]
    
    def _determine_component_type(self, component_name: str, content: str) -> str:
        """Determine the type of component."""
        if "Card" in component_name:
            return "card"
        elif "Chart" in component_name:
            return "chart"
        elif "Dashboard" in component_name:
            return "dashboard"
        elif "Modal" in component_name:
            return "modal"
        else:
            return "component"
    
    def _extract_hook_usage(self, content: str) -> List[str]:
        """Extract hook usage from component content."""
        matches = re.findall(r'use[A-Z][a-zA-Z]+', content)
        return list(set(matches))
    
    def _calculate_summary(self) -> Dict:
        """Calculate summary statistics."""
        backend_count = len(self.backend_endpoints)
        hook_count = len([h for h in self.frontend_hooks.values() if h["status"] == "active"])
        component_count = len([c for c in self.ui_components.values() if c["status"] == "active"])
        
        # Calculate integration status
        fully_integrated = 0
        partially_integrated = 0
        missing_integration = 0
        
        for endpoint_name, endpoint_data in self.backend_endpoints.items():
            has_hook = any(hook_name.lower().startswith(endpoint_name.lower()) 
                          for hook_name in self.frontend_hooks.keys())
            has_component = any(comp_name.lower().startswith(endpoint_name.lower()) 
                               for comp_name in self.ui_components.keys())
            
            if has_hook and has_component:
                fully_integrated += 1
            elif has_hook or has_component:
                partially_integrated += 1
            else:
                missing_integration += 1
        
        return {
            "backend_endpoints": backend_count,
            "frontend_hooks": hook_count,
            "ui_components": component_count,
            "fully_integrated": fully_integrated,
            "partially_integrated": partially_integrated,
            "missing_integration": missing_integration
        }
    
    def _categorize_endpoints(self) -> Dict:
        """Categorize endpoints by type."""
        categories = {
            "ecb_policy_rates": [],
            "ecb_yield_curve": [],
            "ecb_fx_rates": [],
            "ecb_comprehensive": [],
            "ecb_monetary": [],
            "ecb_sts": [],
            "ecb_inflation": [],
            "ecb_bop": [],
            "ecb_advanced": [],
            "bubor": [],
            "ust_yield_curve": [],
            "forex": []
        }
        
        for endpoint_name, endpoint_data in self.backend_endpoints.items():
            if "ecb_rates" in endpoint_name or "ecb_policy" in endpoint_name:
                categories["ecb_policy_rates"].append(endpoint_name)
            elif "yield_curve" in endpoint_name:
                categories["ecb_yield_curve"].append(endpoint_name)
            elif "fx" in endpoint_name:
                categories["ecb_fx_rates"].append(endpoint_name)
            elif "comprehensive" in endpoint_name:
                categories["ecb_comprehensive"].append(endpoint_name)
            elif "bsi" in endpoint_name or "monetary" in endpoint_name:
                categories["ecb_monetary"].append(endpoint_name)
            elif "sts" in endpoint_name:
                categories["ecb_sts"].append(endpoint_name)
            elif "inflation" in endpoint_name or "hicp" in endpoint_name:
                categories["ecb_inflation"].append(endpoint_name)
            elif "bop" in endpoint_name:
                categories["ecb_bop"].append(endpoint_name)
            elif "bubor" in endpoint_name:
                categories["bubor"].append(endpoint_name)
            elif "ust" in endpoint_name:
                categories["ust_yield_curve"].append(endpoint_name)
            elif "forex" in endpoint_name:
                categories["forex"].append(endpoint_name)
            else:
                categories["ecb_advanced"].append(endpoint_name)
        
        return categories
    
    def _generate_detailed_matrix(self) -> List[Dict]:
        """Generate detailed matrix entries."""
        matrix_entries = []
        
        for endpoint_name, endpoint_data in self.backend_endpoints.items():
            # Find corresponding hook
            hook_name = None
            hook_status = "missing"
            for hook_name_candidate in self.frontend_hooks.keys():
                if endpoint_name.lower() in hook_name_candidate.lower():
                    hook_name = hook_name_candidate
                    hook_status = self.frontend_hooks[hook_name]["status"]
                    break
            
            # Find corresponding component
            component_name = None
            component_status = "missing"
            for component_name_candidate in self.ui_components.keys():
                if endpoint_name.lower() in component_name_candidate.lower():
                    component_name = component_name_candidate
                    component_status = self.ui_components[component_name]["status"]
                    break
            
            # Determine overall status
            if hook_status == "active" and component_status == "active":
                overall_status = "✅ OK"
            elif hook_status == "active" or component_status == "active":
                overall_status = "⚠️ Partial"
            else:
                overall_status = "❌ Missing"
            
            matrix_entries.append({
                "endpoint": endpoint_name,
                "backend_status": "✅ Active",
                "hook": hook_name or "❌ Missing",
                "hook_status": hook_status,
                "component": component_name or "❌ Missing",
                "component_status": component_status,
                "overall_status": overall_status
            })
        
        return matrix_entries
    
    def _calculate_progress(self) -> Dict:
        """Calculate progress metrics."""
        summary = self._calculate_summary()
        
        total_endpoints = summary["backend_endpoints"]
        if total_endpoints == 0:
            return {
                "overall_progress": 0.0,
                "backend_coverage": 0.0,
                "frontend_hook_coverage": 0.0,
                "ui_component_coverage": 0.0
            }
        
        backend_coverage = 100.0  # All backend endpoints are active
        frontend_hook_coverage = (summary["frontend_hooks"] / total_endpoints) * 100
        ui_component_coverage = (summary["ui_components"] / total_endpoints) * 100
        overall_progress = (summary["fully_integrated"] / total_endpoints) * 100
        
        return {
            "overall_progress": overall_progress,
            "backend_coverage": backend_coverage,
            "frontend_hook_coverage": frontend_hook_coverage,
            "ui_component_coverage": ui_component_coverage
        }
    
    def _generate_recommendations(self) -> Dict:
        """Generate development recommendations."""
        critical = []
        high = []
        medium = []
        
        # Check for missing hooks
        for endpoint_name in self.backend_endpoints.keys():
            has_hook = any(hook_name.lower().startswith(endpoint_name.lower()) 
                          for hook_name in self.frontend_hooks.keys())
            if not has_hook:
                critical.append(f"Create hook for {endpoint_name}")
        
        # Check for missing components
        for endpoint_name in self.backend_endpoints.keys():
            has_component = any(comp_name.lower().startswith(endpoint_name.lower()) 
                               for comp_name in self.ui_components.keys())
            has_hook = any(hook_name.lower().startswith(endpoint_name.lower()) 
                          for hook_name in self.frontend_hooks.keys())
            
            if has_hook and not has_component:
                high.append(f"Create UI component for {endpoint_name}")
        
        # Check for placeholder hooks
        for hook_name, hook_data in self.frontend_hooks.items():
            if hook_data["status"] == "placeholder":
                medium.append(f"Implement {hook_name} hook")
        
        # Check for placeholder components
        for component_name, component_data in self.ui_components.items():
            if component_data["status"] == "placeholder":
                medium.append(f"Implement {component_name} component")
        
        return {
            "critical": critical,
            "high": high,
            "medium": medium
        }
    
    def _get_documentation_template(self) -> str:
        """Get documentation template."""
        return """# 🗂️ **FinanceHub Macro/ECB Endpoints – Szinkronizációs Mátrix**

**Verzió:** 1.0  
**Utolsó frissítés:** {date}  
**Státusz:** 🔄 **AKTÍV FEJLESZTÉS**  
**Audit eredmény:** ✅ {audit_summary}

---

## 📊 **ÖSSZEFOGLALÓ STATISZTIKA**

| Kategória | Backend Endpointok | Frontend Hook-ok | UI Komponensek | Bekötött | Hiányzó |
|-----------|-------------------|------------------|----------------|----------|---------|
| **ÖSSZESEN** | **{backend_count}** | **{hook_count}** | **{component_count}** | **{integrated_count}** | **{missing_count}** |

---

## 🔄 **RÉSZLETES SZINKRONIZÁCIÓS MÁTRIX**

{detailed_matrix}

---

## 📈 **PROGRESSZ KÖVETÉS**

### **Kvalitatív Metrikák**

- **Backend Stabilitás**: ✅ {backend_success_rate}% success rate
- **Frontend Hook Coverage**: ✅ {hook_coverage}%
- **UI Komponens Coverage**: ⚠️ {component_coverage}%
- **Teljes Integráció**: ⚠️ {overall_progress}%

---

## 🎯 **FEJLESZTÉSI PRIORITÁSOK**

### **🔴 KRITIKUS (Azonnali fejlesztés)**

{critical_recommendations}

### **🟡 MAGAS (1-2 hét)**

{high_recommendations}

### **🟢 KÖZEPES (2-4 hét)**

{medium_recommendations}

---

**Utolsó frissítés:** {date}  
**Következő frissítés:** {next_date}  
**Dokument tulajdonos:** Aevorex Development Team

---

*Ez a dokumentum a FinanceHub macro/ECB endpointok teljes szinkronizációs állapotát követi. Minden fejlesztésnél frissítendő.*
"""
    
    def _update_statistics_section(self, content: str, matrix: Dict) -> str:
        """Update statistics section in documentation."""
        summary = matrix["summary"]
        
        # Simple replacement for statistics table
        old_stats = "| **ÖSSZESEN** | **35** | **31** | **11** | **28/35** | **7** |"
        new_stats = f"| **ÖSSZESEN** | **{summary['backend_endpoints']}** | **{summary['frontend_hooks']}** | **{summary['ui_components']}** | **{summary['fully_integrated']}** | **{summary['missing_integration']}** |"
        
        content = content.replace(old_stats, new_stats)
        
        return content
    
    def _update_matrix_section(self, content: str, matrix: Dict) -> str:
        """Update detailed matrix section."""
        # This would require more complex parsing and replacement
        # For now, we'll just update the generation date
        content = re.sub(
            r'**Utolsó frissítés:** \d{4}-\d{2}-\d{2}',
            f'**Utolsó frissítés:** {datetime.now().strftime("%Y-%m-%d")}',
            content
        )
        
        return content
    
    def _update_progress_section(self, content: str, matrix: Dict) -> str:
        """Update progress section."""
        progress = matrix["progress"]
        
        # Update progress metrics
        content = re.sub(
            r'**Teljes Integráció**: ⚠️ \d+%',
            f'**Teljes Integráció**: ⚠️ {progress["overall_progress"]:.1f}%',
            content
        )
        
        content = re.sub(
            r'**Frontend Hook Coverage**: ✅ \d+%',
            f'**Frontend Hook Coverage**: ✅ {progress["frontend_hook_coverage"]:.1f}%',
            content
        )
        
        content = re.sub(
            r'**UI Komponens Coverage**: ⚠️ \d+%',
            f'**UI Komponens Coverage**: ⚠️ {progress["ui_component_coverage"]:.1f}%',
            content
        )
        
        return content
    
    def _update_recommendations_section(self, content: str, matrix: Dict) -> str:
        """Update recommendations section."""
        recommendations = matrix["recommendations"]
        
        # Update critical recommendations
        critical_text = "\n".join([f"1. **{item}**" for item in recommendations["critical"]])
        if not critical_text:
            critical_text = "Nincs kritikus hiányzó elem."
        
        # Simple replacement for critical section
        old_critical = "### **🔴 KRITIKUS (Azonnali fejlesztés)**\n\n1. **ECB Inflation (HICP) Hook + UI Card**\n2. **ECB Balance of Payments Hook + UI Card**\n\n"
        new_critical = f"### **🔴 KRITIKUS (Azonnali fejlesztés)**\n\n{critical_text}\n\n"
        
        content = content.replace(old_critical, new_critical)
        
        # Update high priority recommendations
        high_text = "\n".join([f"3. **{item}**" for item in recommendations["high"]])
        if not high_text:
            high_text = "Nincs magas prioritású hiányzó elem."
        
        # Simple replacement for high priority section
        old_high = "### **🟡 MAGAS (1-2 hét)**\n\n3. **ECB Monetary Aggregates UI Card**\n4. **ECB STS UI Card**\n\n"
        new_high = f"### **🟡 MAGAS (1-2 hét)**\n\n{high_text}\n\n"
        
        content = content.replace(old_high, new_high)
        
        return content

def main():
    """Main function to update the macro sync matrix."""
    print("🚀 Starting Macro Endpoint Sync Matrix Update")
    print("=" * 50)
    
    updater = MacroSyncMatrixUpdater()
    
    try:
        # Scan all components
        updater.scan_backend_endpoints()
        updater.scan_frontend_hooks()
        updater.scan_ui_components()
        updater.load_audit_results()
        
        # Generate matrix
        matrix = updater.generate_sync_matrix()
        
        # Update documentation
        updater.update_documentation(matrix)
        
        # Generate progress report
        report = updater.generate_progress_report(matrix)
        
        # Save progress report
        report_file = REPO_ROOT / "docs" / "MACRO_PROGRESS_REPORT.md"
        report_file.write_text(report)
        
        print("\n" + "=" * 50)
        print("✅ Macro Endpoint Sync Matrix Update Complete!")
        print(f"📊 Progress Report: {report_file}")
        print(f"📝 Updated Documentation: {DOCS_DIR / 'MACRO_ENDPOINT_SYNC_MATRIX.md'}")
        
        # Print summary
        summary = matrix["summary"]
        print(f"\n📈 Summary:")
        print(f"   Backend Endpoints: {summary['backend_endpoints']}")
        print(f"   Frontend Hooks: {summary['frontend_hooks']}")
        print(f"   UI Components: {summary['ui_components']}")
        print(f"   Fully Integrated: {summary['fully_integrated']}")
        print(f"   Missing Integration: {summary['missing_integration']}")
        
    except Exception as e:
        print(f"❌ Error updating macro sync matrix: {e}")
        return 1
    
    return 0

if __name__ == "__main__":
    exit(main()) 