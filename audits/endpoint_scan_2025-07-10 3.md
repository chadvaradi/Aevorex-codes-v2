# Endpoint Scan Report – 2025-07-10

## Overall Summary
Total endpoints scanned: **55**  
Successful (200 & non-empty): **48**  
Failed / incomplete: **7**

### Status Code Distribution
| Status | Count |
|--------|-------|
| 200 | 53 |
| EXCEPTION | 1 |
| 204 | 1 |

## Failure Details
| # | Method | URL | Status | Empty | Notes |
|---|---|---|---|---|---|
| 1 | GET | /api/v1/macro/curve/ecb | 200 | True |  |
| 2 | POST | /api/v1/stock/chat/AAPL/deep | EXCEPTION | None | unhandled errors in a TaskGroup (1 sub-e |
| 3 | POST | /api/v1/config/model | 200 | True |  |
| 4 | POST | /api/v1/config/deep | 200 | True |  |
| 5 | POST | /api/v1/config/language | 200 | True |  |
| 6 | GET | /api/v1/auth/status | 200 | True |  |
| 7 | POST | /api/v1/auth/logout | 204 | True |  |

---
Generated automatically by ultrathink scan.
