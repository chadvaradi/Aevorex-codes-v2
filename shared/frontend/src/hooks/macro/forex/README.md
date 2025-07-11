# Forex Hooks

This directory houses all React hooks related to foreign exchange (FX) data retrieval within the FinanceHub macro domain.

## Responsibilities

* Fetch live FX rates, historical OHLC data, and available currency pairs from the backend macro-forex API namespace.
* Provide strongly-typed, cache-aware SWR wrappers to the UI layer.
* Export a consistent barrel (`index.ts`) so consumers can `import { useForexPair } from '@shared/hooks/macro/forex';`.

All hooks must remain:
1. Single-responsibility – one hook ↔ one API endpoint.
2. ≤ 100 LOC (Rule #008 limit margin).
3. Covered by unit tests under `shared/frontend/tests` before merge. 