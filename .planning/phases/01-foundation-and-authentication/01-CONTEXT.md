# Phase 1: Foundation and Authentication - Context

**Gathered:** 2026-03-14
**Status:** Ready for planning

<domain>
## Phase Boundary

Deliver a working SPA shell with Keycloak OAuth2 PKCE authentication, glassmorphism design system, skeleton loading infrastructure, responsive layout, smooth route transitions, and Docker deployment alongside the existing backend. No feature pages — just the app shell, auth flow, and design tokens that all subsequent phases build on.

</domain>

<decisions>
## Implementation Decisions

### Framework and Build
- React 19 + Vite 8 as foundation (research confirmed as standard 2025/2026 stack)
- TanStack Router for client-side routing (superior to React Router v7 for SPA-only apps — type-safe route params)
- TanStack Query 5.x for server state management (handles caching, pagination, background refetch)
- Zustand for minimal client-side UI state (theme, sidebar open, etc.)
- TypeScript throughout

### Glassmorphism Design System
- Black (#000000) base background — all pages
- Royal purple (#7851A9) as primary accent color
- Frosted glass panels: backdrop-filter blur, semi-transparent backgrounds (rgba with alpha), subtle luminous borders
- CSS custom properties (design tokens) for glass parameters: --glass-blur, --glass-bg-opacity, --glass-border-opacity — parameterized, not hardcoded
- Maximum 3-5 glass elements per viewport to respect GPU budget on mobile devices
- Establish "glass vs solid" rules: navigation, cards, modals get glass treatment; form inputs, buttons, small elements stay solid
- Tailwind CSS 4.x for utility classes — native backdrop-blur-* and bg-*/opacity utilities map directly to glassmorphism
- Dark mode is the only mode — no light mode toggle needed

### Skeleton Loading Infrastructure
- Reusable skeleton components matching glassmorphism style (semi-transparent shimmer on dark background)
- 200-300ms delay before showing skeleton (prevents flicker on fast loads)
- 500ms minimum display time once shown (prevents flash)
- TanStack Query's isLoading/isPending states drive skeleton visibility

### Authentication (Keycloak PKCE)
- react-oidc-context + oidc-client-ts for OAuth2 PKCE flow (modern standard, replaces legacy keycloak-js adapter)
- Keycloak at http://localhost:8180/realms/cookbook (browser-accessible URL, NOT Docker hostname)
- Silent token renewal via iframe (no user-visible re-auth)
- Bearer token passed to all API calls via Authorization header
- Protected route wrapper component — unauthenticated users redirect to Keycloak login
- Admin nav items visible only to users with ADMIN role from JWT claims
- Token stored in memory only (not localStorage) to avoid XSS vectors

### App Shell Layout
- Top navigation bar with: app logo/name, main nav links, user avatar/menu, login/logout
- Sidebar for tag navigation (collapsible on mobile)
- Main content area with route transitions (subtle fade animations)
- Mobile: bottom navigation bar, hamburger menu for secondary nav
- Responsive breakpoints: mobile-first, tablet (768px), desktop (1024px)

### Docker Deployment
- Multi-stage Docker build: Node.js build stage → nginx serving static assets
- nginx config with `try_files $uri /index.html` for SPA client-side routing
- Runtime environment variable injection (not build-time) — shell script generates config.js at container startup
- Environment vars: VITE_API_BASE_URL, VITE_KEYCLOAK_URL, VITE_KEYCLOAK_REALM, VITE_KEYCLOAK_CLIENT_ID
- Join existing cookbook-network from backend docker-compose
- nginx reverse proxy for /api/* to backend service (eliminates CORS issues entirely)

### Route Transitions
- CSS-based fade transitions between routes (no heavy animation libraries)
- Keep transitions subtle and fast (150-200ms) — premium feel without slowing navigation

### Claude's Discretion
- Exact Tailwind color palette extensions beyond the primary purple
- Skeleton shimmer animation implementation details
- Exact glass blur values (start with 12px, tune based on content)
- nginx configuration specifics (caching, gzip, security headers)
- Folder structure details within Feature-Sliced Design pattern
- Zustand store structure

</decisions>

<specifics>
## Specific Ideas

- User explicitly requested "glass based frontend design with transparencies" — glassmorphism is the defining visual identity, not optional polish
- "Black and royal purple as accent colors" — black is the base, purple is the accent. Not a purple-heavy theme
- "Dynamic js calls with load skeletons" — every piece of API-fetched content must show skeletons, not spinners or blank space
- "Smooth website browsing experience without site reloads" — SPA with client-side routing is non-negotiable
- "Runnable via docker" — must integrate into the existing backend docker-compose setup
- Backend API base: http://localhost:8080/api/v1/ with Swagger at /swagger-ui.html
- Backend uses Spring Data pagination format (page, size, sort params)

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- None — greenfield project, no existing frontend code

### Established Patterns
- Backend uses Spring Modulith with 10 API modules — frontend API layer should mirror this structure
- Backend uses standard REST conventions: 201 for creation, 204 for deletion, paginated list responses
- Keycloak realm: "cookbook", roles: USER, ADMIN

### Integration Points
- Backend docker-compose.yml at /mnt/c/Users/Lukas/IdeaProjects/Cookbook/docker-compose.yml — frontend must extend or complement this
- Keycloak runs on port 8180, backend on 8080 — frontend should serve on port 3000 (dev) or 80 (nginx production)
- cookbook-network bridge network — frontend container joins this

</code_context>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 01-foundation-and-authentication*
*Context gathered: 2026-03-14*
