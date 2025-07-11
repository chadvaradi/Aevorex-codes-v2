# Frontend Testing & Coverage Workflow

This document explains how we achieve **100 % code coverage** for the shared FinanceHub frontend and guard visual/UX regressions.

> Applies to `packages/@aevorex/shared-frontend` (Vite + React).

---

## 1  ➜  Run The Full Test Suite

```bash
# Unit + component tests with Vitest (JSDOM)
pnpm --filter @aevorex/shared-frontend test:coverage

# E2E tests with Cypress (instrumented for coverage)
pnpm --filter @aevorex/shared-frontend cy:run

# Merge both coverages into one HTML + json summary
pnpm --filter @aevorex/shared-frontend coverage:merge
```

## 2  ➜  Identify Gaps

After merging, list files that are *not* at 100 %:

```bash
pnpm --filter @aevorex/shared-frontend coverage:uncovered
```

The utility reads `coverage/combined/coverage-summary.json` and writes
`coverage/uncovered.txt` with a sortable table of line-coverage percentages.

## 3  ➜  Fix The Gaps

* **Pure helpers** → add unit tests under `shared/frontend/tests/**`.
* **UI components** → add `.stories.tsx` + Storybook test cases – use
  `@storybook/test-runner` for interaction flows.
* **Complex flows** → add Cypress specs in `shared/frontend/cypress/e2e/**`.

Every change should shrink `uncovered.txt`. CI fails once the list is empty & the
coverage threshold step passes.

## 4  ➜  Visual Regression (Chromatic)

```bash
export CHROMATIC_PROJECT_TOKEN=<token>
pnpm --filter @aevorex/shared-frontend chromatic
```

Chromatic receives Storybook snapshots on every PR and blocks merges on visual
diffs unless explicitly approved.

## 5  ➜  Coverage Gate in CI

The workflow calls:

```bash
pnpm --filter @aevorex/shared-frontend coverage:check
```

which enforces `--lines 100 --functions 100 --branches 100` on every file. A PR
that lowers coverage **fails**.

## 6  ➜  Local Best Practices

* Develop new components **with Storybook first** – iterate on UI decoupled
  from app state.
* Add interaction tests (`play` function) so they run both in the test-runner &
  in Chromatic.
* Keep each file ≤ 160 LOC (Rule #008) – split into `*.view.tsx` and
  `*.logic.ts` if needed.
* Obey premium UX guidelines: skeleton shimmer < 200 ms, 60 fps motion, dark
  mode parity.

---

_Last update: 2025-07-12_ 