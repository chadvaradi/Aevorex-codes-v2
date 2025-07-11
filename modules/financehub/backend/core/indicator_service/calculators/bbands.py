# backend/core.indicator_service/calculators/bbands.py
import numpy as np

try:
    import talib
    TA_AVAILABLE = True
except ImportError:
    TA_AVAILABLE = False

def calculate_bbands(close_prices: np.ndarray, period: int, std_dev: float) -> tuple[np.ndarray, np.ndarray, np.ndarray]:
    """Calculates Bollinger Bands."""
    if not TA_AVAILABLE:
        raise ImportError("TA-Lib is not available, cannot calculate Bollinger Bands.")

    upper, middle, lower = talib.BBANDS(close_prices, timeperiod=period, nbdevup=std_dev, nbdevdn=std_dev)
    return upper, middle, lower 