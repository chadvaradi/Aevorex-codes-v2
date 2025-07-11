# ECB Macro Hooks

All hooks interfacing with European Central Bank (ECB) endpoints live here. They share common conventions:

* Use `createECBDataHook` for single-endpoint wrappers to reduce boilerplate.
* Avoid coupling: hooks expose raw data & small helpers; formatting belongs in UI.
* Must stay ≤100 LOC (Rule #008) and be unit-tested.

Example:
```ts
import { useECBYieldCurve } from '@shared/hooks/macro/ecb';
``` 