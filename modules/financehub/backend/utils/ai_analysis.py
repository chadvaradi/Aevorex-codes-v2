"""
AI Analysis Service - Entry Point
=================================

This module serves as the primary entry point for generating
AI-powered financial analysis.

It uses the refactored, modular components from the `analysis` package.

Version: 3.0.0 - Refactored
Author: AEVOREX Team
"""
import logging
from typing import Any

from modules.financehub.backend.analysis.summarizer import RealTimeAIAnalyzer

logger = logging.getLogger(__name__)

# Singleton instance of the analyzer
_analyzer_instance = None

def _get_analyzer():
    """Initializes and returns a singleton instance of the analyzer."""
    global _analyzer_instance
    if _analyzer_instance is None:
        _analyzer_instance = RealTimeAIAnalyzer()
    return _analyzer_instance

async def generate_ai_analysis(
    symbol: str,
    basic_data: dict | None = None,
    chart_data: dict | None = None,
    fundamentals: dict | None = None,
) -> dict[str, Any]:
    """
    Top-level function to generate comprehensive AI analysis for a stock.

    This function initializes the singleton analyzer and calls its
    main analysis method.
    """
    analyzer = _get_analyzer()
    return await analyzer.generate_comprehensive_analysis(
        symbol=symbol,
        basic_data=basic_data,
        chart_data=chart_data,
        fundamentals=fundamentals,
    ) 