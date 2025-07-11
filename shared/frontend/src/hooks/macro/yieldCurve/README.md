# Yield Curve Hooks

Hooks dedicated to fetching and transforming yield-curve data (UST, ECB and historical variants).

Responsibilities:
1. Provide strongly-typed SWR wrappers around backend yield-curve endpoints.
2. Normalise differing backend payloads into a consistent shape for chart components.
3. Stay ≤100 LOC per hook & include unit tests before merge (Rule #008).

Usage example:
```ts
import { useUSTYieldCurve } from '@shared/hooks/macro/yieldCurve';
``` 