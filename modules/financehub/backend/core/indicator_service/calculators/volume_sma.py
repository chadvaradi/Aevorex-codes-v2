import numpy as np

try:
    import talib
    TA_AVAILABLE = True
except ImportError:
    TA_AVAILABLE = False

def calculate_volume_sma(volume_data: np.ndarray, period: int) -> np.ndarray:
    """Calculates the Simple Moving Average of the volume."""
    if not TA_AVAILABLE:
        raise ImportError("TA-Lib is not available, cannot calculate Volume SMA.")
        
    return talib.SMA(volume_data, timeperiod=period) 