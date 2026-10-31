# Testing

## Running the tests

```bash
pnpm test:browser:install   # ONCE per machine — installs Chromium
pnpm test                   # headless
```

**Install the browser first.** Tests run in a real Chromium via Vitest's
browser mode, not jsdom, so a fresh clone that goes straight to `pnpm test`
fails with a Playwright error that reads like a broken test suite.
`test:browser:install` also installs Chromium's system libraries, so it asks for
`sudo`; on WSL the usual symptom of skipping that is "Target page, context or
browser has been closed".

Where Chromium cannot run, tests of plain functions still can, without a
browser: `pnpm vitest run --browser.enabled=false src/lib src/features/reports/data`.
Anything that touches the DOM or cookies fails that way - it is a stopgap, not
a substitute.

| Command | Use |
| --- | --- |
| `pnpm test` | Headless. |
| `pnpm test:watch` | Re-runs on change. |
| `pnpm test:browser` | **Headed** — watch the browser drive itself. Best for debugging a failing DOM assertion. |
| `pnpm test:ui` | Vitest's UI. |
| `pnpm test:coverage` | Coverage report. |

## Type checking

**`tsc --noEmit` checks nothing in this repo and exits 0.**

The root `tsconfig.json` is solution-style — `"files": []` plus project
references to `tsconfig.app.json` and `tsconfig.node.json` — so `--noEmit` finds
no files to compile and reports success no matter what is in `src/`.

```bash
pnpm typecheck    # tsc -b — the real check
```

This is not hypothetical: a type error that crashed four pages shipped past a
green `tsc --noEmit`. If you ever doubt the checker, drop a deliberate error
into a file and confirm it is reported.

## Conventions

Tests live **next to the code**, as `*.test.ts` / `*.test.tsx`:

```
src/lib/cookies.ts
src/lib/cookies.test.ts
```

Shared helpers live in `src/test-utils/`.

Component tests use `vitest-browser-react`. Prefer asserting what a user can
see and do — visible text, roles, and the result of a click — over
implementation details like internal state.

## What is covered today

Coverage is grouped by area:

| Area | Files |
| --- | --- |
| Utilities | `src/lib/cookies.test.ts`, `src/lib/utils.test.ts`, `src/lib/handle-server-error.test.ts`, `src/lib/format.test.ts`, `src/lib/date.test.ts`, `src/lib/regions.test.ts`, `src/lib/download-feedback.test.tsx` |
| Permissions | `src/lib/permissions.test.ts` |
| Navigation and responsive layout | `src/components/layout/data/breadcrumbs.test.ts`, `src/components/layout/data/filter-nav.test.ts`, `src/components/layout/header.responsive.test.tsx`, `src/components/page-heading.responsive.test.tsx` |
| Reports | `src/features/reports/data/reports.test.ts`, `src/features/reports/index.test.tsx`, `src/features/reports/highlights.test.tsx` |
| Hooks | `src/hooks/use-table-url-state.test.ts` |
| State | `src/stores/auth-store.test.ts` |
| Components | `src/components/config-drawer.test.tsx`, `src/components/confirm-dialog.test.tsx`, `src/components/password-input.test.tsx`, `src/components/sign-out-dialog.test.tsx`, `src/components/user-menu-content.test.tsx`, `src/components/ui/date-input.test.tsx`, `src/components/data-table/data-table.responsive.test.tsx`, `src/components/data-table/row-actions.responsive.test.tsx` |
| Context | `src/context/search-provider.test.tsx` |
| Authentication and notifications | `src/features/auth/data/landing.test.ts`, `src/features/auth/data/api.test.ts`, `src/features/auth/sign-in/components/form.test.tsx`, `src/features/notifications/components/notification-bell.test.tsx`, `src/features/notifications/hooks/use-notification-watcher.test.tsx` |
| Domain data and API | `src/features/stones/data/enums.test.ts`, `src/features/identification/data/finalize-rules.test.ts`, `src/features/certificates/data/format.test.ts`, `src/features/certificates/data/api.test.ts`, `src/features/orders/data/stone-label.test.ts` |
| Feature components | `src/features/lookups/components/mutate-dialog.test.tsx`, `src/features/orders/components/columns.test.tsx`, `src/features/orders/components/view-dialog.test.tsx`, `src/features/orders/components/row-actions.test.tsx`, `src/features/roles/role-card-list.responsive.test.tsx`, `src/features/settings/components/sidebar-nav.test.tsx` |

## What is not covered — read this before trusting the suite

Coverage is still selective; tests do not amount to full end-to-end coverage of
the domain workflows. In particular, there is no current coverage of:

- `src/lib/authz.ts` — permission gating (the permissions test covers vocabulary, not UI authorization)
- `src/lib/api-query.ts` — the query-parameter contract
- broad list, mutation, and soft-delete workflows across the domain screens;
  current Orders component tests cover selected views and actions, not the full pipeline

Responsive tests now cover the shared data-table, row actions, page heading,
header, and Roles card layout. They do not cover every table interaction or
every screen at every viewport. `src/lib/format.ts` and `src/lib/date.ts` have
unit tests; those do not replace screen-level date or currency checks.

The pure functions are where to start — `authz`, `buildListParams` and
`toPaginated` are dependency-free and each takes minutes. `toPaginated` is worth
a test in particular: it derives page numbers the API does not send, so an
off-by-one there misreports the last page on every table in the app.

A concrete example of the value: `hasAnyPermission` once took a bare string
where it expected an array, which threw a `TypeError` and blanked four screens.
This would have caught it:

```ts
expect(hasAnyPermission('orders.view_order')).toBe(false)
```

## Verifying a change

GitHub Actions runs the frontend checks on pushes to `main`/`master` and pull requests. Run the same checks locally before opening a pull request:

```bash
pnpm typecheck     # tsc -b — the real type check; see below
pnpm lint          # 0 errors; a handful of warnings are expected
pnpm docs:check    # no doc references a file that no longer exists
pnpm knip          # nothing newly unused
pnpm build         # the production build actually completes
```

`pnpm format` before committing keeps diffs clean; the `pre-commit` hook (husky
+ lint-staged) already runs ESLint and Prettier on staged files.

### When the browser tests cannot run

`pnpm test` drives a real Chromium through Playwright, which has to be installed
once with `pnpm test:browser:install`. On platforms where that install cannot
complete, the five commands above are the whole verification loop — they catch
type errors, dead code, broken doc references and build failures, but nothing
about runtime behaviour. Walk the affected screen by hand before merging.

`pnpm docs:check` fails when a doc references a file that no longer exists. See
[the docs index](./README.md#keeping-these-docs-honest).
