
## [2025-07-10] Minor cleanup – deprecated endpoint hiding

### Removed / Hidden
* /api/v1/macro/rates/all – set `include_in_schema=False`, will delete in next major.
* /api/v1/macro/curve/{source}/legacy – hidden.
* /api/v1/macro/ecb/sec/alt – hidden.
* /api/v1/stock/chat/finance – hidden.
* /api/v1/stock/{ticker}/summary and /technical alias routes – hidden.
* Premium technical-analysis snapshot endpoint – hidden.
* Legacy Google OAuth path – already hidden.

No functional change for canonical endpoints. Frontend unaffected. 