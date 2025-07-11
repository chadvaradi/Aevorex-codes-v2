#!/usr/bin/env python3
"""CI helper: validates rules/baseline_rule0.yaml & overlay YAMLs.

1. Basic YAML parse check (PyYAML safe_load).
2. Required top-level keys in baseline file: rule_id, version, updated, mission, action_workflow, constraints, quality_gates, tooling_tips, ci_assertions.
3. Ensures module overlay files referenced actually exist.
4. Version bump guard: if baseline YAML changed in diff but version not bumped, exit non-zero.

The script is intentionally lightweight to avoid extra dependencies – only uses stdlib & PyYAML.
"""
from __future__ import annotations
import pathlib
import subprocess
import sys
from typing import Any, Dict

try:
    import yaml
except ImportError:
    print("PyYAML missing – install via 'pip install pyyaml'", file=sys.stderr)
    sys.exit(1)

REPO_ROOT = pathlib.Path(__file__).resolve().parent.parent
BASELINE_FILE = REPO_ROOT / "rules" / "baseline_rule0.yaml"
REQUIRED_KEYS = {
    "rule_id",
    "version",
    "updated",
    "mission",
    "action_workflow",
    "constraints",
    "quality_gates",
    "tooling_tips",
    "ci_assertions",
    "module_overlays",
}


def _load_yaml(path: pathlib.Path) -> Dict[str, Any]:
    with path.open("r", encoding="utf-8") as f:
        return yaml.safe_load(f)


def _validate_baseline(data: Dict[str, Any]):
    missing = REQUIRED_KEYS - data.keys()
    if missing:
        print(f"baseline_rule0.yaml missing required keys: {sorted(missing)}", file=sys.stderr)
        sys.exit(1)

    # Ensure module overlay files exist
    module_overlays: Dict[str, str] = data.get("module_overlays", {}) or {}
    for name, rel_path in module_overlays.items():
        overlay_path = REPO_ROOT / rel_path
        if not overlay_path.exists():
            print(f"Overlay for module '{name}' not found: {rel_path}", file=sys.stderr)
            sys.exit(1)


def _version_bump_guard():
    """If baseline file changed in HEAD, ensure 'version' field changed relative to main branch."""
    # Only run on PRs – if git remote missing, skip gracefully
    try:
        # diff baseline against origin/main (or previous commit if not available)
        diff_output = subprocess.check_output([
            "git",
            "diff",
            "origin/main...HEAD",
            "--",
            str(BASELINE_FILE),
        ], text=True)
    except subprocess.CalledProcessError:
        return  # ignore if git command fails

    if not diff_output.strip():
        return  # no changes

    # parse versions
    head_data = _load_yaml(BASELINE_FILE)
    version_head = str(head_data.get("version", "0"))

    try:
        base_content = subprocess.check_output([
            "git",
            "show",
            f"origin/main:{BASELINE_FILE.relative_to(REPO_ROOT)}",
        ], text=True)
        base_data = yaml.safe_load(base_content)
        version_base = str(base_data.get("version", "0"))
    except subprocess.CalledProcessError:
        # baseline not on main (new file) – skip
        return

    if version_head == version_base:
        print("baseline_rule0.yaml changed but 'version' not bumped. Please increment version.", file=sys.stderr)
        sys.exit(1)


def main():
    if not BASELINE_FILE.exists():
        print("baseline_rule0.yaml not found", file=sys.stderr)
        sys.exit(1)

    baseline_data = _load_yaml(BASELINE_FILE)
    _validate_baseline(baseline_data)
    _version_bump_guard()

    # Validate user overlays
    overlays_dir = REPO_ROOT / "rules"
    for overlay_path in overlays_dir.glob("*overlay*.yaml"):
        try:
            yaml.safe_load(overlay_path.read_text())
        except yaml.YAMLError as e:
            print(f"YAML syntax error in overlay {overlay_path}: {e}", file=sys.stderr)
            sys.exit(1)

    print("Rule0 validation passed ✅")


if __name__ == "__main__":
    main() 