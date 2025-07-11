"""Orchestrator package shim.

This file re-exports the stable `StockOrchestrator` class that now lives in
``modules.financehub.backend.core.services.stock.orchestrator`` so that legacy
imports such as::

    from modules.financehub.backend.core.orchestrator import StockOrchestrator

continue to work without modifications across the codebase.

The indirection keeps the *public* import path unchanged while allowing us to
iterate on the internal folder structure.
"""

from importlib import import_module
from types import ModuleType
from typing import TYPE_CHECKING  # noqa: F401

# Lazily import the real implementation to avoid unnecessary side-effects if
# the orchestrator module pulls in heavy dependencies.

_mod: ModuleType = import_module("modules.financehub.backend.core.services.stock.orchestrator")

# Re-export
StockOrchestrator = getattr(_mod, "StockOrchestrator")

# Public API
__all__ = ["StockOrchestrator"] 