from __future__ import annotations
import logging

logger = logging.getLogger(__name__)

POSITIVE_KEYWORDS = ["bővül", "felülmúlja", "rekord", "nyereség", "optimista", "növekedés"]
NEGATIVE_KEYWORDS = ["csökken", "veszteség", "borúlátó", "gyenge", "kockázat", "csalódás"]

class SentimentAnalyzer:
    def analyze(self, news_data: list[dict[str, str]]) -> str:
        """Analyzes sentiment from a list of news headlines."""
        if not news_data:
            return "Semleges (nincs hír)"

        score = 0.0
        for item in news_data:
            headline = item.get("title", "").lower()
            for p_word in POSITIVE_KEYWORDS:
                if p_word in headline:
                    score += 1
            for n_word in NEGATIVE_KEYWORDS:
                if n_word in headline:
                    score -= 1
        
        if score > 0:
            return "Pozitív"
        if score < 0:
            return "Negatív"
        return "Semleges"

    def analyze_text(self, text: str) -> float:
        """Analyzes sentiment from a single text."""
        if not text:
            return 0.0

        score = 0.0
        # Dummy implementation, needs a real model
        if "good" in text or "great" in text:
            score = 0.8
        return score 