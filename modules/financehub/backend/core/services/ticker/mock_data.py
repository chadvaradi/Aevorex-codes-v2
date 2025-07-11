"""
Mock Ticker Tape Data for Development
====================================

This module provides mock ticker tape data when API keys are not available
or for development purposes.
"""
import random
from typing import Dict, Any, List
from datetime import datetime

# IBKR-grade 29-symbol master list
MOCK_SYMBOLS = [
    # US Equities - Magnificent 7 + High Volume
    "NVDA", "AAPL", "MSFT", "AMZN", "GOOGL", "META", "TSLA",
    "BAC", "HOOD", "PLTR", "AMD", "INTC",
    
    # Global Index ETFs
    "SPY", "QQQ", "DIA", "IWM",
    
    # Index Futures (cash equivalent) - simplified for mock
    "ES", "NQ", "YM", "RTY", "VIX", "DAX", "FTSE",
    
    # Forex Majors + 2 Cross - simplified for mock
    "EURUSD", "USDJPY", "GBPUSD", "AUDUSD", "USDCAD", "USDCHF", "EURJPY", "GBPJPY",
    
    # Crypto Market-cap TOP 5 + 2 Narrative - simplified for mock
    "BTC", "ETH", "BNB", "SOL", "XRP", "DOGE", "TON",
    
    # Commodities (High Macro Correlation) - simplified for mock
    "GOLD", "SILVER", "OIL", "GAS"
]

# Base prices for realistic mock data
BASE_PRICES = {
    # US Equities
    "NVDA": 800.0, "AAPL": 190.0, "MSFT": 420.0, "AMZN": 180.0, 
    "GOOGL": 175.0, "META": 520.0, "TSLA": 250.0,
    "BAC": 45.0, "HOOD": 23.0, "PLTR": 25.0, "AMD": 160.0, "INTC": 25.0,
    
    # ETFs
    "SPY": 550.0, "QQQ": 480.0, "DIA": 420.0, "IWM": 220.0,
    
    # Index Futures
    "ES": 5500.0, "NQ": 19500.0, "YM": 42000.0, "RTY": 2200.0, 
    "VIX": 15.0, "DAX": 18500.0, "FTSE": 8200.0,
    
    # Forex (in pips/points)
    "EURUSD": 1.0850, "USDJPY": 155.50, "GBPUSD": 1.2750, "AUDUSD": 0.6650,
    "USDCAD": 1.3750, "USDCHF": 0.8950, "EURJPY": 168.50, "GBPJPY": 198.50,
    
    # Crypto
    "BTC": 95000.0, "ETH": 3800.0, "BNB": 650.0, "SOL": 220.0,
    "XRP": 2.30, "DOGE": 0.38, "TON": 5.50,
    
    # Commodities
    "GOLD": 2650.0, "SILVER": 30.5, "OIL": 78.0, "GAS": 3.2
}

def generate_mock_ticker_data() -> List[Dict[str, Any]]:
    """
    Generate realistic mock ticker tape data for development.
    
    Returns:
        List of ticker items with symbol, price, change, and change_percent
    """
    mock_data = []
    
    for symbol in MOCK_SYMBOLS:
        base_price = BASE_PRICES.get(symbol, 100.0)
        
        # Generate realistic price movement (-5% to +5%)
        change_percent = random.uniform(-5.0, 5.0)
        change = base_price * (change_percent / 100)
        current_price = base_price + change
        
        # Round appropriately based on asset type
        if symbol in ["VIX"]:
            # VIX typically has 2 decimal places
            current_price = round(current_price, 2)
            change = round(change, 2)
        elif symbol.startswith(("EUR", "USD", "GBP", "AUD", "CHF", "JPY")):
            # Forex typically has 4-5 decimal places
            current_price = round(current_price, 4)
            change = round(change, 4)
        elif symbol in ["BTC", "ETH"]:
            # Major crypto typically whole numbers
            current_price = round(current_price, 0)
            change = round(change, 0)
        elif symbol in ["XRP", "DOGE"]:
            # Smaller crypto with more decimals
            current_price = round(current_price, 3)
            change = round(change, 3)
        else:
            # Stocks typically 2 decimal places
            current_price = round(current_price, 2)
            change = round(change, 2)
        
        change_percent = round(change_percent, 2)
        
        ticker_item = {
            "symbol": symbol,
            "price": current_price,
            "change": change,
            "change_percent": change_percent,
            "timestamp": datetime.utcnow().isoformat(),
            "source": "mock_data"
        }
        
        mock_data.append(ticker_item)
    
    return mock_data

def get_mock_ticker_item(symbol: str) -> Dict[str, Any] | None:
    """
    Get mock data for a single ticker symbol.
    
    Args:
        symbol: The ticker symbol to get data for
        
    Returns:
        Dictionary with ticker data or None if symbol not found
    """
    if symbol not in MOCK_SYMBOLS and symbol not in BASE_PRICES:
        return None
    
    base_price = BASE_PRICES.get(symbol, 100.0)
    change_percent = random.uniform(-3.0, 3.0)
    change = base_price * (change_percent / 100)
    current_price = base_price + change
    
    return {
        "symbol": symbol,
        "price": round(current_price, 2),
        "change": round(change, 2),
        "change_percent": round(change_percent, 2),
        "timestamp": datetime.utcnow().isoformat(),
        "source": "mock_data"
    } 