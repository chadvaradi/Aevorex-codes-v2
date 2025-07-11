# backend/core.indicator_service/calculators/macd.py
import numpy as np

try:
    import talib
    TA_AVAILABLE = True
except ImportError:
    TA_AVAILABLE = False

def calculate_macd(close_prices: np.ndarray, fast_period: int, slow_period: int, signal_period: int) -> tuple[np.ndarray, np.ndarray, np.ndarray]:
    """Calculates the Moving Average Convergence Divergence (MACD)."""
    if not TA_AVAILABLE:
        raise ImportError("TA-Lib is not available, cannot calculate MACD.")
        
    macd_line, macd_signal, macd_hist = talib.MACD(close_prices, fastperiod=fast_period, slowperiod=slow_period, signalperiod=signal_period)
    return macd_line, macd_signal, macd_hist 