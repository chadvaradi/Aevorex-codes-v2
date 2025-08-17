# FinanceHub – API ⇄ Frontend Endpoint Matrix (v24)
> Generated automatically by `generate_endpoint_matrix.py`

| Backend Endpoint | Method | Implemented in | Frontend Usage |
|------------------|--------|----------------|----------------|
| `/api/v1/auth/callback` | GET | `api/endpoints/auth.py` | ⚠️ NOT USED |
| `/api/v1/auth/login` | GET | `api/endpoints/auth.py` | ✅ USED |
| `/api/v1/auth/logout` | GET | `api/endpoints/auth.py` | ✅ USED |
| `/api/v1/auth/status` | GET | `api/endpoints/auth.py` | ✅ USED |
| `/api/v1/macro/all` | GET | `api/endpoints/macro/rates.py` | ⚠️ NOT USED |
| `/api/v1/macro/curve/{source}` | GET | `api/endpoints/macro/rates.py` | ⚠️ NOT USED |
| `/api/v1/macro/ecb/monetary-policy` | GET | `api/endpoints/macro/ecb.py` | ⚠️ NOT USED |
| `/api/v1/macro/ecb/rates` | GET | `api/endpoints/macro/ecb.py` | ⚠️ NOT USED |
| `/api/v1/macro/ecb/yield-curve` | GET | `api/endpoints/macro/ecb.py` | ⚠️ NOT USED |
| `/api/v1/macro/rates/all` | GET | `api/endpoints/macro/rates.py` | ✅ USED |
| `/api/v1/market/news` | GET | `api/market_data.py` | ⚠️ NOT USED |
| `/api/v1/metrics` | GET | `core/metrics/prometheus_exporter.py` | ⚠️ NOT USED |
| `/api/v1/models/models` | GET | `api/endpoints/ai/models.py` | ⚠️ NOT USED |
| `/api/v1/stock/ai-summary/{ticker}` | GET | `api/endpoints/stock_endpoints/premium/ai_summary/router.py` | ⚠️ NOT USED |
| `/api/v1/stock/chart/{ticker}` | GET | `api/endpoints/stock_endpoints/chart/chart_data.py` | ⚠️ NOT USED |
| `/api/v1/stock/chat/finance` | POST | `api/endpoints/stock_endpoints/chat/router.py` | ⚠️ NOT USED |
| `/api/v1/stock/chat/{ticker}` | POST | `api/endpoints/stock_endpoints/chat/router.py` | ⚠️ NOT USED |
| `/api/v1/stock/chat/{ticker}/deep` | POST | `api/endpoints/stock_endpoints/chat/router.py` | ⚠️ NOT USED |
| `/api/v1/stock/chat/{ticker}/stream` | POST | `api/endpoints/stock_endpoints/chat/router.py` | ✅ USED |
| `/api/v1/stock/fundamentals/{ticker}` | GET | `api/endpoints/stock_endpoints/fundamentals/fundamentals_stock.py` | ⚠️ NOT USED |
| `/api/v1/stock/header/stock-header/{ticker}` | GET | `api/endpoints/stock_endpoints/stock_header/stock_header.py` | ⚠️ NOT USED |
| `/api/v1/stock/header/{ticker}` | GET | `api/endpoints/stock_endpoints/stock_header/stock_header.py` | ⚠️ NOT USED |
| `/api/v1/stock/news/{ticker}` | GET | `api/endpoints/stock_endpoints/news/news_stock.py` | ⚠️ NOT USED |
| `/api/v1/stock/search` | GET | `api/endpoints/stock_endpoints/search/search_stock.py` | ⚠️ NOT USED |
| `/api/v1/stock/technical-analysis/{ticker}` | GET | `api/endpoints/stock_endpoints/premium/technical_analysis/technical_analysis_stock.py` | ⚠️ NOT USED |
| `/api/v1/stock/ticker-tape/` | GET | `api/endpoints/stock_endpoints/ticker_tape/ticker_tape.py` | ⚠️ NOT USED |

---
## Summary
- **Total Backend Endpoints:** 26
- **Endpoints Used by Frontend:** 5
- **Coverage:** 19.2%