# Refactoring Plan: `core/mappers/shared/shared_mappers.py`

**Date:** 2025-07-07
**Author:** ULTRATHINK Agent
**Status:** Proposed

## 1. Problem
The file `modules/financehub/backend/core/mappers/shared/shared_mappers.py` is currently **313 lines long**, exceeding the project's 160-line limit. It contains orchestration logic for mapping news data from multiple sources (yfinance, fmp, marketaux, etc.), making it complex and hard to maintain.

## 2. Proposed Solution
The goal is to refactor this monolithic file into a more modular, source-oriented structure. The primary logic for news mapping will be moved into a dedicated `mappers/news/` directory.

### Step 1: Create New Directory Structure
Create the following new directory:
```
modules/financehub/backend/core/mappers/news/
├── __init__.py
└── orchestrator.py
```

### Step 2: Relocate and Refactor `map_standard_dicts_to_newsitems`
- **Move** the `map_standard_dicts_to_newsitems` function from `shared_mappers.py` to the new `mappers/news/orchestrator.py`.
- This function is source-agnostic and responsible for the final conversion to Pydantic models, making it a perfect fit for the orchestrator.

### Step 3: Relocate and Refactor `map_raw_news_to_standard_dicts`
- **Move** the `map_raw_news_to_standard_dicts` function to `mappers/news/orchestrator.py` as well.
- **Modify** this function to dynamically discover and load individual news mappers instead of using the hardcoded `_INTERNAL_MAPPERS` dictionary.

### Step 4: Create Source-Specific News Mappers
For each data source currently in `_INTERNAL_MAPPERS`, create a dedicated mapper file within the source's own directory.

**Example for MarketAux:**
- **Create file:** `modules/financehub/backend/core/mappers/marketaux/marketaux_news_mapper.py`
- **Move logic:** Move the `_map_marketaux_item_to_standard` function from `marketaux.py` into this new file.
- **Standardize:** Ensure each `*_news_mapper.py` exposes a consistent function, e.g., `map_to_standard(item: dict) -> StandardNewsDict | None`.

**Files to create:**
- `mappers/yfinance/yfinance_news_mapper.py`
- `mappers/marketaux/marketaux_news_mapper.py`
- `mappers/fmp/fmp_news_mapper.py`
- `mappers/newsapi/newsapi_news_mapper.py`
- `mappers/alphavantage/alphavantage_news_mapper.py`

### Step 5: Cleanup
- Once all logic has been moved, the original `shared_mappers.py` can be significantly simplified or removed entirely if it no longer serves a purpose.

## 3. Benefits
- **Adherence to LOC limit:** All new files will be well under the 160-line limit.
- **Improved Maintainability:** Adding a new news source will only require creating a new `*_news_mapper.py` file, without touching the central orchestrator.
- **Clear Separation of Concerns:** The orchestration logic (what to do) will be separate from the mapping logic (how to do it for a specific source). 