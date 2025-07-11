"""Backward-compatibility alias.

This module re-exports :class:`MacroDataService` and a convenience
`get_macro_data_service` factory so that older import paths
``modules.financehub.backend.core.services.macro_data_service`` continue to
work after the service was consolidated into ``macro_service.py``.

Do **not** add heavyweight logic here – import directly from
``macro_service`` in new code.
"""

# Re-export main implementation
from .macro_service import MacroDataService  # noqa: F401

# Simple dependency helper matching FastAPI Depends style

def get_macro_data_service() -> MacroDataService:  # noqa: D401,E501
    """Return a new :class:`MacroDataService` instance (no cache bound)."""
    return MacroDataService() 