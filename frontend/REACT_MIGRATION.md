# React Migration Plan

This frontend is moving from generated legacy pages plus DOM scripts to native React pages.

## Guardrails

- Keep the current visual result unchanged while migrating.
- Migrate one page at a time.
- Keep GitHub Pages builds working after every step.
- Move code out of legacy scripts only after a page has a React equivalent and tests.

## Current Bridge

- `src/App.jsx` is now only the React shell.
- `src/legacy/` contains the temporary legacy adapter.
- `src/generated/LegacyPages.jsx` is generated from `frontend/pages/*.html` and should shrink over time.
- `src/features/` is the landing area for real React page logic.

## Page Order

1. Shared runtime, API services, navigation, and layout.
2. Chat page.
3. Knowledge graph page.
4. Sandbox page.
5. Dashboard page.
6. Secondary analysis pages.

## Completion Criteria

A page is considered migrated when:

- It has a hand-authored component under `src/pages/`.
- Its data access lives under `src/services/` or a page-specific hook.
- It no longer depends on a page script in `assets/js/`.
- Its visual baseline matches the legacy page.
- Tests cover routing and critical user interactions.
