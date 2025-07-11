# backend/core.indicator_service/calculators/sma.py
import numpy as np

try:
    import talib
    TA_AVAILABLE = True
except ImportError:
    TA_AVAILABLE = False

def calculate_sma(close_prices: np.ndarray, short_period: int, long_period: int) -> tuple[np.ndarray, np.ndarray]:
    """Calculates short and long Simple Moving Averages."""
    if not TA_AVAILABLE:
        raise ImportError("TA-Lib is not available, cannot calculate SMA.")
        
    sma_short = talib.SMA(close_prices, timeperiod=short_period)
    sma_long = talib.SMA(close_prices, timeperiod=long_period)
    return sma_short, sma_long 