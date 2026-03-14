# Project Research Summary

**Project:** Cookbook Web Frontend
**Domain:** SPA frontend for REST API cookbook and meal-planning platform
**Researched:** 2026-03-14
**Confidence:** HIGH

## Executive Summary

This is a feature-rich single-page application that consumes a Spring Boot REST API, authenticates via Keycloak OIDC/PKCE, and delivers a glassmorphism-styled cooking and meal-planning experience. Experts build this type of product with a layered state architecture — server state in TanStack Query, minimal UI state in Zustand, auth state kept in-memory by the OIDC library, and shareable navigation state in the URL. The critical insight from research is that the majority of complexity is not in the feature logic but in getting the plumbing right: auth token management, nginx routing, runtime configuration injection, and the glassmorphism performance budget on mobile. Get these foundations correct in Phase 1 and the feature work becomes straightforward.

The recommended approach is a TanStack-first stack (React 19, TanStack Router, TanStack Query) built with Vite 8/Tailwind 4, organized using Feature-Sliced Design. This combination provides type-safe routing with URL-driven filter and pagination state, automatic API caching that eliminates manual loading/error state, and a utility-first styling approach that maps directly to the glassmorphism design tokens. Authentication is handled by `react-oidc-context` wrapping `oidc-client-ts`, which keeps tokens in memory and handles silent refresh and race conditions internally — avoiding the most common auth pitfalls.

The primary risks are concentrated in three areas: (1) glassmorphism performance on mobile (backdrop-filter is GPU-expensive — strict limits per viewport are mandatory), (2) the Keycloak/CORS/nginx triple-misconfiguration that silently breaks token refresh after login appears to work, and (3) Docker runtime configuration (Vite bakes env vars at build time; a runtime injection strategy via `window.__CONFIG__` is required for the image to be portable across environments). All three must be resolved in the foundation phase before building any features.

## Key Findings

### Recommended Stack

The stack is optimized for a SPA consuming a REST API with JWT auth — there is no SSR and no server-side rendering concern. Vite 8 (with Rolldown/Oxc) replaces CRA definitively and delivers sub-second HMR. TanStack Router is strictly better than React Router v7 for this use case because v7's type safety and data loading only work in Remix-style framework mode. Tailwind 4 (CSS-first config, no tailwind.config.js) provides native backdrop-filter utilities for glassmorphism. Zod v4 serves as the single validation library across forms, API responses, and route search params.

**Core technologies:**
- **React 19 + TypeScript 5.7:** UI framework with improved Suspense for skeleton states; TypeScript is non-negotiable for API contract safety
- **Vite 8:** Build tool standard (CRA dead, Turbopack is Next.js-only); Rolldown engine gives 5x faster production builds
- **TanStack Router 1.x:** SPA-first routing with full type-safe params, search params, and loaders; built-in Vite plugin for file-based routes
- **TanStack Query 5.x:** Server state management; handles caching, pagination, background refetch, and optimistic updates — eliminates all manual loading/error state
- **react-oidc-context 3.x + oidc-client-ts 3.x:** PKCE flow with in-memory token storage, automatic refresh, and built-in refresh race condition handling
- **Zustand 5.x:** Minimal client state (auth UI, sidebar, theme) — server state belongs in TanStack Query, not here
- **ky 1.14.x:** Modern Fetch-based HTTP client (~3KB); cleaner than Axios, retry and interceptor support for Bearer token injection
- **Tailwind CSS 4.x:** CSS-first config; backdrop-filter utilities map directly to glassmorphism tokens
- **React Hook Form 7.x + Zod 4.x:** Uncontrolled forms (fewer re-renders on complex recipe editor) with unified runtime + compile-time validation
- **Vitest 3.x + Playwright:** Native Vite test integration and modern E2E testing

See `.planning/research/STACK.md` for full version table, alternatives considered, and installation commands.

### Expected Features

Research cross-referenced against Mealie, KitchenOwl, Paprika, Tandoor, and SideChef. Feature set is well-understood with HIGH confidence.

**Must have (table stakes):**
- Recipe card grid with hero images — users scan by image first; this is the primary entry point
- Full-text search with filters (keyword, tag, ingredient, cook time) — broken search causes immediate bounce
- Tag/category navigation — how non-search users discover content
- Recipe detail page — hero image, ingredients, step-by-step, metadata, ratings display
- Ingredient scaling (serving adjuster) — present in 86% of recipe apps; users expect it
- Responsive/mobile-first design — 80-90% of food content is consumed on mobile
- Skeleton loading states — blank screens feel broken; established project requirement
- Favorites/bookmarks — baseline retention feature
- Recipe create/edit form — ingredient builder, step editor, image upload, tags
- Meal plan calendar view (week) — the standard mental model (used by Paprika, Mealie, KitchenOwl)
- Auto-generate meal plans — key backend differentiator; frontend needs trigger UI + review
- Shopping list from meal plan — the payoff of meal planning; 86% of apps include this
- Login/logout via Keycloak PKCE — foundational; must be seamless
- User profile and preferences — dietary restrictions, display settings
- Admin dashboard — user management, config, IP blocking, role-gated

**Should have (competitive differentiators):**
- Cook mode with step-by-step navigation — largest single differentiator; uses Wake Lock API to prevent screen sleep; integrated per-step timers
- Allergen warnings on recipe cards/detail — safety feature, rare in implementations
- Nutritional summary per recipe — backend aggregates per ingredient; frontend displays macro breakdown
- Print-friendly recipe view — `@media print` stylesheet; low effort, high user value
- Smooth page transitions — reinforces premium SPA feel

**Defer to v2:**
- "What can I cook?" ingredient filter (requires pantry/inventory feature; high complexity)
- Multi-user household sharing (requires backend scope verification)
- Related recipe suggestions (nice-to-have discovery feature)
- Offline/PWA mode (out of scope; service worker complexity)
- Internationalization (structure code i18n-friendly but do not implement)

**Anti-features (do not build):**
- Social activity feeds, AI-generated recipes, gamification, video hosting, real-time collaborative editing, infinite scroll

See `.planning/research/FEATURES.md` for full feature dependency tree and complexity ratings.

### Architecture Approach

The application follows a modified Feature-Sliced Design (5-layer, simplified from canonical 7-layer) with a strict downward dependency rule: `app → pages → features → entities → shared`. State is separated across four purpose-built containers: TanStack Query for server state, Zustand for ephemeral UI state, oidc-client-ts in-memory for auth state, and the URL for all shareable navigation state (pagination, filters, sort). This separation is the most critical architectural decision — a god store that mixes server and UI state causes cascading re-render and testing problems.

**Major components:**
1. **Shared layer** (`shared/ui`, `shared/api`, `shared/auth`, `shared/config`) — the foundation; Glass design system primitives, configured ky/API client with Bearer token interceptor, Keycloak auth guards, runtime config. Built first, everything depends on it.
2. **Entities layer** (`entities/recipe`, `entities/ingredient`, `entities/meal-plan`, etc.) — domain types, API functions, TanStack Query hooks, and basic UI cards. The entity API + query hook factory pattern centralizes all data access per domain.
3. **Features layer** (`features/recipe-search`, `features/ingredient-scaling`, `features/cook-mode`, `features/meal-plan-generator`, `features/shopping-list`, etc.) — encapsulated user-facing capabilities with their own local state; compose entity hooks and shared UI primitives.
4. **Pages layer** (`pages/recipes`, `pages/meal-plans`, `pages/admin`, etc.) — routable screens that compose features and entities; own route params and URL state.
5. **App shell** (`app/`) — bootstraps providers (QueryClient, AuthProvider, Router), global styles, and the nginx-served entry point.

The nginx deployment uses a reverse proxy pattern: frontend nginx proxies `/api/v1/*` to the Spring Boot backend, eliminating CORS entirely for API calls. Keycloak remains a separate origin (browser-accessible URL only — not the Docker-internal hostname).

See `.planning/research/ARCHITECTURE.md` for data flow diagrams, all 5 key patterns with code examples, and the suggested build order.

### Critical Pitfalls

1. **Nginx 404 on page refresh** — Add `try_files $uri $uri/ /index.html` in the nginx location block. Also add a catch-all 404 route in TanStack Router because nginx will no longer return 404 for invalid URLs. Configure this in Phase 1 before any feature work.

2. **Keycloak CORS triple-misconfiguration breaks silent token refresh** — Login appears to work (full-page redirect bypasses CORS) but background token refresh silently fails, logging users out after ~5 minutes. Use nginx reverse proxy so frontend and API share the same origin (CORS eliminated for API calls). Set Keycloak Web Origins explicitly, never `*`. Test token refresh by shortening access token lifetime to 1 minute during development.

3. **JWT tokens in localStorage = XSS vulnerability** — Use `react-oidc-context`/`oidc-client-ts` default in-memory storage. Use `silent-check-sso` via hidden iframe for session persistence across page reloads. Never persist tokens to localStorage or sessionStorage.

4. **Build-time env vars cannot change at Docker runtime** — `VITE_*` vars become string literals in the bundle. Implement a runtime config injection strategy: Docker entrypoint writes a `config.json` or `window.__CONFIG__` script tag; the app reads from there at startup. Design this before the first Docker image is built.

5. **Glassmorphism performance destroys mobile experience** — `backdrop-filter: blur()` triggers GPU compositing per element. Limit to 3-5 glass elements per viewport, keep blur at 8-12px, never animate `backdrop-filter`. For recipe card grids (many cards), use solid semi-transparent backgrounds instead of blur. Reserve true glassmorphism for modals, headers, and detail views. Test on a mid-range Android device early.

See `.planning/research/PITFALLS.md` for 16 pitfalls organized by severity and phase.

## Implications for Roadmap

Research strongly suggests a 6-phase structure that mirrors the architectural build order (shared → entities → features → polish). The auth and infrastructure concerns are front-loaded because they unblock everything else and contain the most critical pitfalls.

### Phase 1: Foundation and Infrastructure

**Rationale:** The shared layer (design system, API client, auth, runtime config, Docker) is a hard dependency for every subsequent phase. Auth misconfiguration is the most likely source of rework — discovering it in Phase 1 when no feature code exists is dramatically cheaper than discovering it in Phase 4.

**Delivers:** Working Docker Compose stack with nginx, Keycloak PKCE auth (login/logout/token refresh), Glass design system components and CSS tokens, skeleton loader pattern, runtime config injection, app shell with routing skeleton, and error boundaries.

**Addresses:** Authentication, skeleton loading states, glassmorphism design system, responsive layout foundation.

**Avoids:** Pitfalls 1 (nginx 404), 2 (CORS/token refresh), 3 (token localStorage), 4 (build-time config), 5 (glassmorphism performance rules established), 13 (Docker network), 14 (Keycloak URL), 15 (error boundaries).

**Research flag:** Needs research-phase. Keycloak PKCE + react-oidc-context configuration has known subtleties; nginx reverse proxy setup should be verified against the existing docker-compose structure.

### Phase 2: Core Recipe Browsing (Read-Only)

**Rationale:** The primary user journey is browse → discover → read a recipe. This is the highest-traffic path and validates the full request/response data flow (TanStack Query, Spring Data pagination, entity API pattern) before introducing mutations.

**Delivers:** Recipe card grid (with skeletons), full-text search with filters, tag/category navigation, recipe detail page with ingredient scaling and ratings display, favorites, user profile and preferences.

**Addresses:** Recipe browsing and discovery (all table-stakes features), ingredient scaling, favorites, user profile.

**Avoids:** Pitfall 11 (Spring Data pagination format — build the paginated API client here), Pitfall 12 (query invalidation pattern established for favorites toggle), Pitfall 6 and 7 (skeleton layout shift and flicker).

**Research flag:** Standard patterns — skip research-phase. TanStack Query + Spring Data pagination is well-documented.

### Phase 3: Recipe Creation and Content Management

**Rationale:** CRUD mutations depend on a working read path (Phase 2 validates the data layer). Recipe creation is the most complex form in the app (ingredient list builder, step editor, image upload, tags) — tackling it as a discrete phase focuses effort.

**Delivers:** Recipe create/edit form with React Hook Form + Zod validation, image upload with client-side validation and compression, tag selector, full recipe CRUD, recipe sharing via token link.

**Addresses:** Recipe management table-stakes features, image upload, recipe sharing.

**Avoids:** Pitfall 12 (mutation cache invalidation after create/edit/delete), Pitfall 16 (image upload validation and compression).

**Research flag:** Standard patterns — skip research-phase. React Hook Form + Zod + TanStack Query mutations are well-documented.

### Phase 4: Meal Planning and Shopping

**Rationale:** Meal planning depends on recipe browsing (users select recipes for plans) and CRUD patterns (Phase 3 establishes mutations). This is a distinct workflow with its own calendar UI complexity — isolating it in one phase keeps scope manageable.

**Delivers:** Weekly meal plan calendar view, drag-and-drop recipe assignment to day slots, auto-generate meal plans with preference inputs, shopping list generation from meal plan with category grouping and checkbox UI.

**Addresses:** All meal planning table-stakes features, shopping list, auto-generation.

**Avoids:** Pitfall 12 (shopping list must invalidate after plan changes), state isolation between calendar UI state and server state.

**Research flag:** Needs research-phase. Drag-and-drop calendar UI in React has several implementation options (dnd-kit, react-beautiful-dnd, native HTML5 DnD) with different tradeoffs; the auto-generate API contract needs verification.

### Phase 5: Differentiating Features and Polish

**Rationale:** Cook mode, allergen warnings, nutritional summary, and print view are all high-value but depend on a complete recipe detail page (Phase 2). Doing these after core functionality is stable means they can be built as enhancements without affecting the primary user journey.

**Delivers:** Cook mode with step-by-step navigation, Wake Lock API for screen-on, integrated per-step timers with Notification API, ingredient checkboxes, allergen warning badges, nutritional macro summary, print-friendly stylesheet, smooth page transitions, related recipe suggestions.

**Addresses:** All cooking experience differentiators and personalization features.

**Avoids:** Wake Lock API browser compatibility edge cases; notification permission flow UX.

**Research flag:** Needs research-phase for cook mode. Wake Lock API, concurrent timer management, and Notification API permission flows have browser-specific behaviors worth verifying before implementation.

### Phase 6: Admin and Production Hardening

**Rationale:** The admin dashboard is the smallest-audience, highest-complexity feature — it is role-gated and most users never see it. Deferring it to the final phase means production infrastructure (Docker, nginx, auth) is already validated before adding admin capabilities. This phase also covers performance audit and accessibility.

**Delivers:** Admin dashboard with user management, system config, IP blocking, rating criteria management. All routes role-gated via RequireAdmin. Performance audit (bundle analysis, image optimization), accessibility review (WCAG AA contrast on glass surfaces), responsive polish for mobile edge cases.

**Addresses:** Admin table-stakes requirement, production readiness.

**Avoids:** Admin routes accidentally exposed to non-admin users; performance regressions from accumulated technical debt.

**Research flag:** Standard patterns — skip research-phase. Admin CRUD is the same patterns as Phase 3; role-based route guarding is established in Phase 1.

### Phase Ordering Rationale

- **Foundation first:** The shared/auth/Docker layer is a hard dependency with the most dangerous pitfalls. Discovering a CORS misconfiguration in Phase 5 means rewriting auth across all features; discovering it in Phase 1 is a 2-hour fix.
- **Read before write:** Validating the full read data flow (TanStack Query → API client → Spring Data pagination) before introducing mutations prevents double-debugging (is the mutation broken, or is the read layer broken?).
- **Core loop before planning:** The recipe browsing loop is used by meal planning. Building meal planning before recipe browsing would require mocking a dependency.
- **Differentiators late:** Cook mode and allergen features add polish to an existing recipe detail page. They cannot be built until the base page is complete.
- **Admin last:** Smallest user base, role-gated, same patterns as already-established CRUD — no reason to prioritize it over user-facing value.

### Research Flags

Phases likely needing deeper research during planning:
- **Phase 1:** Keycloak PKCE + react-oidc-context has known configuration subtleties. Verify the existing docker-compose structure and network names before writing any auth code.
- **Phase 4:** Drag-and-drop calendar UI library selection (dnd-kit vs alternatives) and auto-generate API contract need verification before architecture is locked in.
- **Phase 5:** Wake Lock API, Notification API permission flow, and concurrent timer state management have enough browser-specific behavior to warrant targeted research.

Phases with standard patterns (skip research-phase):
- **Phase 2:** TanStack Query + Spring Data pagination is exhaustively documented.
- **Phase 3:** React Hook Form + Zod + mutation invalidation is standard.
- **Phase 6:** Admin CRUD and role-gated routing follow patterns established in Phase 1 and Phase 3.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | All major libraries verified against official sources with exact version numbers. Alternatives evaluated with clear rationale. |
| Features | HIGH | Cross-referenced against 5+ recipe application platforms with UX case study sources. Feature dependency tree is complete. |
| Architecture | MEDIUM-HIGH | FSD pattern well-sourced; some architecture decisions (ARCHITECTURE.md still references @react-keycloak/web in code examples rather than react-oidc-context) need reconciliation with STACK.md auth recommendation. |
| Pitfalls | HIGH | All critical pitfalls have HIGH confidence ratings from official specs (OWASP, Nginx docs, OAuth2 security best practices) or widely-documented community experience. |

**Overall confidence:** HIGH

### Gaps to Address

- **Auth library consistency:** ARCHITECTURE.md code examples use `@react-keycloak/web` and `useKeycloak()`, but STACK.md recommends `react-oidc-context` and `useAuth()`. The two libraries have different hook APIs. Reconcile in Phase 1 — pick `react-oidc-context` (STACK.md recommendation) and rewrite the RequireAuth pattern example accordingly.
- **API contract details:** Research assumes standard Spring Data REST conventions (`{ content: [...], totalPages: N, ... }`). The actual backend API contract (field names, pagination envelope, auth endpoints) needs verification against the live API or OpenAPI spec before Phase 2 begins.
- **Drag-and-drop calendar:** No specific library recommendation was made for the meal plan calendar. This is the highest UI complexity item in the project and warrants a dedicated research spike before Phase 4.
- **React-oidc-context `oidc-spa` alternative:** PITFALLS.md notes `oidc-spa` as a lighter-weight alternative that handles more edge cases internally. If react-oidc-context proves difficult to configure with the existing Keycloak realm setup, `oidc-spa` is the recommended fallback.

## Sources

### Primary (HIGH confidence)
- [React 19.2 Versions](https://react.dev/versions) — version confirmation
- [Vite 8 Announcement](https://vite.dev/blog/announcing-vite8) — Rolldown, Oxc compiler
- [Tailwind CSS v4](https://tailwindcss.com/blog/tailwindcss-v4) — CSS-first config, backdrop-filter utilities
- [Zod v4](https://zod.dev/v4) — performance improvements, @zod/mini
- [Keycloak JavaScript Adapter Official Docs](https://www.keycloak.org/securing-apps/javascript-adapter) — token management, PKCE
- [react-oidc-context + Keycloak sample](https://github.com/authts/sample-keycloak-react-oidc-context) — official PKCE example
- [Feature-Sliced Design](https://feature-sliced.design/blog/frontend-folder-structure) — layer definitions, dependency rules
- [React Router v7 Code Splitting](https://reactrouter.com/explanation/code-splitting) — lazy loading

### Secondary (MEDIUM confidence)
- [TanStack Router vs React Router](https://medium.com/ekino-france/tanstack-router-vs-react-router-v7-32dddc4fcd58) — SPA comparison
- [Cooklang: Recipe Manager Comparison 2026](https://cooklang.org/blog/09-cooklang-vs-paprika-vs-mealie/) — feature benchmarking
- [Glassmorphism Implementation Guide](https://playground.halfaccessible.com/blog/glassmorphism-design-trend-implementation-guide) — performance and CSS techniques
- [Skeleton Loading Screen Design](https://blog.logrocket.com/ux-design/skeleton-loading-screen-design/) — delay and flicker patterns
- [Deploying Configurable Frontend Containers](https://blog.container-solutions.com/deploying-configurable-frontend-web-application-containers) — runtime config injection
- [Configuring CORS with Keycloak OIDC](https://skycloak.io/blog/configuring-cors-with-your-keycloak-oidc-client/) — CORS misconfiguration patterns

### Tertiary (MEDIUM-LOW confidence)
- [oidc-spa](https://www.oidc-spa.dev/) — alternative OIDC library (newer, smaller ecosystem)
- [Zustand + React Query Architecture](https://dev.to/neetigyachahar/architecture-guide-building-scalable-react-or-react-native-apps-with-zustand-react-query-1nn4) — state separation pattern
- [EatHealthy365: Smart Recipe Cook Mode](https://eathealthy365.com/the-ultimate-guide-to-smart-recipe-cook-mode/) — cook mode feature analysis

---
*Research completed: 2026-03-14*
*Ready for roadmap: yes*
