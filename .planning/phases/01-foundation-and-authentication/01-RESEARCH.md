# Phase 1: Foundation and Authentication - Research

**Researched:** 2026-03-14
**Domain:** React SPA foundation with Keycloak PKCE authentication, glassmorphism design system, Docker/nginx deployment
**Confidence:** HIGH

## Summary

Phase 1 establishes the entire application foundation: React 19 + Vite 8 project scaffold, TanStack Router file-based routing with auth guards, react-oidc-context for Keycloak PKCE authentication, Tailwind CSS v4 with glassmorphism design tokens, skeleton loading infrastructure, responsive app shell layout, and Docker multi-stage build with nginx. This is a greenfield project with no existing code.

The primary risks are in the Keycloak PKCE integration (CORS alignment, token refresh, browser-vs-container URL confusion) and the glassmorphism performance budget (backdrop-filter GPU cost on mobile). The runtime environment variable injection pattern for Docker is the third critical area that must be designed before any feature code references configuration.

**Primary recommendation:** Build in strict order: project scaffold and design tokens first, then auth integration (test token refresh explicitly), then app shell layout, then Docker deployment. Do not defer Docker or auth to the end -- they are harder to retrofit.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- React 19 + Vite 8 as foundation
- TanStack Router for client-side routing (file-based, type-safe)
- TanStack Query 5.x for server state management
- Zustand for minimal client-side UI state
- TypeScript throughout
- Black (#000000) base background, royal purple (#7851A9) accent
- Frosted glass panels with CSS custom properties (design tokens): --glass-blur, --glass-bg-opacity, --glass-border-opacity
- Maximum 3-5 glass elements per viewport (GPU budget)
- Glass vs solid rules: navigation, cards, modals get glass; form inputs, buttons stay solid
- Tailwind CSS 4.x for utility classes
- Dark mode only (no light mode toggle)
- Skeleton loading with 200-300ms delay, 500ms minimum display time
- react-oidc-context + oidc-client-ts for OAuth2 PKCE (NOT keycloak-js)
- Keycloak at http://localhost:8180/realms/cookbook (browser-accessible URL)
- Silent token renewal via iframe
- Bearer token in Authorization header on all API calls
- Token stored in memory only (NOT localStorage)
- Protected route wrapper component
- Admin nav items visible only to ADMIN role users
- Top nav bar + collapsible sidebar + main content area
- Mobile: bottom nav bar, hamburger menu
- Responsive: mobile-first, tablet (768px), desktop (1024px)
- Multi-stage Docker build: Node.js build -> nginx static
- Runtime environment variable injection (NOT build-time)
- nginx reverse proxy for /api/* to backend (eliminates CORS)
- CSS-based fade transitions between routes (150-200ms, no heavy animation libraries)
- Join existing cookbook-network from backend docker-compose

### Claude's Discretion
- Exact Tailwind color palette extensions beyond the primary purple
- Skeleton shimmer animation implementation details
- Exact glass blur values (start with 12px, tune based on content)
- nginx configuration specifics (caching, gzip, security headers)
- Folder structure details within Feature-Sliced Design pattern
- Zustand store structure

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| FOUND-01 | App runs as SPA with client-side routing -- no full page reloads | TanStack Router file-based routing with Vite plugin; autoCodeSplitting for lazy routes |
| FOUND-02 | Glassmorphism design system with frosted glass panels, backdrop blur, semi-transparent backgrounds | CSS custom properties token system; GlassPanel/GlassCard components; Tailwind backdrop-blur-* utilities |
| FOUND-03 | Black (#000000) background with royal purple (#7851A9) accent color scheme throughout | Design tokens in CSS; Tailwind @theme directive for custom colors |
| FOUND-04 | Skeleton loading states displayed on all API-fetched content before data arrives | Delayed skeleton pattern (200ms delay, 500ms min display); useDelayedLoading hook |
| FOUND-05 | Responsive design -- mobile-first layout with desktop adaptation | Tailwind responsive prefixes (sm:, md:, lg:); mobile-first breakpoints |
| FOUND-06 | Docker container serving static assets via nginx, integrated with backend docker-compose | Multi-stage build; runtime env injection via entrypoint.sh; try_files for SPA; cookbook-network |
| FOUND-07 | Smooth page transitions between routes (fade/slide animations) | CSS transitions on route Outlet; 150-200ms fade; View Transitions API as future option |
| AUTH-01 | User can log in via Keycloak OAuth2 PKCE redirect flow | react-oidc-context AuthProvider with authority/client_id/redirect_uri; signinRedirect() |
| AUTH-02 | User session persists across page refresh via silent token renewal | automaticSilentRenew: true in oidc config; silent_redirect_uri for iframe-based renewal |
| AUTH-03 | User can log out from any page | auth.signoutRedirect() via useAuth() hook; accessible from nav bar user menu |
| AUTH-04 | Protected routes redirect unauthenticated users to login | TanStack Router beforeLoad guard checks auth context; throws redirect to login |
| AUTH-05 | User role (USER/ADMIN) reflected in UI | auth.user.profile.realm_access.roles from JWT claims; conditional nav rendering |
</phase_requirements>

## Standard Stack

### Core (Phase 1 specific)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| React | 19.2.x | UI framework | Latest stable; improved Suspense boundaries for skeleton loading |
| Vite | 8.x | Build tool + dev server | Rolldown bundler, Oxc compiler; sub-second HMR |
| TypeScript | ~5.7 | Type safety | Required by TanStack Router for type-safe route params |
| TanStack Router | 1.x | File-based routing | Type-safe params/search params; SPA-first with Vite plugin |
| TanStack Query | 5.x | Server state | Cache, background refetch, loading states drive skeletons |
| Zustand | 5.x | Client UI state | Sidebar state, UI preferences only |
| Tailwind CSS | 4.x | Utility CSS | CSS-first config; native backdrop-blur-* for glassmorphism |
| react-oidc-context | 3.x | React auth provider | Wraps oidc-client-ts; useAuth() hook; AuthProvider context |
| oidc-client-ts | 3.x | OIDC protocol | PKCE flow, token lifecycle, silent renew |
| ky | 1.14.x | HTTP client | Fetch-based; beforeRequest hook for Bearer token injection |
| clsx | latest | Conditional classes | Tailwind class composition |
| tailwind-merge | latest | Class conflict resolution | Prevents Tailwind class conflicts in reusable components |
| Lucide React | latest | Icons | Tree-shakable; consistent style |

### Dev Dependencies

| Library | Version | Purpose |
|---------|---------|---------|
| @tanstack/router-plugin | latest | Vite plugin for file-based route generation |
| @tanstack/react-query-devtools | latest | Query cache inspection in dev |
| @tailwindcss/vite | latest | Tailwind v4 Vite plugin |
| @vitejs/plugin-react | latest | React Fast Refresh in Vite |
| Vitest | 3.x | Unit/integration testing |
| @testing-library/react | latest | Component testing |

**Installation:**
```bash
# Initialize project
npm create vite@latest cookbook-web-frontend -- --template react-ts

# Core
npm install react react-dom @tanstack/react-router @tanstack/react-query
npm install ky zustand react-oidc-context oidc-client-ts
npm install lucide-react clsx tailwind-merge

# Styling
npm install tailwindcss @tailwindcss/vite

# Dev
npm install -D typescript @types/react @types/react-dom
npm install -D @tanstack/router-plugin @tanstack/react-query-devtools
npm install -D @vitejs/plugin-react
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom
```

## Architecture Patterns

### Project Structure (Feature-Sliced Design adapted for Phase 1)

Phase 1 only builds the `app/` and `shared/` layers. Entities/features/pages come in later phases.

```
src/
├── app/                          # App shell
│   ├── providers/                # AuthProvider, QueryClientProvider, RouterProvider
│   ├── styles/                   # Global CSS, design tokens
│   └── App.tsx                   # Root component composing providers
│
├── routes/                       # TanStack Router file-based routes
│   ├── __root.tsx                # Root layout (nav bar, sidebar, outlet)
│   ├── index.tsx                 # Home page (placeholder for Phase 1)
│   ├── _authenticated.tsx        # Auth guard layout route
│   ├── _authenticated/           # Protected child routes
│   │   └── dashboard.tsx         # Placeholder protected page
│   └── login.tsx                 # Auth callback handling
│
├── shared/
│   ├── api/                      # ky client with auth interceptor
│   │   └── client.ts             # Configured ky instance
│   ├── auth/                     # Auth utilities
│   │   ├── oidc-config.ts        # OIDC configuration
│   │   ├── AuthGuard.tsx         # Route protection component
│   │   └── useAuthRoles.ts       # Role-checking hook
│   ├── config/                   # Runtime configuration
│   │   └── env.ts                # Read from window.__APP_CONFIG__
│   ├── ui/                       # Design system primitives
│   │   ├── tokens.css            # CSS custom properties
│   │   ├── GlassPanel.tsx        # Glass container component
│   │   ├── GlassCard.tsx         # Glass card component
│   │   ├── Skeleton.tsx          # Skeleton loader component
│   │   ├── useDelayedLoading.ts  # Skeleton delay/min-display hook
│   │   ├── AppLayout.tsx         # Top nav + sidebar + content
│   │   ├── NavBar.tsx            # Top navigation
│   │   ├── Sidebar.tsx           # Collapsible sidebar
│   │   ├── MobileNav.tsx         # Bottom navigation for mobile
│   │   └── ErrorBoundary.tsx     # Error boundary wrapper
│   └── lib/                      # Generic utilities
│       └── cn.ts                 # clsx + tailwind-merge helper
│
├── routeTree.gen.ts              # Auto-generated by TanStack Router plugin
├── main.tsx                      # Entry point
└── index.css                     # Tailwind import + global styles
```

### Pattern 1: TanStack Router File-Based Routing with Auth Context

**What:** File-based routes with typed auth context passed through the router.
**When:** All route files; auth guard via layout routes.

```typescript
// src/routes/__root.tsx
import { createRootRouteWithContext, Outlet } from '@tanstack/react-router'
import type { AuthContextProps } from 'react-oidc-context'
import { AppLayout } from '@/shared/ui/AppLayout'

type RouterContext = {
  auth: AuthContextProps
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: () => (
    <AppLayout>
      <Outlet />
    </AppLayout>
  ),
})
```

```typescript
// src/routes/_authenticated.tsx
import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated')({
  beforeLoad: ({ context }) => {
    if (!context.auth.isAuthenticated) {
      // Trigger Keycloak login redirect
      context.auth.signinRedirect()
      // Throw to prevent rendering
      throw redirect({ to: '/' })
    }
  },
  component: () => <Outlet />,
})
```

```typescript
// src/main.tsx
import { createRouter, RouterProvider } from '@tanstack/react-router'
import { routeTree } from './routeTree.gen'
import { useAuth } from 'react-oidc-context'

const router = createRouter({
  routeTree,
  context: { auth: undefined! },
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

function InnerApp() {
  const auth = useAuth()
  return <RouterProvider router={router} context={{ auth }} />
}
```

### Pattern 2: react-oidc-context Configuration for Keycloak PKCE

**What:** AuthProvider wrapping the app with Keycloak-specific OIDC configuration.
**When:** App initialization in main.tsx.

```typescript
// src/shared/auth/oidc-config.ts
import type { AuthProviderProps } from 'react-oidc-context'
import { getConfig } from '@/shared/config/env'

export function getOidcConfig(): AuthProviderProps {
  const config = getConfig()
  return {
    authority: `${config.keycloakUrl}/realms/${config.keycloakRealm}`,
    client_id: config.keycloakClientId,
    redirect_uri: window.location.origin,
    post_logout_redirect_uri: window.location.origin,
    scope: 'openid profile',
    automaticSilentRenew: true,
    onSigninCallback: () => {
      // Remove OIDC query params from URL after login callback
      window.history.replaceState({}, document.title, window.location.pathname)
    },
  }
}
```

```typescript
// src/main.tsx (provider wrapping)
import { AuthProvider } from 'react-oidc-context'
import { getOidcConfig } from '@/shared/auth/oidc-config'

const oidcConfig = getOidcConfig()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider {...oidcConfig}>
      <QueryClientProvider client={queryClient}>
        <InnerApp />
      </QueryClientProvider>
    </AuthProvider>
  </StrictMode>
)
```

### Pattern 3: Bearer Token Injection with ky

**What:** HTTP client that automatically attaches the Bearer token from react-oidc-context.
**When:** All API calls through the shared client.

```typescript
// src/shared/api/client.ts
import ky from 'ky'
import { getConfig } from '@/shared/config/env'
import { User } from 'oidc-client-ts'

function getStoredUser(): User | null {
  const config = getConfig()
  const key = `oidc.user:${config.keycloakUrl}/realms/${config.keycloakRealm}:${config.keycloakClientId}`
  const stored = sessionStorage.getItem(key)
  return stored ? User.fromStorageString(stored) : null
}

export const apiClient = ky.create({
  prefixUrl: getConfig().apiBaseUrl,
  hooks: {
    beforeRequest: [
      (request) => {
        const user = getStoredUser()
        if (user?.access_token) {
          request.headers.set('Authorization', `Bearer ${user.access_token}`)
        }
      },
    ],
  },
})
```

**Note:** For in-component usage where `useAuth()` is available, prefer passing the token directly. The ky instance pattern above is for use outside React component tree (e.g., in TanStack Query queryFn functions).

### Pattern 4: Runtime Environment Configuration

**What:** Runtime config injection for Docker -- not build-time env vars.
**When:** Any code that needs API URL, Keycloak URL, etc.

```typescript
// src/shared/config/env.ts
interface AppConfig {
  apiBaseUrl: string
  keycloakUrl: string
  keycloakRealm: string
  keycloakClientId: string
}

declare global {
  interface Window {
    __APP_CONFIG__?: AppConfig
  }
}

const defaultConfig: AppConfig = {
  apiBaseUrl: '/api/v1',
  keycloakUrl: 'http://localhost:8180',
  keycloakRealm: 'cookbook',
  keycloakClientId: 'cookbook-frontend',
}

export function getConfig(): AppConfig {
  return window.__APP_CONFIG__ ?? defaultConfig
}
```

```html
<!-- index.html -- placeholders replaced by entrypoint.sh at container start -->
<script>
  window.__APP_CONFIG__ = {
    apiBaseUrl: "__API_BASE_URL__",
    keycloakUrl: "__KEYCLOAK_URL__",
    keycloakRealm: "__KEYCLOAK_REALM__",
    keycloakClientId: "__KEYCLOAK_CLIENT_ID__",
  };
</script>
```

```bash
#!/bin/sh
# docker/entrypoint.sh
sed -i "s|__API_BASE_URL__|${API_BASE_URL:-/api/v1}|g" /usr/share/nginx/html/index.html
sed -i "s|__KEYCLOAK_URL__|${KEYCLOAK_URL:-http://localhost:8180}|g" /usr/share/nginx/html/index.html
sed -i "s|__KEYCLOAK_REALM__|${KEYCLOAK_REALM:-cookbook}|g" /usr/share/nginx/html/index.html
sed -i "s|__KEYCLOAK_CLIENT_ID__|${KEYCLOAK_CLIENT_ID:-cookbook-frontend}|g" /usr/share/nginx/html/index.html
exec "$@"
```

### Pattern 5: Skeleton Delay Hook

**What:** Prevents skeleton flicker on fast loads; enforces minimum display time.
**When:** Every component that shows skeleton loading states.

```typescript
// src/shared/ui/useDelayedLoading.ts
import { useState, useEffect, useRef } from 'react'

export function useDelayedLoading(
  isLoading: boolean,
  { delay = 250, minDisplay = 500 }: { delay?: number; minDisplay?: number } = {}
): boolean {
  const [showSkeleton, setShowSkeleton] = useState(false)
  const showTimeRef = useRef<number>(0)

  useEffect(() => {
    if (isLoading) {
      const timer = setTimeout(() => {
        setShowSkeleton(true)
        showTimeRef.current = Date.now()
      }, delay)
      return () => clearTimeout(timer)
    } else if (showSkeleton) {
      const elapsed = Date.now() - showTimeRef.current
      const remaining = Math.max(0, minDisplay - elapsed)
      const timer = setTimeout(() => setShowSkeleton(false), remaining)
      return () => clearTimeout(timer)
    }
  }, [isLoading, delay, minDisplay, showSkeleton])

  return showSkeleton
}
```

### Pattern 6: Role Checking from JWT Claims

**What:** Extract Keycloak realm roles from the OIDC user profile.
**When:** Conditional UI rendering (admin nav), role-based route guards.

```typescript
// src/shared/auth/useAuthRoles.ts
import { useAuth } from 'react-oidc-context'

interface KeycloakTokenClaims {
  realm_access?: {
    roles?: string[]
  }
}

export function useAuthRoles() {
  const auth = useAuth()
  const claims = auth.user?.profile as KeycloakTokenClaims | undefined
  const roles = claims?.realm_access?.roles ?? []

  return {
    roles,
    isAdmin: roles.includes('ADMIN'),
    isUser: roles.includes('USER'),
    hasRole: (role: string) => roles.includes(role),
  }
}
```

**Important:** Keycloak includes `realm_access.roles` in the ID token by default. If roles are missing, a client scope mapper must be configured in Keycloak to include `realm_access` in the ID token claims.

### Pattern 7: Tailwind CSS v4 Configuration

**What:** CSS-first configuration with @theme directive for design tokens.
**When:** Project setup.

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { TanStackRouterVite } from '@tanstack/router-plugin/vite'

export default defineConfig({
  plugins: [
    TanStackRouterVite({
      target: 'react',
      autoCodeSplitting: true,
    }),
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': '/src',
    },
  },
})
```

```css
/* src/index.css */
@import "tailwindcss";

@theme {
  --color-bg: #000000;
  --color-accent: #7851A9;
  --color-accent-light: #9B7BC7;
  --color-accent-dark: #5C3D82;
  --color-glass-bg: rgba(255, 255, 255, 0.05);
  --color-glass-border: rgba(255, 255, 255, 0.1);
}
```

**Note on plugin order:** `TanStackRouterVite` should come before `react()` in the plugins array per TanStack Router documentation.

### Anti-Patterns to Avoid

- **Using keycloak-js directly:** The project decided on react-oidc-context + oidc-client-ts. Do NOT import keycloak-js.
- **Storing tokens in localStorage:** Use in-memory storage via oidc-client-ts. For session persistence, rely on `automaticSilentRenew` with iframe.
- **Build-time env vars for config:** Never use `import.meta.env.VITE_*` for URLs that change per environment. Use the `window.__APP_CONFIG__` pattern.
- **More than 5 glass elements per viewport:** GPU budget violation. List views use solid semi-transparent backgrounds, not blur.
- **Animating backdrop-filter:** Animate opacity or transform instead. backdrop-filter animation is extremely expensive.
- **Separate skeleton components disconnected from real layout:** Skeletons must match final component dimensions to avoid layout shift.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| OIDC PKCE flow | Custom fetch to token endpoint | react-oidc-context + oidc-client-ts | PKCE code verifier, state, nonce management is security-critical |
| Token refresh mutex | Custom 401 interceptor with retry queue | oidc-client-ts automaticSilentRenew | Race conditions on concurrent 401s; oidc-client-ts handles internally |
| Route code splitting | Manual React.lazy() per route | TanStack Router autoCodeSplitting | Plugin handles it automatically with file-based routes |
| CSS class merging | String concatenation for Tailwind | clsx + tailwind-merge (cn() utility) | Prevents class conflicts like `p-2 p-4` keeping both |
| SPA routing in nginx | Custom nginx location blocks per route | `try_files $uri $uri/ /index.html` | One line handles all current and future routes |
| Route type safety | Manual type assertions for params | TanStack Router generated types | routeTree.gen.ts provides compile-time safety |

## Common Pitfalls

### Pitfall 1: Keycloak URL -- Browser vs Container
**What goes wrong:** Config uses Docker hostname `http://keycloak:8180` which the browser cannot resolve. Login redirects fail with DNS error.
**Why:** Frontend JavaScript runs in the browser, not in Docker. Keycloak URL must be browser-accessible.
**How to avoid:** Always use `http://localhost:8180` (dev) or public domain (prod) for the Keycloak URL in frontend config. Backend can use Docker hostname.
**Warning signs:** `ERR_NAME_NOT_RESOLVED` in browser console pointing to `keycloak:8180`.

### Pitfall 2: Silent Renew Fails Due to Missing CORS/Web Origins
**What goes wrong:** Login works but after access token expires (5 min default), API calls start returning 401. User appears randomly logged out.
**Why:** Silent renew is a background XHR to Keycloak's token endpoint. If Keycloak client Web Origins do not include the frontend origin, CORS blocks it. Login uses full-page redirect (no CORS needed), hiding the misconfiguration.
**How to avoid:** Set Keycloak client Web Origins to `+` (auto from redirect URIs) or explicitly `http://localhost:3000`. Test by setting access token lifespan to 1 minute and waiting.
**Warning signs:** Failed OPTIONS requests to Keycloak in Network tab after 5 minutes.

### Pitfall 3: onSigninCallback Not Clearing URL Params
**What goes wrong:** After Keycloak login redirect, the URL contains `?code=...&state=...&session_state=...` query parameters. Page looks wrong, bookmarking captures auth params.
**Why:** react-oidc-context requires `onSigninCallback` to clean up the URL after processing the auth code. Without it, query params persist.
**How to avoid:** Always provide `onSigninCallback` that calls `window.history.replaceState({}, document.title, window.location.pathname)`.

### Pitfall 4: Nginx 404 on Page Refresh
**What goes wrong:** User refreshes on `/recipes/42` and gets nginx 404.
**Why:** nginx looks for a physical file at that path. Client-side routing only works when JS is loaded.
**How to avoid:** `try_files $uri $uri/ /index.html;` in nginx config. Also add a catch-all 404 route in TanStack Router.

### Pitfall 5: Backdrop-Filter Performance on Mobile
**What goes wrong:** Glassmorphism stutters on mid-range phones. Scrolling recipe lists becomes a slideshow.
**Why:** Each backdrop-filter: blur() element requires GPU compositing. 10+ elements = frame drops.
**How to avoid:** Max 3-5 glass elements per viewport. List item cards use solid `bg-white/5` without blur. Reserve true blur for nav, modals, detail headers. Never animate backdrop-filter.

### Pitfall 6: Build-Time Env Vars Locked in Docker Image
**What goes wrong:** Same Docker image cannot be used across dev/staging/prod because API/Keycloak URLs are baked in at build time.
**Why:** `import.meta.env.VITE_*` values are string-replaced during `vite build`.
**How to avoid:** Use the `window.__APP_CONFIG__` + `entrypoint.sh` sed pattern. No VITE_ env vars for runtime config.

### Pitfall 7: realm_access Roles Not in ID Token
**What goes wrong:** `auth.user.profile.realm_access` is undefined. Admin role check always fails.
**Why:** By default Keycloak may not include `realm_access` in the ID token (it is in the access token). The ID token is what react-oidc-context exposes via `user.profile`.
**How to avoid:** In Keycloak admin, create a client scope mapper: Protocol Mapper > "realm roles" > Token Claim Name: `realm_access.roles` > Add to ID token: ON. Alternatively, decode the access token client-side.

### Pitfall 8: TanStack Router Plugin Order in vite.config.ts
**What goes wrong:** Routes not generated or HMR breaks.
**Why:** TanStackRouterVite must be listed before the React plugin in the Vite plugins array.
**How to avoid:** Always: `plugins: [TanStackRouterVite(), react(), tailwindcss()]`

## Code Examples

### Glassmorphism GlassPanel Component

```typescript
// src/shared/ui/GlassPanel.tsx
import { cn } from '@/shared/lib/cn'

interface GlassPanelProps {
  children: React.ReactNode
  intensity?: 'light' | 'medium' | 'heavy'
  className?: string
  as?: React.ElementType
}

const intensityClasses = {
  light: 'backdrop-blur-sm bg-white/[0.03] border-white/[0.06]',
  medium: 'backdrop-blur-md bg-white/[0.05] border-white/[0.10]',
  heavy: 'backdrop-blur-lg bg-white/[0.08] border-white/[0.15]',
} as const

export function GlassPanel({
  children,
  intensity = 'medium',
  className,
  as: Component = 'div',
}: GlassPanelProps) {
  return (
    <Component
      className={cn(
        'rounded-2xl border shadow-lg shadow-black/40',
        intensityClasses[intensity],
        className
      )}
    >
      {children}
    </Component>
  )
}
```

### cn() Utility

```typescript
// src/shared/lib/cn.ts
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

### Skeleton Component with Shimmer

```typescript
// src/shared/ui/Skeleton.tsx
import { cn } from '@/shared/lib/cn'

interface SkeletonProps {
  className?: string
  variant?: 'text' | 'circular' | 'rectangular'
  width?: string | number
  height?: string | number
  lines?: number
}

export function Skeleton({
  className,
  variant = 'text',
  width,
  height,
  lines = 1,
}: SkeletonProps) {
  const baseClasses =
    'animate-shimmer bg-gradient-to-r from-white/[0.06] via-white/[0.12] to-white/[0.06] bg-[length:200%_100%]'

  const variantClasses = {
    text: 'h-4 rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-lg',
  }

  if (lines > 1) {
    return (
      <div className={cn('space-y-2', className)}>
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={cn(baseClasses, variantClasses.text)}
            style={{
              width: i === lines - 1 ? '60%' : width ?? '100%',
              height,
            }}
          />
        ))}
      </div>
    )
  }

  return (
    <div
      className={cn(baseClasses, variantClasses[variant], className)}
      style={{ width: width ?? '100%', height }}
    />
  )
}
```

```css
/* Shimmer animation in index.css */
@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* Add to Tailwind via @theme or @utility */
@utility animate-shimmer {
  animation: shimmer 1.5s ease-in-out infinite;
}
```

### Docker Multi-Stage Build

```dockerfile
# Dockerfile
# Stage 1: Build
FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Serve
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY docker/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh
EXPOSE 80
ENTRYPOINT ["/entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]
```

```nginx
# docker/nginx.conf
server {
    listen 80;
    server_name _;
    root /usr/share/nginx/html;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_types text/css application/javascript application/json image/svg+xml;
    gzip_min_length 256;

    # SPA routing -- all routes serve index.html
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Reverse proxy API calls to backend (eliminates CORS)
    location /api/ {
        proxy_pass http://app:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Cache static assets aggressively
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff2?)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
}
```

### Route Transition CSS

```css
/* Simple fade transition on route outlet */
.route-enter {
  opacity: 0;
}
.route-enter-active {
  opacity: 1;
  transition: opacity 150ms ease-in;
}
.route-exit {
  opacity: 1;
}
.route-exit-active {
  opacity: 0;
  transition: opacity 150ms ease-out;
}
```

**Note:** TanStack Router does not have built-in transition support like React Router's `<AnimatePresence>`. Use CSS transitions on the Outlet wrapper div, or wrap with a simple transition component. The View Transitions API is an emerging alternative but not yet stable across all browsers.

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| tailwind.config.js | CSS-first @theme directive | Tailwind v4 (Jan 2025) | No JS config file needed; design tokens in CSS |
| keycloak-js adapter | react-oidc-context + oidc-client-ts | 2024 | Provider-agnostic, React hooks, better maintained |
| React Router v6 | TanStack Router 1.x | 2024-2025 | Full type safety, file-based routes, SPA-first |
| Create React App | Vite 8.x | 2023 (CRA deprecated) | CRA officially dead; Vite is the standard |
| Axios | ky | 2024-2025 | Fetch-based, smaller bundle, modern hooks API |
| Redux Toolkit | Zustand + TanStack Query | 2024-2025 | Server state in Query, only UI state in Zustand |
| VITE_* build env vars | Runtime window.__CONFIG__ | Ongoing | Single Docker image across environments |

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest 3.x |
| Config file | vitest.config.ts (Wave 0) |
| Quick run command | `npx vitest run --reporter=verbose` |
| Full suite command | `npx vitest run --coverage` |

### Phase Requirements to Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| FOUND-01 | SPA routing without page reloads | integration | `npx vitest run src/routes/ -x` | Wave 0 |
| FOUND-02 | GlassPanel renders with backdrop-blur classes | unit | `npx vitest run src/shared/ui/GlassPanel.test.tsx -x` | Wave 0 |
| FOUND-03 | Design tokens define correct colors | unit | `npx vitest run src/shared/ui/tokens.test.ts -x` | Wave 0 |
| FOUND-04 | Skeleton shows after delay, hides after min display | unit | `npx vitest run src/shared/ui/useDelayedLoading.test.ts -x` | Wave 0 |
| FOUND-05 | Layout adapts at breakpoints | manual-only | Visual inspection at 375/768/1024px | N/A |
| FOUND-06 | Docker container serves SPA and proxies API | integration | `docker compose up -d && curl -s http://localhost:3000` | Wave 0 |
| FOUND-07 | Route transitions have fade classes | unit | `npx vitest run src/shared/ui/RouteTransition.test.tsx -x` | Wave 0 |
| AUTH-01 | signinRedirect called for unauthenticated users | unit | `npx vitest run src/shared/auth/AuthGuard.test.tsx -x` | Wave 0 |
| AUTH-02 | automaticSilentRenew enabled in config | unit | `npx vitest run src/shared/auth/oidc-config.test.ts -x` | Wave 0 |
| AUTH-03 | Logout button calls signoutRedirect | unit | `npx vitest run src/shared/ui/NavBar.test.tsx -x` | Wave 0 |
| AUTH-04 | Protected route redirects unauthenticated | unit | `npx vitest run src/routes/_authenticated.test.tsx -x` | Wave 0 |
| AUTH-05 | Admin nav shows only for ADMIN role | unit | `npx vitest run src/shared/auth/useAuthRoles.test.ts -x` | Wave 0 |

### Sampling Rate
- **Per task commit:** `npx vitest run --reporter=verbose`
- **Per wave merge:** `npx vitest run --coverage`
- **Phase gate:** Full suite green before verification

### Wave 0 Gaps
- [ ] `vitest.config.ts` -- Vitest configuration with jsdom environment
- [ ] `src/test/setup.ts` -- Testing Library setup (jest-dom matchers)
- [ ] `src/test/mocks/auth.ts` -- Mock react-oidc-context AuthProvider
- [ ] All test files listed above -- none exist yet (greenfield project)

## Open Questions

1. **Keycloak client scope for realm_access in ID token**
   - What we know: Keycloak includes realm_access in access tokens by default. react-oidc-context exposes ID token claims via `user.profile`.
   - What's unclear: Whether the Keycloak "cookbook" realm already has a mapper configured to include realm_access in ID tokens.
   - Recommendation: Check Keycloak admin console. If not configured, add a "realm roles" protocol mapper to the client scope with "Add to ID token" enabled. Alternatively, decode the access token client-side using `auth.user?.access_token`.

2. **Docker compose integration approach**
   - What we know: Backend docker-compose.yml exists at `/mnt/c/Users/Lukas/IdeaProjects/Cookbook/docker-compose.yml` with cookbook-network.
   - What's unclear: Whether to extend the backend's docker-compose.yml or create a separate one with `networks: { cookbook-network: { external: true } }`.
   - Recommendation: Create a separate docker-compose.yml in the frontend repo that references cookbook-network as external. This keeps repos independent.

3. **oidc-client-ts token storage for silent renew**
   - What we know: Decision is "tokens in memory only." react-oidc-context uses oidc-client-ts's UserManager which defaults to sessionStorage for the user state (needed for silent renew to work across page refreshes).
   - What's unclear: Whether `automaticSilentRenew` via iframe works without any storage, or if sessionStorage is required for the session state (not the token itself, but the OIDC session reference).
   - Recommendation: Use sessionStorage for the OIDC state store (via `userStore: new WebStorageStateStore({ store: window.sessionStorage })`). This stores the user session reference (not raw tokens in a way vulnerable to XSS) and is cleared when the tab closes. This is the standard approach for "in-memory-like" security with session persistence.

## Sources

### Primary (HIGH confidence)
- [react-oidc-context GitHub](https://github.com/authts/react-oidc-context) -- AuthProvider API, useAuth() hook, withAuthenticationRequired HOC, onSigninCallback pattern
- [authts/sample-keycloak-react-oidc-context](https://github.com/authts/sample-keycloak-react-oidc-context) -- Official Keycloak + react-oidc-context sample with PKCE
- [TanStack Router Vite Installation](https://tanstack.com/router/latest/docs/installation/with-vite) -- Plugin setup, file-based routing defaults
- [Tailwind CSS v4 Announcement](https://tailwindcss.com/blog/tailwindcss-v4) -- CSS-first config, @theme directive, @tailwindcss/vite plugin
- [Tailwind CSS Vite Installation](https://tailwindcss.com/docs) -- Current installation steps

### Secondary (MEDIUM confidence)
- [TanStack Router Vite + Auth Routes](https://dev.to/khalid7487/configure-tanstack-router-into-vite-project-with-authenticate-routes-active-routes-2463) -- File-based auth guard pattern with beforeLoad, Zustand context
- [Runtime Env Vars Vite + Docker + Nginx](https://www.transcendsoftware.se/posts/enhancing-frontend-devops-runtime-env-vars-vite-docker-nginx) -- entrypoint.sh sed pattern, window config injection
- [Keycloak OIDC + PKCE for React](https://skycloak.io/blog/secure-react-api-access-using-keycloak-oidc-pkce/) -- Auth flow guidance, CORS configuration
- [Configuring CORS with Keycloak](https://skycloak.io/blog/configuring-cors-with-your-keycloak-oidc-client/) -- Web Origins configuration

### Tertiary (LOW confidence)
- [TanStack Router route transitions discussion](https://github.com/TanStack/router/discussions/823) -- Animation approaches; View Transitions API mentioned as future option

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- all libraries verified with npm/official docs, versions confirmed
- Architecture: HIGH -- Feature-Sliced Design and TanStack Router file-based routing are well-documented patterns
- Auth integration: HIGH -- react-oidc-context + Keycloak PKCE has official sample repo from authts org
- Glassmorphism: HIGH -- CSS backdrop-filter is well-understood; performance constraints documented
- Docker/nginx: HIGH -- standard multi-stage build pattern; runtime env var injection is established
- Pitfalls: HIGH -- all sourced from official docs, community issues, or well-documented web standards

**Research date:** 2026-03-14
**Valid until:** 2026-04-14 (stable ecosystem, 30-day validity)
