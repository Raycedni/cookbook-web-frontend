---
phase: 01-foundation-and-authentication
plan: 02
subsystem: auth
tags: [keycloak, oidc, pkce, react-oidc-context, ky, tanstack-router, zustand, responsive-layout]

requires:
  - phase: 01-foundation-and-authentication/01
    provides: Vite scaffold, Tailwind design tokens, GlassPanel, cn(), env config, test infrastructure
provides:
  - Keycloak PKCE OIDC configuration with silent renew
  - useAuthRoles hook for JWT realm_access role extraction
  - Authenticated ky HTTP client with Bearer token injection
  - Responsive app shell (NavBar, Sidebar, MobileNav, AppLayout)
  - TanStack Router file-based routing with auth guard
  - AuthProvider + QueryClientProvider + RouterProvider wiring
affects: [01-03, 02-01, 03-01, 04-01, 05-01, all-phases]

tech-stack:
  added: []
  patterns: [oidc-pkce-config, jwt-role-extraction, bearer-token-injection, responsive-app-shell, file-based-routing-with-auth-context, zustand-sidebar-store]

key-files:
  created:
    - src/shared/auth/oidc-config.ts
    - src/shared/auth/useAuthRoles.ts
    - src/shared/api/client.ts
    - src/shared/ui/NavBar.tsx
    - src/shared/ui/Sidebar.tsx
    - src/shared/ui/MobileNav.tsx
    - src/shared/ui/AppLayout.tsx
    - src/routes/__root.tsx
    - src/routes/index.tsx
    - src/routes/_authenticated.tsx
    - src/routes/_authenticated/dashboard.tsx
    - src/shared/auth/oidc-config.test.ts
    - src/shared/auth/useAuthRoles.test.ts
  modified:
    - src/main.tsx
    - src/routeTree.gen.ts

key-decisions:
  - "Used AuthProviderNoUserManagerProps return type for getOidcConfig since AuthProviderProps is a union type"
  - "Sidebar state managed by inline Zustand store in Sidebar.tsx for simplicity"
  - "MobileNav placeholder items (Recipes, Meals, Profile) rendered as disabled spans until routes exist"

patterns-established:
  - "OIDC config pattern: getOidcConfig() returns AuthProviderNoUserManagerProps with Keycloak PKCE settings"
  - "Role extraction pattern: useAuthRoles() extracts roles from auth.user.profile.realm_access.roles"
  - "API client pattern: ky with beforeRequest hook reading user from sessionStorage"
  - "App shell pattern: NavBar (top) + Sidebar (left, collapsible) + MobileNav (bottom, mobile-only)"
  - "Auth guard pattern: _authenticated layout route with beforeLoad checking context.auth.isAuthenticated"
  - "Provider wiring: StrictMode > AuthProvider > QueryClientProvider > InnerApp(RouterProvider)"

requirements-completed: [AUTH-01, AUTH-02, AUTH-03, AUTH-04, AUTH-05, FOUND-05]

duration: 5min
completed: 2026-03-15
---

# Phase 1 Plan 02: Auth Integration and App Shell Summary

**Keycloak PKCE auth via react-oidc-context with JWT role extraction, responsive app shell (NavBar/Sidebar/MobileNav), TanStack Router auth-guarded routes, and ky API client with Bearer token injection**

## Performance

- **Duration:** 5 min
- **Started:** 2026-03-14T23:16:06Z
- **Completed:** 2026-03-14T23:21:30Z
- **Tasks:** 2
- **Files modified:** 15

## Accomplishments
- OIDC configuration pointing to Keycloak with PKCE, automaticSilentRenew, and onSigninCallback URL cleanup
- useAuthRoles hook extracting ADMIN/USER roles from JWT realm_access claims with isAdmin, isUser, hasRole API
- ky-based API client automatically injecting Bearer token from sessionStorage on all requests
- Responsive app shell: NavBar (desktop nav links, login/logout, role-gated admin link), collapsible Sidebar (Zustand state), MobileNav (bottom bar for mobile)
- TanStack Router file-based routing with auth context: root layout, home page, _authenticated guard route, protected dashboard
- main.tsx wiring: AuthProvider + QueryClientProvider + ReactQueryDevtools + RouterProvider with auth context

## Task Commits

Each task was committed atomically:

1. **Task 1: Auth utilities (TDD)**
   - RED: `55367ff` (test: failing tests for OIDC config and auth roles hook)
   - GREEN: `7919722` (feat: implement OIDC config, auth roles hook, and API client)
2. **Task 2: App shell layout, routes, providers** - `f9746c9` (feat)

## Files Created/Modified
- `src/shared/auth/oidc-config.ts` - Keycloak PKCE OIDC configuration with silent renew
- `src/shared/auth/useAuthRoles.ts` - JWT realm_access role extraction hook
- `src/shared/api/client.ts` - ky HTTP client with Bearer token injection
- `src/shared/ui/NavBar.tsx` - Top navigation with logo, links, login/logout, admin link
- `src/shared/ui/Sidebar.tsx` - Collapsible sidebar with Zustand store
- `src/shared/ui/MobileNav.tsx` - Bottom mobile navigation bar
- `src/shared/ui/AppLayout.tsx` - App shell composing NavBar, Sidebar, MobileNav
- `src/routes/__root.tsx` - Root route with auth context and AppLayout
- `src/routes/index.tsx` - Home page with welcome GlassPanel
- `src/routes/_authenticated.tsx` - Auth guard layout route with beforeLoad
- `src/routes/_authenticated/dashboard.tsx` - Protected dashboard page
- `src/shared/auth/oidc-config.test.ts` - 7 tests for OIDC config
- `src/shared/auth/useAuthRoles.test.ts` - 5 tests for role extraction
- `src/main.tsx` - Rewired with AuthProvider + QueryClientProvider + RouterProvider
- `src/routeTree.gen.ts` - Auto-generated route tree

## Decisions Made
- Used `AuthProviderNoUserManagerProps` as return type for `getOidcConfig()` because `AuthProviderProps` is a union type that doesn't expose `authority`/`client_id` properties directly on the type. This is more precise and avoids test type errors.
- Sidebar state managed by inline Zustand store (exported `useSidebarStore`) in `Sidebar.tsx` rather than a separate store file, keeping it simple until more UI state is needed.
- Placeholder nav items (Recipes, Meal Plans, Profile) rendered as disabled spans rather than links to non-existent routes.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed TypeScript errors from AuthProviderProps union type**
- **Found during:** Task 2 (TypeScript compilation)
- **Issue:** `AuthProviderProps` is `AuthProviderNoUserManagerProps | AuthProviderUserManagerProps` -- accessing `authority`, `client_id` etc. on the union type fails TypeScript checks. Also unused imports in test files and NavBar.
- **Fix:** Changed return type to `AuthProviderNoUserManagerProps`, fixed `onSigninCallback` signature to accept `_user` parameter, removed unused imports
- **Files modified:** src/shared/auth/oidc-config.ts, src/shared/auth/oidc-config.test.ts, src/shared/auth/useAuthRoles.test.ts, src/shared/ui/NavBar.tsx, src/shared/ui/MobileNav.tsx
- **Verification:** `npx tsc -b` passes with no errors
- **Committed in:** f9746c9 (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (1 bug)
**Impact on plan:** Type fix necessary for compilation. No scope creep.

## Issues Encountered
None - all files created cleanly, tests passed on first GREEN run.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Auth integration and app shell complete, ready for Plan 03 (Docker deployment with nginx)
- All 24 tests pass (12 from Plan 01 + 12 from Plan 02)
- Build succeeds with code-split routes
- Layout responsive with mobile/tablet/desktop breakpoints

## Self-Check: PASSED

All 15 created/modified files verified present. All 3 commits verified in git log.

---
*Phase: 01-foundation-and-authentication*
*Completed: 2026-03-15*
