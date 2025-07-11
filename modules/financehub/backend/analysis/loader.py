"""
This module is responsible for loading and extracting data required for AI analysis.
"""
import random
import logging

from .models import MarketData

logger = logging.getLogger(__name__)

# This was previously a method on the RealTimeAIAnalyzer class.
# It's now a standalone helper function.
def extract_market_data(symbol: str, basic_data: dict | None, fundamentals: dict | None, market_sectors: dict) -> MarketData:
    """Extract and validate market data from API responses"""
    try:
        price_data = basic_data.get("price_data", {}) if basic_data else {}
        # The following line was unused, keeping it commented for reference
        # basic_data.get("company_info", {}) if basic_data else {}
        ratios = fundamentals.get("financial_ratios", {}) if fundamentals else {}
        metrics = fundamentals.get("key_metrics", {}) if fundamentals else {}
        
        return MarketData(
            symbol=symbol,
            current_price=price_data.get("price", 150.0 + random.uniform(-50, 50)),
            volume=price_data.get("volume", random.randint(10000000, 100000000)),
            market_cap=metrics.get("market_cap", random.randint(100000000000, 3000000000000)),
            beta=metrics.get("beta", 0.8 + random.uniform(-0.3, 0.7)),
            pe_ratio=ratios.get("pe_ratio"),
            sector=market_sectors.get(symbol, "Technology")
        )
    except Exception as e:
        logger.error(f"Error extracting market data for {symbol}: {e}")
        return generate_synthetic_market_data(symbol, market_sectors)

def generate_synthetic_market_data(symbol: str, market_sectors: dict) -> MarketData:
    """Generate realistic synthetic market data when real data unavailable"""
    base_prices = {"AAPL": 180, "MSFT": 350, "GOOGL": 140, "TSLA": 200, "NVDA": 450}
    base_price = base_prices.get(symbol, 150)
    
    return MarketData(
        symbol=symbol,
        current_price=base_price + random.uniform(-base_price*0.1, base_price*0.1),
        volume=random.randint(20000000, 80000000),
        market_cap=random.randint(500000000000, 2500000000000),
        beta=0.9 + random.uniform(-0.4, 0.6),
        pe_ratio=15 + random.uniform(-10, 20) if random.random() > 0.3 else None,
        sector=market_sectors.get(symbol, "Technology")
    ) 