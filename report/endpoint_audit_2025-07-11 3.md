# Endpoint Audit Report – 2025-07-11

| Status | Count |
|---|---|
| duplicate | 4 |
| unknown | 24 |

## Details
* `GET /` – duplicate (modules/financehub/backend/api/endpoints/macro/bubor.py, LOC 88)
* `GET /components/` – duplicate (modules/financehub/backend/api/endpoints/macro/ecb/bop.py, LOC 74)
* `GET /health/` – duplicate (modules/financehub/backend/api/endpoints/macro/ecb/sts.py, LOC 47)
* `GET /{ticker}/` – duplicate (modules/financehub/backend/api/endpoints/stock_endpoints/esg/esg_router.py, LOC 92)
* `GET , summary=/` – unknown (modules/financehub/backend/api/endpoints/macro/bubor.py, LOC 88)
* `GET /callback/` – unknown (modules/financehub/backend/api/endpoints/auth.py, LOC 158)
* `POST /finance/` – unknown (modules/financehub/backend/api/endpoints/stock_endpoints/chat/router.py, LOC 141)
* `GET /indicators/` – unknown (modules/financehub/backend/api/endpoints/macro/ecb/sts.py, LOC 47)
* `GET /item/` – unknown (modules/financehub/backend/api/endpoints/stock_endpoints/ticker_tape/ticker_tape.py, LOC 328)
* `GET /latest/` – unknown (modules/financehub/backend/api/endpoints/macro/ecb/sts.py, LOC 47)
* `GET /login/` – unknown (modules/financehub/backend/api/endpoints/auth.py, LOC 158)
* `GET /pairs/` – unknown (modules/financehub/backend/api/endpoints/macro/forex.py, LOC 152)
* `GET /quote/{ticker}/` – unknown (modules/financehub/backend/api/endpoints/stock_endpoints/premium/technical_analysis/technical_analysis_stock.py, LOC 171)
* `POST /refresh-token/` – unknown (modules/financehub/backend/api/endpoints/auth.py, LOC 158)
* `GET /search/` – unknown (modules/financehub/backend/api/endpoints/stock_endpoints/search/search_stock.py, LOC 129)
* `GET /status/` – unknown (modules/financehub/backend/api/endpoints/auth.py, LOC 158)
* `GET /symbols/` – unknown (modules/financehub/backend/api/endpoints/crypto/crypto.py, LOC 177)
* `GET /test/` – unknown (modules/financehub/backend/api/endpoints/stock_endpoints/ticker_tape/ticker_tape.py, LOC 328)
* `GET /{pair}/` – unknown (modules/financehub/backend/api/endpoints/macro/forex.py, LOC 152)
* `GET /{symbol}/` – unknown (modules/financehub/backend/api/endpoints/crypto/crypto.py, LOC 177)
* `POST /{ticker}/` – unknown (modules/financehub/backend/api/endpoints/stock_endpoints/chat/router.py, LOC 141)
* `GET /{ticker}/chart/` – unknown (modules/financehub/backend/api/endpoints/stock_endpoints/chart/chart_data.py, LOC 168)
* `POST /{ticker}/deep/` – unknown (modules/financehub/backend/api/endpoints/stock_endpoints/chat/router.py, LOC 141)
* `GET /{ticker}/full/` – unknown (modules/financehub/backend/api/endpoints/stock_endpoints/premium/technical_analysis/technical_analysis_stock.py, LOC 171)
* `GET /{ticker}/fundamentals/` – unknown (modules/financehub/backend/api/endpoints/stock_endpoints/fundamentals/fundamentals_stock.py, LOC 130)
* `GET /{ticker}/news/` – unknown (modules/financehub/backend/api/endpoints/stock_endpoints/news/news_stock.py, LOC 174)
* `GET /{ticker}/stream/` – unknown (modules/financehub/backend/api/endpoints/stock_endpoints/chat/router.py, LOC 141)
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
