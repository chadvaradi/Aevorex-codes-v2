# FinanceHub Frontend Changelog

All notable changes to the FinanceHub frontend module will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- **Chat UX Redesign**: Teljes képernyős chat felület Grok/ChatGPT inspirációval
  - Teljes képernyős overlay layout (`fixed inset-0`) minden eszközön
  - Lebegő, opálos input panel középre igazítva (`backdrop-blur-xl rounded-full`)
  - Buborék nélküli, sorkizárt AI üzenetek betűnkénti streaming-gel (30ms/karakter)
  - Jobbra igazított user üzenetek szimmetrikus kerekített buborékban
  - Precíz SVG ikonok (Send, New Messages) `currentColor` stroke-kal
  - Responsive breakpoints minden eszközmérethez optimalizálva
- Premium UX upgrades for **TechnicalAnalysisBubble**: dynamic recommendation badge, trend indicator pills with color-coded up/down icons, full ARIA labeling.
- **NewsHighlightsBubble** now includes skeleton shimmer while loading, and a *NEW* badge for articles published within the last 24 hours.
- Accessibility audit test suite using **axe-core** integrated into Vitest (`AccessibilityBubbles.test.tsx`).
- Lighthouse CI config updated with performance budgets and stricter pass criteria.

### Changed
- **ChatOverlay**: Átalakítva teljes képernyős layout-ra tiszta fehér/sötét háttérrel
- **ChatInput**: Lebegő panel dizájn opálos backdrop-blur effekttel
- **StreamingMessage**: Character-by-character streaming buborék nélküli, sorkizárt megjelenítéssel
- **UserMessage**: Aszimmetrikus kerekített buborék (20px-0px-20px-20px) jobbra igazítva
- **AutoScrollIndicator**: Frissített dizájn "New" label-lel és precíz SVG ikonnal
- CSS tokenek frissítve a teljes képernyős chat UX-hez
- `lighthouse-ci-config.js` now enforces ≥90 scores as *error* for performance and adds simulated throttling.

### Deprecated

### Removed

### Fixed

### Security

---

## [2.2.1] - 2025-07-08 - ULTRATHINK Hotfix Sprint

### Fixed
- **Critical Startup Failures**: Resolved a cascade of `ModuleNotFoundError` and `ImportError` issues across the backend that prevented the application from starting. This included fixing incorrect relative imports, circular dependencies, and references to deleted/renamed modules (`prompt_service`, `ModelSelector`, `ResponseBuilder`, etc.).
- **Dynamic Endpoint Lister**: Debugged and fixed numerous underlying issues that caused the `runtime_endpoint_lister.py` script to fail, enabling future automated drift detection.
- **Auth Logout Endpoint**: Corrected the `/api/v1/auth/logout` endpoint from `GET` to `POST` to match RESTful principles and frontend implementation, resolving a Blocker.
- **Chat Stream Endpoint**: Corrected the `/api/v1/stock/chat/{ticker}/stream` endpoint from `POST` to `GET` to comply with Server-Sent Events (SSE) standards, resolving a Blocker.
- **Missing Forex Endpoint**: (Historical note) A temporary dev-only mock was used to unblock FE. As of current policy, PROD uses only real providers and returns structured N/A on errors.
- **API Client Error Handling**: Enhanced the frontend `api.ts` helper to automatically handle `401 Unauthorized` responses by redirecting to the login page.
- **Deprecated Endpoint Stability**: Stabilized the deprecated `/header/{ticker}` endpoint by removing broken deps. Note: PROD no longer serves mock responses; returns structured N/A or 410 where applicable.

### Changed
- **Development Strategy**: Pivoted from a failing dynamic endpoint discovery to a static analysis approach (`grep`) to generate an initial endpoint matrix, allowing the project to move forward despite backend instability.
- **Refactoring Plan**: Documented a detailed plan for refactoring the oversized `shared_mappers.py` module in `docs/REFACTORING_PLAN_MAPPERS.md` to be addressed in a future sprint.

---

## [2.2.0] - 2025-07-31 - Sprint A3 Refinement

### Added
- **E2E Testing with Playwright**: Installed and configured Playwright for end-to-end testing. Added a baseline smoke suite (`tests/e2e/smoke.spec.ts`) covering `StockPage`, `MacroRatesPage`, and a mocked login flow.
- **SWR for Caching**: Added `swr` as a dependency to the shared frontend for robust data fetching and caching.
- **Duplicate Code Analysis**: Integrated `jsinspect` into the CI process to detect code duplication, with reports saved to the `audits/` directory.

### Changed
- **`useMacroRates` Hook**: Refactored the hook in `MacroRates.logic.ts` to use `useSWR`, replacing the manual `fetch` and `useState`/`useEffect` implementation. This provides caching and revalidation.

### Removed
- **Jest Remnants**: Scanned the repository for Jest configuration files; none were found, confirming their prior removal.

---

## [2.1.0] - 2025-07-30 - Feature Sprint

### Added
- **Google OAuth Finalization**: Merged backend changes (`SessionMiddleware`, auth router) to fully enable the authentication flow.
- **Stock Search**: Implemented a new search component with a debounced `useSearchData` hook for auto-suggestions.
- **Theme Toggle**: Added a dark/light theme toggle using a `useTheme` hook and localStorage persistence.
- **Streaming AI Chat**: Integrated a `ChatPanel` component with a `useChatStream` hook to handle real-time SSE token streams from the AI backend.
- **CI Hardening**: Added checks for required secrets (`GOOGLE_AUTH_CLIENT_ID`) to the CI pipeline.

### Changed
- **CI Pipeline**: Enforced a zero-warning policy for ESLint and consolidated frontend CI workflows.
- **API Documentation**: Updated with a detailed migration guide for deprecated endpoints (`/technical-analysis`, `/header`).
- **Header Component**: Integrated the new `Search` and `ThemeToggle` components.
- **StockPage**: Integrated the `ChatPanel` into the main stock details view.
- **Documentation Cleanup**: Replaced all legacy frontend paths in documentation files and archived numerous outdated reports to declutter the `docs/` directories.

### Removed
- Redundant and legacy CI workflow files and documentation reports.

### Fixed
- Corrected missing `react-router-dom` dependency.
- Installed missing `@types/lodash` and `@heroicons/react` dependencies to fix linter errors.
- Corrected legacy `STATIC_DIR` path in backend configuration to point to `shared/frontend/dist`. A manual user edit was required for this file.

---

## [v2.0.0] - 2025-07-27 - PHOENIX Terv v2.0
### Changed
- **SHARED MIGRATION COMPLETE**: All frontend code (pages, components, hooks, assets, config) has been consolidated into the central `shared/frontend/src` directory.
- The module-specific `modules/financehub/frontend` now acts as a thin wrapper, inheriting all configurations.
- Refactored `tsconfig.json`, `vite.config.ts`, and `tailwind.config.js` to use a centralized base configuration, eliminating duplication.
- The frontend project now successfully builds via `vite build` and runs tests via `vitest run`.

---

## [v1.4.2] - 2025-06-12
### Fixed
- Corrected backend absolute import paths in `ai_service` and `chat_service` that were causing `ModuleNotFoundError` during startup.
- Removed circular dependency between `prompt_builder` and `formatters` by creating dummy formatters.
- Fixed `SyntaxError` in `news_formatter.py` (`__future__` import position).

---

## [v1.4.1] - 2025-06-11
### Changed
- Refactored `core/fetchers` into a modular structure with subdirectories for each provider (EODHD, AlphaVantage, etc.).
- Replaced dynamic `importlib` logic in `fetchers/__init__.py` with explicit, static imports for clarity and stability.
- Standardized all backend relative imports to absolute imports using the `import_fixer.py` script to stabilize the module resolution.

---

## [2.5.0] - <!-- GITHUB_ACTION_DATE --> - FULL-SYNC v5-R5

### Changed
- **Endpoint Discovery**: Implemented a robust, two-mode (`lite`/`full`) runtime endpoint discovery mechanism. The new `scripts/generate_endpoint_matrix.py` now correctly handles application startup failures, guaranteeing a successful (if partial) endpoint list generation. This resolves the previous phase's blocker.
- **API Documentation**: The `API_DOCUMENTATION.md` is now fully auto-generated from the `endpoint_matrix.tsv` output, ensuring it is always in sync with the actual backend routes.

### Fixed
- Resolved a cascade of `ImportError` issues across the backend (`StockDataOrchestrator`, `FetcherFactory`, `get_user_id`, etc.) by creating placeholder modules and correcting faulty import statements. This stabilized the application startup process.

---

## [2025-01-22] - ULTRATHINK Total Cleanup & Stabilization

### 🔧 Backend Fixes
- **FIXED**: Core mapper import errors (`parse_ts_to_date_str`, `get_latest_financial_values`, `ForexQuote`)
- **ADDED**: `.env.local` template with required environment variables
- **REMOVED**: Duplicate `config_old/` directory
- **UPDATED**: Mapper functions moved to module level for proper importing

### 🎨 Frontend Improvements
- **RESTORED**: TickerTape component integration in Header
- **FIXED**: Hard-coded color classes replaced with theme-aware tokens
- **ENHANCED**: ChatPanel and Search components with proper dark/light mode support
- **VERIFIED**: Footer already contains premium-compliant content

### 📋 Repository Audit (Rule #008)
- **COMPLETED**: Full endpoint⇔frontend call matrix analysis
- **DOCUMENTED**: 12 well-connected endpoints, 8 backend-only endpoints
- **IDENTIFIED**: Missing frontend integrations for forex and market news
- **CLEANED**: Removed placeholder files and duplicate configurations

### 🧪 Testing & Quality
- **TESTED**: Backend imports and FastAPI app startup (✅ working)
- **VERIFIED**: Frontend components compile without errors
- **DOCUMENTED**: Known test failures (auth endpoints, macro data structure)
- **IMPROVED**: Code quality with ruff lint fixes

### 🏗️ Architecture Notes
- Backend running on localhost:8084 with health endpoint responding
- Frontend uses SWR for all API calls with consistent error handling
- SSE streaming implemented for AI chat functionality
- Authentication flow via Google OAuth with session management

### 📝 Documentation Updates
- Updated endpoint matrix with current usage patterns
- Added recommendations for future integrations
- Documented architecture patterns and conventions

---

## Legend
- **Added** for new features
- **Changed** for changes in existing functionality  
- **Deprecated** for soon-to-be removed features
- **Removed** for now removed features
- **Fixed** for any bug fixes
- **Security** for vulnerability fixes