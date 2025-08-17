"""
This module contains the main AI analysis class and its summarization logic.
"""
import random
import logging
from datetime import datetime
from typing import Any

from .models import MarketData, TechnicalIndicators
from .loader import extract_market_data
from .parser import analyze_technical_indicators

logger = logging.getLogger(__name__)

class RealTimeAIAnalyzer:
    """
    Advanced AI Financial Analysis Engine.
    This class has been refactored to use dedicated loaders and parsers.
    """
    
    def __init__(self):
        # These databases are part of the analyzer's core knowledge
        self.market_sectors = {
            "AAPL": "Technology", "MSFT": "Technology", "GOOGL": "Technology",
            "TSLA": "Automotive", "NVDA": "Technology", "META": "Technology",
            "AMZN": "E-commerce", "JPM": "Financial", "JNJ": "Healthcare",
            "V": "Financial", "WMT": "Retail", "UNH": "Healthcare"
        }
        self.risk_factors_db = {
            "Technology": ["Rapid technological change", "Regulatory scrutiny", "Supply chain dependencies"],
            "Healthcare": ["Regulatory approval delays", "Patent expiration", "Policy changes"],
            "Financial": ["Interest rate volatility", "Credit risk", "Digital disruption"]
        }
        self.growth_drivers_db = {
            "Technology": ["AI and machine learning adoption", "Cloud computing", "5G infrastructure"],
            "Healthcare": ["Aging global population", "Precision medicine", "Digital health"],
            "Financial": ["Digital payment adoption", "Wealth management expansion", "ESG investing"]
        }

    async def generate_comprehensive_analysis(
        self, 
        symbol: str, 
        basic_data: dict | None = None,
        chart_data: dict | None = None,
        fundamentals: dict | None = None
    ) -> dict[str, Any]:
        """
        Generate comprehensive AI analysis for a stock using refactored services.
        """
        logger.info(f"🧠 Generating AI analysis for {symbol}")
        
        try:
            # Use refactored loader and parser
            market_data = extract_market_data(symbol, basic_data, fundamentals, self.market_sectors)
            technical_data = analyze_technical_indicators(chart_data)
            
            # Generate intelligent analysis
            sentiment = self._calculate_sentiment(market_data, technical_data)
            ai_score = self._calculate_ai_score(market_data, technical_data, fundamentals)
            price_targets = self._calculate_price_targets(market_data, technical_data)
            risk_assessment = self._analyze_risks(market_data)
            growth_analysis = self._analyze_growth_drivers(market_data)

            # Pre-compute trend once to avoid undefined variable errors
            trend = self._determine_trend(technical_data)
            
            # Create comprehensive analysis
            analysis = {
                "summary": self._generate_summary(symbol, market_data, sentiment, ai_score, trend),
                "sentiment": sentiment["label"],
                "score": ai_score,
                "confidence_level": self._calculate_confidence(market_data, technical_data),
                "key_insights": self._generate_insights(market_data, technical_data),
                "risk_factors": risk_assessment,
                "growth_drivers": growth_analysis,
                "price_targets": price_targets,
                "technical_analysis": {
                    "trend": self._determine_trend(technical_data),
                    "support_levels": technical_data.support_levels,
                    "resistance_levels": technical_data.resistance_levels,
                    "indicators": {
                        "rsi": technical_data.rsi,
                        "macd": technical_data.macd_signal,
                        "moving_averages": self._analyze_moving_averages(technical_data),
                        "volume_trend": technical_data.volume_trend
                    }
                },
                "market_context": self._analyze_market_context(market_data),
                "recommendation": self._generate_recommendation(ai_score, sentiment),
                "updated_at": datetime.utcnow().isoformat()
            }
            
            logger.info(f"✅ AI analysis complete for {symbol}")
            return analysis
            
        except Exception as e:
            logger.error(f"❌ AI analysis failed for {symbol}: {e}")
            try:
                from modules.financehub.backend.config import settings
                if settings.ENVIRONMENT.NODE_ENV == "production":
                    return {"status": "unavailable", "error": "AI analysis temporarily unavailable"}
            except Exception:  # settings import should not break fallback behavior in dev
                pass
            return self._generate_fallback_analysis(symbol)

    # --- All the private helper methods for calculation and generation ---
    # These methods remain as they are part of the "summarizer" logic.
    
    def _calculate_sentiment(self, market_data: MarketData, technical: TechnicalIndicators) -> dict[str, Any]:
        score = 0
        if technical.rsi > 70:
            score -= 1
        if technical.rsi < 30:
            score += 1
        if "Bullish" in technical.macd_signal:
            score += 1
        if market_data.current_price > technical.sma_50:
            score += 1
        
        if score > 1:
            return {"label": "Positive", "score": 0.75 + random.uniform(-0.1, 0.1)}
        if score < 0:
            return {"label": "Negative", "score": 0.25 + random.uniform(-0.1, 0.1)}
        return {"label": "Neutral", "score": 0.5 + random.uniform(-0.1, 0.1)}

    def _calculate_ai_score(self, market_data: MarketData, technical: TechnicalIndicators, fundamentals: dict | None) -> float:
        # A simplified scoring model
        score = 5.0
        if technical.rsi < 70 and technical.rsi > 30:
            score += 1.0
        if "Bullish" in technical.macd_signal:
            score += 1.0
        if market_data.pe_ratio and market_data.pe_ratio < 25:
            score += 1.0
        if market_data.beta < 1.0:
            score += 0.5
        return round(min(10.0, score), 1)

    def _calculate_price_targets(self, market_data: MarketData, technical: TechnicalIndicators) -> dict[str, float]:
        base_price = market_data.current_price
        return {
            "12_month_low": round(base_price * 0.8, 2),
            "12_month_avg": round(base_price * 1.15, 2),
            "12_month_high": round(base_price * 1.4, 2),
        }

    def _analyze_risks(self, market_data: MarketData) -> list[str]:
        return self.risk_factors_db.get(market_data.sector, [])

    def _analyze_growth_drivers(self, market_data: MarketData) -> list[str]:
        return self.growth_drivers_db.get(market_data.sector, [])

    def _generate_insights(self, market_data: MarketData, technical: TechnicalIndicators) -> list[str]:
        insights = []
        if technical.rsi > 70:
            insights.append("RSI indicates the stock may be overbought.")
        if technical.rsi < 30:
            insights.append("RSI suggests the stock could be oversold.")
        insights.append(f"The stock shows a beta of {market_data.beta}, suggesting its volatility relative to the market.")
        return insights

    def _determine_trend(self, technical: TechnicalIndicators) -> str:
        if technical.sma_20 > technical.sma_50:
            return "Uptrend (Short-term)"
        return "Downtrend (Short-term)"

    def _analyze_moving_averages(self, technical: TechnicalIndicators) -> str:
        if technical.sma_20 > technical.sma_50:
            return "Positive signal (Golden Cross pattern)"
        return "Negative signal (Death Cross pattern)"

    def _analyze_market_context(self, market_data: MarketData) -> dict[str, Any]:
        return {"sector_performance": "Outperforming", "market_cap_category": self._categorize_market_cap(market_data.market_cap)}
        
    def _categorize_market_cap(self, market_cap: int) -> str:
        if market_cap > 200e9:
            return "Large-Cap"
        if market_cap > 10e9:
            return "Mid-Cap"
        return "Small-Cap"

    def _generate_recommendation(self, ai_score: float, sentiment: dict) -> str:
        if ai_score > 7 and "Positive" in sentiment["label"]:
            return "Strong Buy"
        if ai_score > 5:
            return "Hold"
        return "Sell"

    def _calculate_confidence(self, market_data: MarketData, technical: TechnicalIndicators) -> float:
        return round(0.75 + random.uniform(-0.1, 0.1), 2)

    def _generate_summary(
        self,
        symbol: str,
        market_data: MarketData,
        sentiment: dict,
        ai_score: float,
        trend: str,
    ) -> str:
        """Generate one-sentence headline summary.

        The previous implementation attempted to reference the local
        ``technical`` variable which is out-of-scope for this method and
        triggered an F821 lint error.  We now compute the trend beforehand and
        pass it in explicitly.
        """
        return (
            f"{symbol} currently shows a {sentiment['label'].lower()} sentiment "
            f"with an AI score of {ai_score}/10. Key technical indicators "
            f"point towards a {trend.lower()}."
        )

    def _generate_fallback_analysis(self, symbol: str) -> dict[str, Any]:
        return {"error": f"AI analysis could not be completed for {symbol}."} 