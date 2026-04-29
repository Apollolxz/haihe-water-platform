# React Migration Plan

This frontend has moved from generated HTML-derived pages plus DOM scripts to native React pages.

## Guardrails

- Keep the current visual result unchanged while migrating.
- Migrate one page at a time.
- Keep GitHub Pages builds working after every step.
- Move code only after a page has a React equivalent and tests.

## Current Bridge

- `src/App.jsx` is now only the React shell.
- `src/legacy/` contains URL compatibility and shared interaction adapters.
- `src/pages/` contains native React page components and page metadata.
- `src/pages/nativePages.js` maps compatible `.html` URLs to React page entries.
- `src/generated/LegacyPageData.js` and `assets/js/generated/` have been removed.
- `src/pages/*AnalysisRuntime.js` now owns all analysis runtimes directly from React pages.
- `src/pages/dashboardRuntime.js` now owns the dashboard runtime directly from the React page.
- `src/pages/knowledgeGraphRuntime.js` now owns the knowledge graph runtime directly from the React page.
- `src/pages/sandboxRuntime.js` now owns the sandbox runtime directly from the React page.
- Chart, graph, and particle dependencies are installed through npm and loaded by Vite/ESM instead of CDN scripts.
- Native page components under `src/pages/` own the rendered markup; the generated JSX bridge has been removed.
- `src/features/` contains page behavior that is already separated from page markup.

## Page Order

1. Shared runtime, API services, navigation, and layout. Done.
2. React page components for every compatible page URL. Done.
3. Chat, auth, profile, home data, dashboard, graph, sandbox, and analysis runtime ownership. Done for current pages.
4. Replace generated page markup with hand-authored React components one page at a time. Done for all pages.
5. Remove HTML/runtime script generation after visual parity and interaction tests exist. Done.

## Completion Criteria

A page is considered migrated when:

- It has a hand-authored component under `src/pages/`. Done for all pages.
- Its data access lives under `src/services/` or a page-specific hook.
- It no longer depends on a page script in `assets/js/`.
- It no longer depends on CDN runtime script injection.
- Its visual baseline matches the existing page.
- Tests cover routing and critical user interactions.

## Safety Checks

- Routing tests verify every compatible `.html` URL resolves to a React page component.
- Runtime tests verify page scripts are not reloaded when wrapper callbacks rerender.
- Page metadata has empty `scripts` arrays; runtime initialization is handled by React/Vite modules.
