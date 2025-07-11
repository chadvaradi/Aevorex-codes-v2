import logging
from datetime import date as Date
from typing import Optional, Any, List, Dict
from pydantic import (
    BaseModel, Field, field_validator, ConfigDict,
    StrictFloat, StrictInt, StrictStr,
    ValidationInfo
)
from ...utils.helpers import parse_optional_float, parse_optional_int, _validate_date_string
from .common import TickerSentiment

# --- Logger ---
logger = logging.getLogger("aevorex_finbot.models.stock_fundamentals")

class StockSplitData(BaseModel):
    """Contains stock split data."""
    execution_date: Date = Field(..., alias='executionDate')
    from_factor: float = Field(..., alias='fromFactor')
    to_factor: float = Field(..., alias='toFactor')

class DividendData(BaseModel):
    """Contains dividend data."""
    ex_date: Date = Field(..., alias='exDate')
    payment_date: Date = Field(..., alias='paymentDate')
    record_date: Date = Field(..., alias='recordDate')
    value: float = Field(..., alias='value')
    currency: str = Field(..., alias='currency')

class RatingPoint(BaseModel):
    model_config = ConfigDict(populate_by_name=True, extra='ignore', validate_assignment=True)
    symbol: StrictStr = Field(..., description="Részvény szimbólum (nagybetűsítve).")
    date: Date = Field(..., description="Az értékelés dátuma.")
    rating_score: Optional[StrictInt] = Field(None, alias="ratingScore", ge=1, le=5)
    rating_recommendation: Optional[StrictStr] = Field(None, alias="ratingRecommendation")

    @field_validator('symbol', mode='before')
    @classmethod
    def validate_and_normalize_symbol(cls, v: Any) -> str:
        return TickerSentiment.validate_and_normalize_ticker(v)

    @field_validator('date', mode='before')
    @classmethod
    def validate_generic_date(cls, v: Any, info: ValidationInfo) -> Date:
        date_obj = _validate_date_string(v, f"{cls.__name__}.{info.field_name}")
        if date_obj is None:
            raise ValueError(f"Required date field '{info.field_name}' cannot be None.")
        return date_obj

class CompanyOverview(BaseModel):
    model_config = ConfigDict(extra='ignore', validate_assignment=True, populate_by_name=True)
    symbol: StrictStr
    asset_type: Optional[StrictStr] = Field(None, alias="AssetType")
    name: Optional[StrictStr] = Field(None, alias="Name")
    description: Optional[StrictStr] = Field(None, alias="Description")
    country: Optional[StrictStr] = Field(None, alias="Country")
    sector: Optional[StrictStr] = Field(None, alias="Sector")
    industry: Optional[StrictStr] = Field(None, alias="Industry")
    market_cap: Optional[StrictFloat] = Field(None, alias="MarketCapitalization")
    pe_ratio: Optional[StrictFloat] = Field(None, alias="PERatio")
    beta: Optional[StrictFloat] = Field(None, alias="Beta")
    shares_outstanding: Optional[StrictInt] = Field(None, alias="SharesOutstanding")

    @field_validator('market_cap', 'pe_ratio', 'beta', mode='before')
    @classmethod
    def parse_float(cls, v: Any) -> Optional[float]:
        return parse_optional_float(v)

    @field_validator('shares_outstanding', mode='before')
    @classmethod
    def parse_int(cls, v: Any) -> Optional[int]:
        return parse_optional_int(v)

class FinancialsData(BaseModel):
    model_config = ConfigDict(extra='ignore')
    annual_reports: Optional[List[Dict[str, Any]]] = Field(None, alias="annualReports")
    quarterly_reports: Optional[List[Dict[str, Any]]] = Field(None, alias="quarterlyReports")
    # New optional pandas DataFrame-like dicts used by AI prompt generators
    balance_sheet: Optional[Any] = None  # type: ignore
    income_statement: Optional[Any] = None  # type: ignore
    cash_flow: Optional[Any] = None  # type: ignore

class EarningsPeriodData(BaseModel):
    model_config = ConfigDict(extra='ignore', populate_by_name=True)
    date: Optional[Date] = Field(None, description="A periódus záródátuma.")
    eps_actual: Optional[StrictFloat] = Field(None, alias="epsActual")
    eps_estimate: Optional[StrictFloat] = Field(None, alias="epsEstimate")
    revenue_actual: Optional[StrictInt] = Field(None, alias="revenueActual")
    revenue_estimate: Optional[StrictInt] = Field(None, alias="revenueEstimate")

    @field_validator('date', mode='before')
    @classmethod
    def validate_date(cls, v: Any) -> Optional[Date]:
        if v:
            return _validate_date_string(v, "EarningsPeriodData.date")
        return None

    @field_validator('eps_actual', 'eps_estimate', mode='before')
    @classmethod
    def parse_float(cls, v: Any) -> Optional[float]:
        return parse_optional_float(v)

    @field_validator('revenue_actual', 'revenue_estimate', mode='before')
    @classmethod
    def parse_int(cls, v: Any) -> Optional[int]:
        return parse_optional_int(v)

class EarningsData(BaseModel):
    model_config = ConfigDict(extra='ignore')
    annual_earnings: Optional[List[EarningsPeriodData]] = Field(None, alias="annualEarnings")
    quarterly_earnings: Optional[List[EarningsPeriodData]] = Field(None, alias="quarterlyEarnings") 
    history: Optional[List[EarningsPeriodData]] = None 