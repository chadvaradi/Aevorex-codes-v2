# backend/core.indicator_service/calculators/rsi.py
import numpy as np

try:
    import talib
    TA_AVAILABLE = True
except ImportError:
    TA_AVAILABLE = False

def calculate_rsi(close_prices: np.ndarray, period: int) -> np.ndarray:
    """Calculates the Relative Strength Index (RSI)."""
    if not TA_AVAILABLE:
        raise ImportError("TA-Lib is not available, cannot calculate RSI.")
    
    return talib.RSI(close_prices, timeperiod=period) 