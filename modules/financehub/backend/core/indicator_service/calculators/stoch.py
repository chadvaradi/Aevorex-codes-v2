# backend/core.indicator_service/calculators/stoch.py
import numpy as np

try:
    import talib
    TA_AVAILABLE = True
except ImportError:
    TA_AVAILABLE = False

def calculate_stoch(high_prices: np.ndarray, low_prices: np.ndarray, close_prices: np.ndarray, k_period: int, d_period: int) -> tuple[np.ndarray, np.ndarray]:
    """Calculates the Stochastic Oscillator."""
    if not TA_AVAILABLE:
        raise ImportError("TA-Lib is not available, cannot calculate Stochastic Oscillator.")
        
    stoch_k, stoch_d = talib.STOCH(high_prices, low_prices, close_prices, fastk_period=k_period, slowk_period=d_period, slowd_period=d_period)
    return stoch_k, stoch_d 