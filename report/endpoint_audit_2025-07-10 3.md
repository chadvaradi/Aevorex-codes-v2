# Endpoint Audit Report – 2025-07-10

| Status | Count |
|---|---|
| duplicate | 4 |
| placeholder | 22 |
| unknown | 11 |

## Details
* `GET /` – duplicate (modules/financehub/backend/api/endpoints/macro/bubor.py, LOC 85)
* `GET /components/` – duplicate (modules/financehub/backend/api/endpoints/macro/ecb/bop.py, LOC 74)
* `GET /health/` – duplicate (modules/financehub/backend/api/endpoints/macro/ecb/sts.py, LOC 47)
* `GET /{ticker}/` – duplicate (modules/financehub/backend/api/endpoints/stock_endpoints/stock_header/stock_header.py, LOC 69)
* `GET /alt/` – placeholder (modules/financehub/backend/api/endpoints/macro/ecb/sec.py, LOC 101)
* `GET /callback/` – placeholder (modules/financehub/backend/api/endpoints/auth.py, LOC 167)
* `GET /cbd-placeholder/` – placeholder (modules/financehub/backend/api/endpoints/macro/ecb/__init__.py, LOC 77)
* `GET /curve/{source}/legacy/` – placeholder (modules/financehub/backend/api/endpoints/macro/rates.py, LOC 176)
* `POST /finance/` – placeholder (modules/financehub/backend/api/endpoints/stock_endpoints/chat/router.py, LOC 191)
* `GET /google/authorize/` – placeholder (modules/financehub/backend/api/endpoints/auth.py, LOC 167)
* `GET /indicators/` – placeholder (modules/financehub/backend/api/endpoints/macro/ecb/sts.py, LOC 47)
* `GET /ivf-placeholder/` – placeholder (modules/financehub/backend/api/endpoints/macro/ecb/__init__.py, LOC 77)
* `GET /latest/` – placeholder (modules/financehub/backend/api/endpoints/macro/ecb/sts.py, LOC 47)
* `GET /login/` – placeholder (modules/financehub/backend/api/endpoints/auth.py, LOC 167)
* `GET /pairs/` – placeholder (modules/financehub/backend/api/endpoints/macro/forex.py, LOC 152)
* `GET /rates/all/` – placeholder (modules/financehub/backend/api/endpoints/macro/rates.py, LOC 176)
* `POST /refresh-token/` – placeholder (modules/financehub/backend/api/endpoints/auth.py, LOC 167)
* `GET /search/` – placeholder (modules/financehub/backend/api/endpoints/stock_endpoints/search/search_stock.py, LOC 129)
* `GET /sec-placeholder/` – placeholder (modules/financehub/backend/api/endpoints/macro/ecb/__init__.py, LOC 77)
* `GET /status/` – placeholder (modules/financehub/backend/api/endpoints/auth.py, LOC 167)
* `GET /{pair}/` – placeholder (modules/financehub/backend/api/endpoints/macro/forex.py, LOC 152)
* `POST /{ticker}/` – placeholder (modules/financehub/backend/api/endpoints/stock_endpoints/chat/router.py, LOC 191)
* `GET /{ticker}/chart/` – placeholder (modules/financehub/backend/api/endpoints/stock_endpoints/chart/chart_data.py, LOC 297)
* `POST /{ticker}/deep/` – placeholder (modules/financehub/backend/api/endpoints/stock_endpoints/chat/router.py, LOC 191)
* `GET /{ticker}/stream/` – placeholder (modules/financehub/backend/api/endpoints/stock_endpoints/chat/router.py, LOC 191)
* `POST /{ticker}/stream/` – placeholder (modules/financehub/backend/api/endpoints/stock_endpoints/chat/router.py, LOC 191)
* `GET ,
    summary=/` – unknown (modules/financehub/backend/api/endpoints/macro/bubor.py, LOC 85)
* `GET /item/` – unknown (modules/financehub/backend/api/endpoints/stock_endpoints/ticker_tape/ticker_tape.py, LOC 334)
* `GET /quote/{ticker}/` – unknown (modules/financehub/backend/api/endpoints/stock_endpoints/premium/technical_analysis/technical_analysis_stock.py, LOC 167)
* `GET /symbols/` – unknown (modules/financehub/backend/api/endpoints/crypto/crypto.py, LOC 158)
* `GET /test/` – unknown (modules/financehub/backend/api/endpoints/stock_endpoints/ticker_tape/ticker_tape.py, LOC 334)
* `GET /{symbol}/` – unknown (modules/financehub/backend/api/endpoints/crypto/crypto.py, LOC 158)
* `GET /{ticker}/full/` – unknown (modules/financehub/backend/api/endpoints/stock_endpoints/premium/technical_analysis/technical_analysis_stock.py, LOC 167)
* `GET /{ticker}/fundamentals/` – unknown (modules/financehub/backend/api/endpoints/stock_endpoints/fundamentals/fundamentals_stock.py, LOC 130)
* `GET /{ticker}/header/` – unknown (modules/financehub/backend/api/endpoints/stock_endpoints/stock_header/stock_header.py, LOC 69)
* `GET /{ticker}/news/` – unknown (modules/financehub/backend/api/endpoints/stock_endpoints/news/news_stock.py, LOC 175)
* `GET /{ticker}/summary/` – unknown (modules/financehub/backend/api/endpoints/stock_endpoints/premium/ai_summary/router.py, LOC 41)

### Duplicates detected
* `GET /` in modules/financehub/backend/api/endpoints/ai/models.py
* `GET /` in modules/financehub/backend/api/endpoints/macro/ecb/icp.py
* `GET /` in modules/financehub/backend/api/endpoints/macro/ecb/sts.py
* `GET /` in modules/financehub/backend/api/endpoints/macro/ecb/trd.py
* `GET /` in modules/financehub/backend/api/endpoints/macro/ecb/ivf.py
* `GET /` in modules/financehub/backend/api/endpoints/macro/ecb/ciss.py
* `GET /` in modules/financehub/backend/api/endpoints/macro/ecb/bsi.py
* `GET /` in modules/financehub/backend/api/endpoints/macro/ecb/cpp.py
* `GET /` in modules/financehub/backend/api/endpoints/macro/ecb/bls.py
* `GET /` in modules/financehub/backend/api/endpoints/macro/ecb/bop.py
* `GET /health/` in modules/financehub/backend/api/endpoints/macro/ecb/bop.py
* `GET /` in modules/financehub/backend/api/endpoints/macro/ecb/spf.py
* `GET /` in modules/financehub/backend/api/endpoints/macro/ecb/mir.py
* `GET /` in modules/financehub/backend/api/endpoints/macro/ecb/sec.py
* `GET /components/` in modules/financehub/backend/api/endpoints/macro/ecb/sec.py
* `GET /health/` in modules/financehub/backend/api/endpoints/macro/ecb/sec.py
* `GET /` in modules/financehub/backend/api/endpoints/macro/ecb/estr.py
* `GET /` in modules/financehub/backend/api/endpoints/macro/ecb/cbd.py
* `GET /` in modules/financehub/backend/api/endpoints/macro/ecb/irs.py
* `GET /` in modules/financehub/backend/api/endpoints/macro/ecb/pss.py
* `GET /` in modules/financehub/backend/api/endpoints/macro/ecb/rpp.py
* `GET /` in modules/financehub/backend/api/endpoints/stock_endpoints/ticker_tape/ticker_tape.py
* `GET /{ticker}/` in modules/financehub/backend/api/endpoints/stock_endpoints/premium/technical_analysis/technical_analysis_stock.py
