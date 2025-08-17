"""
ECB SDMX Client Configuration
============================

Configuration constants and series definitions for ECB data fetching.
"""

import logging
from typing import Dict, List, Tuple

logger = logging.getLogger(__name__)

# ECB SDMX Dataflows
ECB_DATAFLOWS = {
    "POLICY": "FM",      # Financial Markets
    "YIELD": "YC",       # Yield Curves
    "FX": "EXR",         # Exchange Rates
    "MONETARY": "BSI",   # Balance Sheet Items (Monetary Aggregates)
    "INFLATION": "ICP",  # Index of Consumer Prices (HICP)
    "EMPLOYMENT": "STS", # Short-term Statistics (Employment)
    "GDP": "STS",        # Short-term Statistics (GDP)
    "BUSINESS": "STS",   # Short-term Statistics (Business indicators)
    "MIR": "MIR",        # Monetary and Financial Institutions Interest Rates
    "BOP": "BOP",        # Balance of Payments
    "STS": "STS",        # Short-term Statistics (full coverage)
    "SEC": "SEC",        # Securities Issues Statistics
    "IVF": "IVF",        # Investment Funds
    "CBD": "CBD",        # Consolidated Banking Data
    "RPP": "RPP",        # Residential Property Prices
    "CPP": "CPP",        # Commercial Property Prices
    "BLS": "BLS",        # Bank Lending Survey
    "SPF": "SPF",        # Survey of Professional Forecasters
    "CISS": "CISS",      # Composite Indicator of Systemic Stress
    "TRD": "TRD",        # External Trade
    "PSS": "PSS",        # Payment Systems Statistics
    "IRS": "IRS",        # Interest Rate Statistics
    "EST": "EST",        # Euro Short-Term Rate
}

# Legacy constant mappings for backward compatibility
ECB_POLICY_DATAFLOW = ECB_DATAFLOWS["POLICY"]
ECB_YIELD_DATAFLOW = ECB_DATAFLOWS["YIELD"]
ECB_FX_DATAFLOW = ECB_DATAFLOWS["FX"]
ECB_MONETARY_DATAFLOW = ECB_DATAFLOWS["MONETARY"]
ECB_INFLATION_DATAFLOW = ECB_DATAFLOWS["INFLATION"]
ECB_EMPLOYMENT_DATAFLOW = ECB_DATAFLOWS["EMPLOYMENT"]
ECB_GDP_DATAFLOW = ECB_DATAFLOWS["GDP"]
ECB_BUSINESS_DATAFLOW = ECB_DATAFLOWS["BUSINESS"]
ECB_MIR_DATAFLOW = ECB_DATAFLOWS["MIR"]
ECB_BOP_DATAFLOW = ECB_DATAFLOWS["BOP"]
ECB_STS_DATAFLOW = ECB_DATAFLOWS["STS"]

# Policy Rates Series Keys
KEY_ECB_POLICY_RATES = "B.I8.EUR.4F.KR.MRR_FR.LEV+B.I8.EUR.4F.KR.DFR.LEV+B.I8.EUR.4F.KR.MLFR.LEV"
KEY_ECB_POLICY_RATES_DAILY = "D.I8.EUR.4F.KR.MRR_FR.LEV+D.I8.EUR.4F.KR.DFR.LEV+D.I8.EUR.4F.KR.MLFR.LEV"

INDIVIDUAL_POLICY_SERIES = [
    "D.EZB.MRO.LEV",   # Main Refinancing Operations Rate
    "D.EZB.DFR.LEV",   # Deposit Facility Rate  
    "D.EZB.MSF.LEV"    # Marginal Lending Facility Rate (Marginal Standing Facility)
]

# Yield Curve Series Keys
# Fixed: correct ECB YC dataflow syntax - each maturity as separate series
# Use new multi-series fetch approach instead of concatenated keys
KEY_ECB_YIELD_CURVE_MATURITIES = {
    # Short tenors (kept for completeness, not rendered in UI table)
    "1M": "B.U2.EUR.4F.G_N_A.SV_C_YM.SR_1M",
    "3M": "B.U2.EUR.4F.G_N_A.SV_C_YM.SR_3M", 
    "6M": "B.U2.EUR.4F.G_N_A.SV_C_YM.SR_6M",
    # UI-required core maturities
    "1Y": "B.U2.EUR.4F.G_N_A.SV_C_YM.SR_1Y",
    "2Y": "B.U2.EUR.4F.G_N_A.SV_C_YM.SR_2Y",
    "5Y": "B.U2.EUR.4F.G_N_A.SV_C_YM.SR_5Y",
    "10Y": "B.U2.EUR.4F.G_N_A.SV_C_YM.SR_10Y",
    "30Y": "B.U2.EUR.4F.G_N_A.SV_C_YM.SR_30Y",
}

# Complete fixing rates maturities for comprehensive data
KEY_ECB_FIXING_RATES_MATURITIES = {
    "1W": "B.U2.EUR.4F.G_N_A.SV_C_YM.SR_1W",  # Weekly (if available)
    "1M": "B.U2.EUR.4F.G_N_A.SV_C_YM.SR_1M",
    "3M": "B.U2.EUR.4F.G_N_A.SV_C_YM.SR_3M", 
    "6M": "B.U2.EUR.4F.G_N_A.SV_C_YM.SR_6M",
    "12M": "B.U2.EUR.4F.G_N_A.SV_C_YM.SR_1Y"  # 12M = 1Y
}

# Legacy key for backward compatibility (deprecated)
KEY_ECB_YIELD_CURVE = "B.I8.EUR.4F.G_N_A.SV_C_YM.A.SR_1Y+SR_2Y+SR_3Y+SR_5Y+SR_10Y"

# Retail Interest Rates (MIR dataflow)
KEY_ECB_RETAIL_DEPOSIT_AVG = "B.U2.N.A.A.R.A.R.D.Q"  # Household overnight deposits
KEY_ECB_RETAIL_LENDING_AVG = "B.U2.N.A.A.R.A.R.L.Q"  # Household lending (loans)

# FX Rates Series Keys
# Combined daily spot reference rates against EUR for the four major currencies.
# Each currency must be prefixed with its own path segment – the previous
# shorthand (USD+GBP+JPY+CHF) fails on the ECB SDMX gateway and yields 422.
#
# Syntax: {freq}.{CURRENCY}.{BASE}.SP00.A  where BASE=EUR for EUR-based pairs.
# Concatenate with '+' according to SDMX query rules.
KEY_ECB_FX_RATES_MAJOR = (
    "D.USD.EUR.SP00.A+"
    "D.GBP.EUR.SP00.A+"
    "D.JPY.EUR.SP00.A+"
    "D.CHF.EUR.SP00.A"
)

# Monetary Aggregates Series Keys
KEY_ECB_MONETARY_M1 = "M.U2.Y.V.M10.X.1.U2.2300.Z01.E"
KEY_ECB_MONETARY_M2 = "M.U2.Y.V.M20.X.1.U2.2300.Z01.E"
KEY_ECB_MONETARY_M3 = "M.U2.Y.V.M30.X.1.U2.2300.Z01.E"

# Inflation Series Keys
KEY_ECB_HICP_OVERALL = "M.U2.N.000000.4.ANR"
KEY_ECB_HICP_CORE = "M.U2.N.XEF000.4.ANR"
KEY_ECB_HICP_ENERGY = "M.U2.N.0720.4.ANR"

# Employment Series Keys
KEY_ECB_UNEMPLOYMENT = "M.U2.S.UNEH.TOTAL.4.VAL"
KEY_ECB_EMPLOYMENT = "Q.U2.S.EMPL.TOTAL.4.VAL"

# GDP Series Keys
KEY_ECB_GDP_GROWTH = "Q.U2.Y.GDP.TOTAL.4.VAL"

# Business Confidence Series Keys
KEY_ECB_BUSINESS_CONF = "M.U2.S.BSCI.TOTAL.4.VAL"

# BOP (Balance of Payments) Series Keys
KEY_ECB_BOP_CURRENT_ACCOUNT = "Q.N.I8.W1.S1.S1.T.N.FA.F.F.T.EUR._T.T.N"
KEY_ECB_BOP_TRADE_BALANCE = "Q.N.I8.W1.S1.S1.T.N.FA.F.F1.T.EUR._T.T.N"
KEY_ECB_BOP_SERVICES_BALANCE = "Q.N.I8.W1.S1.S1.T.N.FA.F.F2.T.EUR._T.T.N"
KEY_ECB_BOP_INCOME_BALANCE = "Q.N.I8.W1.S1.S1.T.N.FA.F.F3.T.EUR._T.T.N"
KEY_ECB_BOP_CAPITAL_ACCOUNT = "Q.N.I8.W1.S1.S1.T.N.FA.F.F4.T.EUR._T.T.N"
KEY_ECB_BOP_DIRECT_INVESTMENT = "Q.N.I8.W1.S1.S1.T.N.FA.F.F5.T.EUR._T.T.N"
KEY_ECB_BOP_PORTFOLIO_INVESTMENT = "Q.N.I8.W1.S1.S1.T.N.FA.F.F6.T.EUR._T.T.N"
KEY_ECB_BOP_FINANCIAL_DERIVATIVES = "Q.N.I8.W1.S1.S1.T.N.FA.F.F7.T.EUR._T.T.N"

# STS (Short-term Statistics) Series Keys - UPDATED to I8 area code
# Fixed area code from EA to I8 (Euro area including Croatia) per ECB SDMX latest DSD
# Updated STS series (2023 DSD) – I8→U2 area code + final segments .A.V/.NSA
# Industrial production index (Non-seasonally adjusted)
KEY_ECB_STS_INDUSTRIAL_PRODUCTION = "M.U2.Y.PROD.NSO.NSA"
# Retail sales volume index (Non-seasonally adjusted)
KEY_ECB_STS_RETAIL_SALES = "M.U2.Y.RETS.NSO.NSA"
# Construction output index (Non-seasonally adjusted)
KEY_ECB_STS_CONSTRUCTION_OUTPUT = "M.U2.Y.CONS.NSO.NSA"
# Unemployment rate – Level (% of active population)
KEY_ECB_STS_UNEMPLOYMENT_RATE = "M.U2.S.UNEH.TOTAL.A.V"
# Employment index (Quarterly)
KEY_ECB_STS_EMPLOYMENT_RATE = "Q.U2.S.EMPL.TOTAL.A.V"
# Business confidence indicator (Monthly, balances, SA)
KEY_ECB_STS_BUSINESS_CONFIDENCE = "M.U2.S.BSCI.TOTAL.A.V"
# Consumer confidence indicator (Monthly, balances, SA)
KEY_ECB_STS_CONSUMER_CONFIDENCE = "M.U2.S.CSCI.TOTAL.A.V"
# Capacity utilisation (%) – Quarterly
KEY_ECB_STS_CAPACITY_UTILIZATION = "Q.U2.S.CAPU.TOTAL.A.V"

# MIR (Interest Rates) Series Keys
KEY_ECB_DEPOSIT_HOUSEHOLDS = "M.U2.B.A2A.A.R.A.2240.EUR.N"
KEY_ECB_DEPOSIT_HOUSEHOLDS_1Y = "M.U2.B.A2A.A.R.A.2250.EUR.N"
KEY_ECB_DEPOSIT_CORPORATIONS = "M.U2.B.A2B.A.R.A.2240.EUR.N"
KEY_ECB_LENDING_HOUSEHOLDS_HOUSING = "M.U2.B.A2A.A.R.L.2430.EUR.N"
KEY_ECB_LENDING_HOUSEHOLDS_CONSUMER = "M.U2.B.A2A.A.R.L.2440.EUR.N"
KEY_ECB_LENDING_CORPORATIONS = "M.U2.B.A2B.A.R.L.2250.EUR.N"
KEY_ECB_LENDING_CORPORATIONS_OVER1Y = "M.U2.B.A2B.A.R.L.2260.EUR.N"

# Securities (SEC) Series Keys (issuance volume, total)
KEY_ECB_SEC_DEBT_SECURITIES = "M.U2.N.DE.SEC.DEBT.TOTAL.N"  # placeholder
KEY_ECB_SEC_LISTED_SHARES = "M.U2.N.DE.SEC.SHARE.TOTAL.N"   # placeholder

# Investment Funds (IVF)
KEY_ECB_IVF_TOTAL_ASSETS = "M.U2.N.IVF.AUM.TOTAL.N"  # placeholder
KEY_ECB_IVF_NET_FLOWS = "M.U2.N.IVF.NETFLOW.TOTAL.N"  # placeholder

# Consolidated Banking Data (CBD)
KEY_ECB_CBD_TIER1_RATIO = "A.U2.N.CBD.TIER1.RATIO.N"  # placeholder
KEY_ECB_CBD_NPL_RATIO = "A.U2.N.CBD.NPL.RATIO.N"      # placeholder

# Residential Property Prices (RPP)
KEY_ECB_RPP_PRICE_INDEX = "Q.I8.RPP.PRICE.NSA"  # placeholder

# Commercial Property Prices (CPP)
KEY_ECB_CPP_PRICE_INDEX = "Q.I8.CPP.PRICE.NSA"  # placeholder

# Bank Lending Survey (BLS)
KEY_ECB_BLS_LENDING_CONDITIONS = "Q.U2.N.BLS.LENDINGCOND.TOTAL.N"  # placeholder
KEY_ECB_BLS_CREDIT_STANDARDS = "Q.I8.BLS.CS.HOUSEHOLDS"  # placeholder

# Survey of Professional Forecasters (SPF)
KEY_ECB_SPF_INFLATION_EXPECTATIONS = "Q.U2.N.SPF.INFLEXP.TOTAL.N"  # placeholder
KEY_ECB_SPF_GDP_FORECAST = "Q.I8.SPF.GDP.MEDIAN"  # placeholder

# Composite Indicator of Systemic Stress (CISS)
KEY_ECB_CISS_STRESS_INDEX = "D.I8.CISS.STRESS"  # placeholder

# External Trade (TRD)
KEY_ECB_TRD_EXPORTS = "M.U2.N.TRD.EXPORTS.TOTAL.N"  # placeholder
KEY_ECB_TRD_IMPORTS = "M.U2.N.TRD.IMPORTS.TOTAL.N"  # placeholder

# Payment Systems Statistics (PSS)
KEY_ECB_PSS_PAYMENTS_VOLUME = "A.U2.N.PSS.PAYVOL.TOTAL.N"  # placeholder

# Interest Rate Statistics (IRS)
KEY_ECB_IRS_SWAP_RATE_10Y = "D.U2.N.IRS.SWAP.10Y.N"  # placeholder

# Euro Short-Term Rate (EST)
KEY_ECB_ESTR_RATE = "B.EU000A2X2A25.WT"  # Correct ECB €STR dataflow key from EST dataset (Daily-businessweek.EuroShortTermRate.VolumeWeightedTrimmedMeanRate)

# ---------------------------------------------------------------------------
# Backwards-compatibility aliases (client.py expects these names)
# ---------------------------------------------------------------------------

# Average deposit & lending rates (household sector) – we alias them to the
# corresponding detailed series until the ECB publishes the official averaged
# aggregates again.

KEY_ECB_RETAIL_DEPOSIT_AVG = KEY_ECB_DEPOSIT_HOUSEHOLDS
KEY_ECB_RETAIL_LENDING_AVG = KEY_ECB_LENDING_HOUSEHOLDS_HOUSING

# Government Bond Yields Series Keys
KEY_GOVERNMENT_BONDS_DE = "B.DE.EUR.4F.G_N_A.SV_C_YM.SR_1Y+SR_2Y+SR_5Y+SR_10Y"
KEY_GOVERNMENT_BONDS_FR = "B.FR.EUR.4F.G_N_A.SV_C_YM.SR_1Y+SR_2Y+SR_5Y+SR_10Y"
KEY_GOVERNMENT_BONDS_IT = "B.IT.EUR.4F.G_N_A.SV_C_YM.SR_1Y+SR_2Y+SR_5Y+SR_10Y"
KEY_GOVERNMENT_BONDS_ES = "B.ES.EUR.4F.G_N_A.SV_C_YM.SR_1Y+SR_2Y+SR_5Y+SR_10Y"
KEY_GOVERNMENT_BONDS_NL = "B.NL.EUR.4F.G_N_A.SV_C_YM.SR_1Y+SR_2Y+SR_5Y+SR_10Y"

# Comprehensive ECB Series Configuration
COMPREHENSIVE_ECB_SERIES: Dict[str, List[Tuple[str, str]]] = {
    "monetary_aggregates": [
        ("M1", KEY_ECB_MONETARY_M1),
        ("M2", KEY_ECB_MONETARY_M2), 
        ("M3", KEY_ECB_MONETARY_M3)
    ],
    "inflation": [
        ("HICP_Overall", KEY_ECB_HICP_OVERALL),
        ("HICP_Core", KEY_ECB_HICP_CORE),
        ("HICP_Energy", KEY_ECB_HICP_ENERGY)
    ],
    "employment": [
        ("Unemployment_Rate", KEY_ECB_UNEMPLOYMENT),
        ("Employment_Rate", KEY_ECB_EMPLOYMENT)
    ],
    "growth": [
        ("GDP_Growth", KEY_ECB_GDP_GROWTH)
    ],
    "business": [
        ("Business_Confidence", KEY_ECB_BUSINESS_CONF)
    ],
    "retail_rates": [
        ("Deposit_Households_Overnight", KEY_ECB_DEPOSIT_HOUSEHOLDS),
        ("Deposit_Households_1Y", KEY_ECB_DEPOSIT_HOUSEHOLDS_1Y),
        ("Deposit_Corporations", KEY_ECB_DEPOSIT_CORPORATIONS),
        ("Lending_Housing", KEY_ECB_LENDING_HOUSEHOLDS_HOUSING),
        ("Lending_Consumer", KEY_ECB_LENDING_HOUSEHOLDS_CONSUMER),
        ("Lending_Corporations", KEY_ECB_LENDING_CORPORATIONS),
        ("Lending_Corporations_Over1Y", KEY_ECB_LENDING_CORPORATIONS_OVER1Y)
    ],
    "government_bonds": [
        ("Germany", KEY_GOVERNMENT_BONDS_DE),
        ("France", KEY_GOVERNMENT_BONDS_FR),
        ("Italy", KEY_GOVERNMENT_BONDS_IT),
        ("Spain", KEY_GOVERNMENT_BONDS_ES),
        ("Netherlands", KEY_GOVERNMENT_BONDS_NL)
    ],
    "balance_of_payments": [
        ("Current_Account", KEY_ECB_BOP_CURRENT_ACCOUNT),
        ("Trade_Balance", KEY_ECB_BOP_TRADE_BALANCE),
        ("Services_Balance", KEY_ECB_BOP_SERVICES_BALANCE),
        ("Income_Balance", KEY_ECB_BOP_INCOME_BALANCE),
        ("Capital_Account", KEY_ECB_BOP_CAPITAL_ACCOUNT),
        ("Direct_Investment", KEY_ECB_BOP_DIRECT_INVESTMENT),
        ("Portfolio_Investment", KEY_ECB_BOP_PORTFOLIO_INVESTMENT),
        ("Financial_Derivatives", KEY_ECB_BOP_FINANCIAL_DERIVATIVES)
    ],
    "short_term_statistics": [
        ("Industrial_Production", KEY_ECB_STS_INDUSTRIAL_PRODUCTION),
        ("Retail_Sales", KEY_ECB_STS_RETAIL_SALES),
        ("Construction_Output", KEY_ECB_STS_CONSTRUCTION_OUTPUT),
        ("Unemployment_Rate", KEY_ECB_STS_UNEMPLOYMENT_RATE),
        ("Employment_Rate", KEY_ECB_STS_EMPLOYMENT_RATE),
        ("Business_Confidence", KEY_ECB_STS_BUSINESS_CONFIDENCE),
        ("Consumer_Confidence", KEY_ECB_STS_CONSUMER_CONFIDENCE),
        ("Capacity_Utilization", KEY_ECB_STS_CAPACITY_UTILIZATION)
    ]
}

COMPREHENSIVE_ECB_SERIES.update(
    {
        "securities": [
            ("Debt_Securities", KEY_ECB_SEC_DEBT_SECURITIES),
            ("Listed_Shares", KEY_ECB_SEC_LISTED_SHARES),
        ],
        "investment_funds": [
            ("Total_Assets", KEY_ECB_IVF_TOTAL_ASSETS),
            ("Net_Flows", KEY_ECB_IVF_NET_FLOWS),
        ],
        "consolidated_banking": [
            ("Tier1_Ratio", KEY_ECB_CBD_TIER1_RATIO),
            ("NPL_Ratio", KEY_ECB_CBD_NPL_RATIO),
        ],
        "property_prices": [
            ("RPP_Price_Index", KEY_ECB_RPP_PRICE_INDEX),
            ("CPP_Price_Index", KEY_ECB_CPP_PRICE_INDEX),
        ],
        "bank_lending_survey": [
            ("Lending_Conditions", KEY_ECB_BLS_LENDING_CONDITIONS),
            ("Credit_Standards", KEY_ECB_BLS_CREDIT_STANDARDS),
        ],
        "survey_of_professional_forecasters": [
            ("Inflation_Expectations", KEY_ECB_SPF_INFLATION_EXPECTATIONS),
            ("GDP_Forecast", KEY_ECB_SPF_GDP_FORECAST),
        ],
        "composite_indicator_of_systemic_stress": [
            ("CISS_Index", KEY_ECB_CISS_STRESS_INDEX),
        ],
        "external_trade": [
            ("Exports", KEY_ECB_TRD_EXPORTS),
            ("Imports", KEY_ECB_TRD_IMPORTS),
        ],
        "payment_systems_statistics": [
            ("Payments_Volume", KEY_ECB_PSS_PAYMENTS_VOLUME),
        ],
        "interest_rate_statistics": [
            ("Swap_Rate_10Y", KEY_ECB_IRS_SWAP_RATE_10Y),
        ],
        "estr": [
            ("ESTR_Rate", KEY_ECB_ESTR_RATE),
        ],
    }
)

# HTTP Headers for ECB API requests
ECB_REQUEST_HEADERS = {
    "User-Agent": "Python/3.11 httpx/0.24.0 (ECB-SDMX-Client)",
    "Accept": "application/json, application/vnd.sdmx.data+json;version=1.0.0",
    "Accept-Language": "en-US,en;q=0.9",
    "Cache-Control": "no-cache",
    "Connection": "keep-alive",
}

# API Configuration
ECB_BASE_URL = "https://data-api.ecb.europa.eu/service/data"
ECB_TIMEOUT = 30
ECB_RETRY_ATTEMPTS = 3

def build_ecb_series_key(key_components: List[str]) -> str:
    """
    Constructs an SDMX series key from a list of dimension values.
    
    Args:
        key_components: List of dimension values
        
    Returns:
        SDMX series key string
        
    Example:
        ['D', 'USD', 'EUR', 'SP00', 'A'] -> 'D.USD.EUR.SP00.A'
    """
    return ".".join(key_components) 