from __future__ import annotations
"""Legacy compatibility shim.

This file re-exports ``MacroDataService`` from the new modular path
``modules.financehub.backend.core.services.macro.macro_service`` so that
older imports (``modules.financehub.backend.core.services.macro_service``)
continue to work after the July-2025 refactor.

Keep this file minimal – no additional business logic should be added.
"""

from modules.financehub.backend.core.services.macro.macro_service import MacroDataService  # noqa: F401

__all__: list[str] = ["MacroDataService"] 