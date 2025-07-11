"""
Pydantic models for Macroeconomic data endpoints.
"""
from pydantic import BaseModel, Field
from typing import Dict, Any

class ForexSnapshot(BaseModel):
    """Represents a snapshot of a forex pair rate."""
    pair: str = Field(..., description="The forex pair symbol.", example="EURUSD")
    rate: float = Field(..., description="The current exchange rate.", example=1.0855)
    timestamp: str = Field(..., description="The timestamp of the data.", example="2023-10-27T10:00:00Z")

class ForexPairsResponse(BaseModel):
    """Response model for available forex pairs."""
    pairs: Dict[str, Any] = Field(..., description="Dictionary of available forex pairs and their details.") 