# Architecture Patterns

**Domain:** SPA frontend for REST API cookbook/meal-planning platform
**Researched:** 2026-03-14

## Recommended Architecture

**Pattern: Feature-Sliced Design (adapted) with TanStack Query data layer**

The application follows a modified Feature-Sliced Design (FSD) architecture. FSD organizes code by business domain rather than technical type, enforcing directional dependencies that prevent the spaghetti coupling common in large SPAs. The adaptation simplifies FSD's seven layers down to five (dropping `processes` as unnecessary for this domain and merging `widgets` into `pages` for a smaller team).

### High-Level System Diagram

```
+------------------+     +------------------+     +------------------+
|                  |     |                  |     |                  |
|   Keycloak       |<--->|   React SPA      |<--->|   Spring Boot    |
|   (port 8180)    |     |   (nginx :80)    |     |   API (port 8080)|
|                  |     |                  |     |                  |
+------------------+     +------------------+     +------------------+
        |                        |                        |
        |   OAuth2 PKCE          |   Bearer JWT           |
        |   redirect flow        |   on /api/v1/*         |
        +------------------------+------------------------+
```

### Application Internal Architecture

```
src/
├── app/                          # Layer 1: App shell
│   ├── providers/                # React context providers (auth, theme, query)
│   ├── router/                   # Route definitions, guards, lazy imports
│   ├── styles/                   # Global styles, CSS custom properties
│   └── App.tsx                   # Root component
│
├── pages/                        # Layer 2: Routable screens
│   ├── recipes/                  # /recipes, /recipes/:id, /recipes/new
│   │   ├── RecipeListPage.tsx
│   │   ├── RecipeDetailPage.tsx
│   │   ├── RecipeEditPage.tsx
│   │   └── components/           # Page-specific composed widgets
│   ├── meal-plans/               # /meal-plans, /meal-plans/:id
│   ├── ingredients/              # /ingredients
│   ├── profile/                  # /profile
│   ├── admin/                    # /admin/*
│   └── auth/                     # /login, /callback, /logout
│
├── features/                     # Layer 3: User-facing capabilities
│   ├── recipe-search/            # Search + filter UI, search state
│   │   ├── ui/
│   │   ├── model/
│   │   └── index.ts              # Public API barrel
│   ├── ingredient-scaling/       # Scale recipe ingredients by servings
│   ├── meal-plan-generator/      # Auto-generate meal plans
│   ├── shopping-list/            # Generate shopping list from plan
│   ├── recipe-rating/            # Multi-criteria rating UI
│   ├── recipe-sharing/           # Share via token link
│   ├── image-upload/             # Media upload for recipes
│   ├── tag-navigation/           # Hierarchical tag tree browser
│   └── favorites/                # Favorite recipes/ingredients
│
├── entities/                     # Layer 4: Business domain models
│   ├── recipe/
│   │   ├── api/                  # API functions (fetchRecipes, createRecipe)
│   │   ├── model/                # Types, query hooks, query keys
│   │   └── ui/                   # RecipeCard, RecipeListItem
│   ├── ingredient/
│   ├── meal-plan/
│   ├── allergen/
│   ├── rating/
│   ├── tag/
│   ├── unit/
│   ├── user/
│   └── media/
│
└── shared/                       # Layer 5: Framework-agnostic utilities
    ├── api/                      # Axios instance, interceptors, error handling
    ├── auth/                     # Keycloak client, token management, guards
    ├── ui/                       # Design system (Glass components)
    │   ├── GlassPanel.tsx
    │   ├── GlassCard.tsx
    │   ├── GlassButton.tsx
    │   ├── GlassInput.tsx
    │   ├── GlassModal.tsx
    │   ├── Skeleton.tsx
    │   ├── Layout.tsx
    │   └── tokens.css             # Design tokens (colors, blur, opacity)
    ├── lib/                      # Generic utilities (formatDate, debounce)
    └── config/                   # Environment config, API base URL, Keycloak config
```

### Dependency Rules (Strict)

```
app     --> pages, features, entities, shared
pages   --> features, entities, shared
features --> entities, shared
entities --> shared
shared  --> (nothing above)
```

**Violations of these rules create coupling debt.** Enforce via ESLint import restrictions or a bundler plugin.

## Component Boundaries

| Component | Responsibility | Communicates With |
|-----------|---------------|-------------------|
| **App Shell** (`app/`) | Bootstraps providers, router, auth init | Keycloak (redirect), all layers below |
| **Pages** (`pages/`) | Compose features + entities into screens, handle route params | Features, Entities, Shared UI |
| **Features** (`features/`) | Encapsulate user-facing capabilities with their own state | Entities (for data), Shared (for UI primitives) |
| **Entities** (`entities/`) | Own domain types, API calls, query hooks, and basic UI cards | Shared API client, Shared UI |
| **Shared API** (`shared/api/`) | Configured Axios instance with auth interceptor | Keycloak (for JWT), Spring Boot API |
| **Shared Auth** (`shared/auth/`) | Keycloak initialization, token lifecycle, auth guards | Keycloak server, App shell |
| **Design System** (`shared/ui/`) | Glass-morphism primitives, skeleton loaders, layout | Nothing (leaf dependency) |

## Data Flow

### Request/Response Flow

```
User Action
    |
    v
Page Component
    |
    v
Feature Hook (e.g., useRecipeSearch)
    |
    v
Entity Query Hook (e.g., useRecipes)   <-- TanStack Query manages cache
    |
    v
Entity API Function (e.g., recipeApi.getAll)
    |
    v
Shared API Client (Axios)
    |  - Injects Bearer token from Keycloak
    |  - Handles 401 -> token refresh
    |  - Handles errors -> normalized error objects
    v
Spring Boot API (/api/v1/recipes?page=0&size=20)
    |
    v
JSON Response
    |
    v
TanStack Query Cache (stale-while-revalidate)
    |
    v
Component re-renders with data (or skeleton while loading)
```

### Authentication Flow (PKCE)

```
1. User visits protected route
2. Auth guard checks Keycloak.authenticated
3. If not authenticated:
   a. Keycloak.login() redirects to Keycloak login page
   b. User authenticates at Keycloak (port 8180)
   c. Keycloak redirects back to /callback with authorization code
   d. keycloak-js exchanges code for tokens (PKCE, no client secret)
   e. Tokens stored in memory (NOT localStorage for security)
4. If authenticated:
   a. Axios interceptor reads Keycloak.token
   b. Attaches Authorization: Bearer <token> to every /api/v1/* request
   c. On 401: Keycloak.updateToken(30) attempts silent refresh
   d. If refresh fails: Keycloak.login() redirects to re-authenticate
```

### State Architecture

```
+-------------------------------+
|       Server State            |  TanStack Query
|  (recipes, ingredients, etc.) |  - Cache, background refetch
|  Lives in: TanStack Query     |  - Stale-while-revalidate
+-------------------------------+  - Optimistic updates for mutations
               |
+-------------------------------+
|       Client State            |  Zustand (minimal stores)
|  (UI preferences, filters,    |  - No server data here
|   sidebar open, theme mode)   |  - Persisted to localStorage
+-------------------------------+  - Small, focused stores
               |
+-------------------------------+
|       Auth State              |  Keycloak JS adapter
|  (tokens, user info, roles)   |  - In-memory only
|  Lives in: Keycloak instance  |  - Auto-refresh via silent check-sso
+-------------------------------+
               |
+-------------------------------+
|       URL State               |  React Router
|  (current page, search params,|  - Pagination: ?page=2&size=20
|   filters in query string)    |  - Filters: ?tags=pasta&sort=rating
+-------------------------------+  - Single source of truth for navigation
```

**Key principle:** Server state belongs in TanStack Query, NOT in Zustand/Redux. Zustand is only for ephemeral UI state. URL is the source of truth for anything shareable (pagination, filters, sort).

## Patterns to Follow

### Pattern 1: Entity API + Query Hook Factory

Each entity module exposes typed API functions and pre-built query hooks.

**What:** Centralize all API calls for a domain entity alongside their TanStack Query wrappers.
**When:** Every entity that fetches from the backend.
**Example:**

```typescript
// entities/recipe/api/recipeApi.ts
import { apiClient } from '@/shared/api/client';
import type { Recipe, RecipePage, CreateRecipeDto } from '../model/types';

export const recipeApi = {
  getAll: (params: { page: number; size: number; sort?: string }) =>
    apiClient.get<RecipePage>('/recipes', { params }),

  getById: (id: number) =>
    apiClient.get<Recipe>(`/recipes/${id}`),

  create: (dto: CreateRecipeDto) =>
    apiClient.post<Recipe>('/recipes', dto),

  update: (id: number, dto: Partial<CreateRecipeDto>) =>
    apiClient.put<Recipe>(`/recipes/${id}`, dto),

  delete: (id: number) =>
    apiClient.delete(`/recipes/${id}`),
};

// entities/recipe/model/queryKeys.ts
export const recipeKeys = {
  all: ['recipes'] as const,
  lists: () => [...recipeKeys.all, 'list'] as const,
  list: (params: Record<string, unknown>) =>
    [...recipeKeys.lists(), params] as const,
  details: () => [...recipeKeys.all, 'detail'] as const,
  detail: (id: number) => [...recipeKeys.details(), id] as const,
};

// entities/recipe/model/useRecipes.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { recipeApi } from '../api/recipeApi';
import { recipeKeys } from './queryKeys';

export function useRecipes(params: { page: number; size: number }) {
  return useQuery({
    queryKey: recipeKeys.list(params),
    queryFn: () => recipeApi.getAll(params),
  });
}

export function useRecipe(id: number) {
  return useQuery({
    queryKey: recipeKeys.detail(id),
    queryFn: () => recipeApi.getById(id),
    enabled: !!id,
  });
}

export function useCreateRecipe() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: recipeApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: recipeKeys.lists() });
    },
  });
}
```

### Pattern 2: Glassmorphism Design Token System

**What:** CSS custom properties define the glass effect parameters, consumed by all Glass* components.
**When:** Every UI component that uses the glassmorphism aesthetic.
**Example:**

```css
/* shared/ui/tokens.css */
:root {
  /* Base palette */
  --color-bg: #000000;
  --color-accent: #7851A9;
  --color-accent-light: #9B7BC7;
  --color-accent-dark: #5C3D82;
  --color-text: #FFFFFF;
  --color-text-muted: rgba(255, 255, 255, 0.7);

  /* Glass effect tokens */
  --glass-bg: rgba(255, 255, 255, 0.05);
  --glass-bg-hover: rgba(255, 255, 255, 0.08);
  --glass-bg-active: rgba(120, 81, 169, 0.15);
  --glass-border: rgba(255, 255, 255, 0.1);
  --glass-border-hover: rgba(120, 81, 169, 0.3);
  --glass-blur: 12px;
  --glass-blur-heavy: 20px;
  --glass-radius: 16px;
  --glass-radius-sm: 8px;
  --glass-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);

  /* Skeleton tokens */
  --skeleton-base: rgba(255, 255, 255, 0.06);
  --skeleton-shine: rgba(255, 255, 255, 0.12);
  --skeleton-duration: 1.5s;

  /* Spacing scale */
  --space-xs: 4px;
  --space-sm: 8px;
  --space-md: 16px;
  --space-lg: 24px;
  --space-xl: 32px;
  --space-2xl: 48px;
}
```

```typescript
// shared/ui/GlassPanel.tsx
interface GlassPanelProps {
  children: React.ReactNode;
  intensity?: 'light' | 'medium' | 'heavy';
  className?: string;
}

export function GlassPanel({ children, intensity = 'medium', className }: GlassPanelProps) {
  return (
    <div className={`glass-panel glass-panel--${intensity} ${className ?? ''}`}>
      {children}
    </div>
  );
}
```

### Pattern 3: Skeleton Loading Boundary

**What:** Every data-driven component has a skeleton variant shown while TanStack Query is loading.
**When:** All components that render server-fetched data.
**Example:**

```typescript
// entities/recipe/ui/RecipeCard.tsx
export function RecipeCard({ recipe }: { recipe: Recipe }) {
  return (
    <GlassCard>
      <img src={recipe.imageUrl} alt={recipe.title} />
      <h3>{recipe.title}</h3>
      <p>{recipe.description}</p>
    </GlassCard>
  );
}

// entities/recipe/ui/RecipeCardSkeleton.tsx
export function RecipeCardSkeleton() {
  return (
    <GlassCard>
      <Skeleton variant="image" height={200} />
      <Skeleton variant="text" width="70%" />
      <Skeleton variant="text" lines={2} />
    </GlassCard>
  );
}

// Usage in page
function RecipeListPage() {
  const { data, isLoading } = useRecipes({ page, size: 20 });
  return (
    <Grid>
      {isLoading
        ? Array.from({ length: 8 }).map((_, i) => <RecipeCardSkeleton key={i} />)
        : data.content.map(r => <RecipeCard key={r.id} recipe={r} />)}
    </Grid>
  );
}
```

### Pattern 4: Auth-Guarded Route Wrapper

**What:** Higher-order route component that redirects unauthenticated users to Keycloak.
**When:** All routes except public-facing ones (if any).
**Example:**

```typescript
// shared/auth/RequireAuth.tsx
import { useKeycloak } from '@react-keycloak/web';
import { Navigate } from 'react-router';

export function RequireAuth({ children, roles }: { children: ReactNode; roles?: string[] }) {
  const { keycloak, initialized } = useKeycloak();

  if (!initialized) return <FullPageSkeleton />;
  if (!keycloak.authenticated) {
    keycloak.login();
    return null;
  }
  if (roles && !roles.some(r => keycloak.hasRealmRole(r))) {
    return <Navigate to="/unauthorized" />;
  }
  return <>{children}</>;
}

// shared/auth/RequireRole.tsx - for admin routes
export function RequireAdmin({ children }: { children: ReactNode }) {
  return <RequireAuth roles={['admin']}>{children}</RequireAuth>;
}
```

### Pattern 5: Paginated List with URL-Driven State

**What:** Pagination parameters live in the URL, synced with TanStack Query.
**When:** Any paginated list (recipes, ingredients, users).
**Example:**

```typescript
function RecipeListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Number(searchParams.get('page') ?? '0');
  const size = Number(searchParams.get('size') ?? '20');
  const sort = searchParams.get('sort') ?? 'createdAt,desc';

  const { data, isLoading } = useRecipes({ page, size, sort });

  const goToPage = (newPage: number) => {
    setSearchParams(prev => { prev.set('page', String(newPage)); return prev; });
  };

  return (/* render with pagination controls */);
}
```

## Anti-Patterns to Avoid

### Anti-Pattern 1: God Store

**What:** Putting all application state (server data, UI state, auth) into a single Redux/Zustand store.
**Why bad:** Creates massive re-renders, unclear ownership, difficult testing. Server cache state has fundamentally different lifecycle than UI state.
**Instead:** TanStack Query for server state, Zustand for minimal UI state, Keycloak for auth state, URL for navigation state. Four distinct, purpose-built state containers.

### Anti-Pattern 2: API Calls in Components

**What:** Calling `fetch()` or `axios.get()` directly inside component useEffect hooks.
**Why bad:** No caching, no deduplication, no background refetch, manual loading/error state management, duplicated across components.
**Instead:** All API calls in entity `api/` modules, consumed through TanStack Query hooks in entity `model/` modules.

### Anti-Pattern 3: Token Storage in localStorage

**What:** Storing JWT access tokens or refresh tokens in localStorage or sessionStorage.
**Why bad:** Vulnerable to XSS attacks. Any injected script can read localStorage.
**Instead:** Keep tokens in the Keycloak JS adapter's in-memory state. Use `silent-check-sso` for session persistence across page refreshes via a hidden iframe.

### Anti-Pattern 4: Prop Drilling Through Glass Components

**What:** Passing data 4-5 levels deep through glass UI wrapper components.
**Why bad:** Glass components should be purely presentational. Threading business data through them couples design to domain.
**Instead:** Features compose Glass primitives with domain data at the feature level. Glass components receive only display props (children, variant, className).

### Anti-Pattern 5: Monolithic CSS for Glassmorphism

**What:** One massive CSS file with all glass effects, backgrounds, blur values hard-coded per component.
**Why bad:** Inconsistent glass effects, impossible to adjust design language globally, performance issues from excessive blur.
**Instead:** Design tokens in CSS custom properties. Glass primitives in shared/ui consume tokens. Override tokens per context via CSS variable scoping if needed.

## Routing Strategy

### Route Structure

```typescript
// app/router/routes.tsx
import { lazy } from 'react';
import { createBrowserRouter } from 'react-router';

const RecipeListPage = lazy(() => import('@/pages/recipes/RecipeListPage'));
const RecipeDetailPage = lazy(() => import('@/pages/recipes/RecipeDetailPage'));
const RecipeEditPage = lazy(() => import('@/pages/recipes/RecipeEditPage'));
const MealPlanListPage = lazy(() => import('@/pages/meal-plans/MealPlanListPage'));
const MealPlanDetailPage = lazy(() => import('@/pages/meal-plans/MealPlanDetailPage'));
const IngredientsPage = lazy(() => import('@/pages/ingredients/IngredientsPage'));
const ProfilePage = lazy(() => import('@/pages/profile/ProfilePage'));
const AdminDashboard = lazy(() => import('@/pages/admin/AdminDashboard'));

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,             // Glass sidebar + top bar
    children: [
      { index: true, element: <RecipeListPage /> },
      { path: 'recipes', element: <RecipeListPage /> },
      { path: 'recipes/new', element: <RequireAuth><RecipeEditPage /></RequireAuth> },
      { path: 'recipes/:id', element: <RecipeDetailPage /> },
      { path: 'recipes/:id/edit', element: <RequireAuth><RecipeEditPage /></RequireAuth> },
      { path: 'meal-plans', element: <RequireAuth><MealPlanListPage /></RequireAuth> },
      { path: 'meal-plans/:id', element: <RequireAuth><MealPlanDetailPage /></RequireAuth> },
      { path: 'ingredients', element: <IngredientsPage /> },
      { path: 'profile', element: <RequireAuth><ProfilePage /></RequireAuth> },
      {
        path: 'admin',
        element: <RequireAdmin><Outlet /></RequireAdmin>,
        children: [
          { index: true, element: <AdminDashboard /> },
          { path: 'users', lazy: () => import('@/pages/admin/AdminUsersPage') },
          { path: 'config', lazy: () => import('@/pages/admin/AdminConfigPage') },
          { path: 'ratings', lazy: () => import('@/pages/admin/AdminRatingsPage') },
        ],
      },
    ],
  },
  { path: '/callback', element: <AuthCallbackPage /> },
  { path: '/unauthorized', element: <UnauthorizedPage /> },
  { path: '*', element: <NotFoundPage /> },
]);
```

All page components are lazy-loaded. React Router v7 handles code splitting automatically. Admin sub-pages use the nested `lazy` import pattern for additional splitting since most users never visit admin.

## Docker / Deployment Architecture

```
docker-compose.yml (extended)
├── frontend (nginx:alpine)
│   ├── Serves built SPA static files
│   ├── nginx.conf:
│   │   ├── / -> /usr/share/nginx/html (SPA files)
│   │   ├── try_files $uri /index.html (client-side routing)
│   │   └── /api/v1/ -> proxy_pass http://app:8080 (API proxy)
│   └── Port: 3000 (or 80)
├── app (Spring Boot, port 8080)
├── mariadb (port 3306)
└── keycloak (port 8180)
All on: cookbook-network
```

**nginx reverse proxy pattern:** The frontend nginx proxies `/api/v1/` requests to the backend. This eliminates CORS configuration entirely -- the browser sees one origin. Keycloak requests go directly from the browser to port 8180 (separate origin, but Keycloak handles its own CORS).

## Scalability Considerations

| Concern | At 1 user (dev) | At 100 users | At 10K users |
|---------|-----------------|--------------|--------------|
| Caching | TanStack Query defaults | Tune staleTime per entity | Add HTTP cache headers, CDN for static |
| Bundle size | Not critical | Route-based code splitting | + Component-level splitting, tree shaking audit |
| Images | Direct upload | Resize on upload | CDN, lazy loading, responsive srcset |
| Auth | Single Keycloak | Same | Keycloak clustering (backend concern) |
| API calls | No optimization needed | Debounce search, pagination | Request deduplication, prefetching |

## Suggested Build Order

Build order follows the dependency graph (shared first, app shell last):

```
Phase 1: Foundation (no API yet)
  shared/ui/       -> Design system (Glass components, tokens, skeleton)
  shared/config/   -> Environment variables, API base URL
  shared/api/      -> Axios client with interceptors (mock responses)
  shared/auth/     -> Keycloak init, RequireAuth guard
  app/             -> App shell, providers, router skeleton

Phase 2: Core Entities (API integration)
  entities/recipe/  -> Types, API, query hooks, RecipeCard
  entities/tag/     -> Types, API, tag tree
  entities/ingredient/ -> Types, API
  pages/recipes/    -> List, detail views (read-only)
  pages/ingredients/ -> Browse ingredients

Phase 3: Interactive Features
  features/recipe-search/ -> Search + filter
  features/recipe-rating/ -> View/submit ratings
  entities/rating/   -> Rating API, types
  entities/unit/     -> Unit conversion
  features/ingredient-scaling/ -> Scale by servings

Phase 4: Creation & Mutation
  pages/recipes/RecipeEditPage -> Create/edit recipes
  features/image-upload/ -> Media upload
  entities/media/    -> Media API
  entities/meal-plan/ -> Meal plan API, types
  pages/meal-plans/  -> Create, view, edit plans

Phase 5: Advanced Features
  features/meal-plan-generator/ -> Auto-generate
  features/shopping-list/       -> Generate from plan
  features/recipe-sharing/      -> Token link sharing
  features/favorites/           -> Favorite management
  features/tag-navigation/      -> Hierarchical tag browser

Phase 6: Admin & Polish
  entities/user/     -> User API (admin)
  pages/admin/       -> All admin sub-pages
  pages/profile/     -> User profile
  Performance audit, accessibility, responsive polish
  Docker production build
```

**Rationale:** Shared layer is the foundation everything depends on. Entities come before features (features consume entities). Read-only pages before mutations (validates data flow before introducing complexity). Admin is last because it has the smallest user base and highest complexity.

## Sources

- [Feature-Sliced Design - Folder Structure](https://feature-sliced.design/blog/frontend-folder-structure) -- Layer definitions, dependency rules (HIGH confidence)
- [React Keycloak PKCE Integration](https://dev.to/saltorgil/react-keycloak-integration-secure-auth-for-existing-backend-182b) -- Auth flow, silent SSO (MEDIUM confidence)
- [Keycloak JavaScript Adapter Official Docs](https://www.keycloak.org/securing-apps/javascript-adapter) -- Token management, PKCE (HIGH confidence)
- [TanStack Query Architecture Discussion](https://github.com/TanStack/query/discussions/8547) -- Layered architecture placement (MEDIUM confidence)
- [React Router v7 Code Splitting](https://reactrouter.com/explanation/code-splitting) -- Lazy loading, route splitting (HIGH confidence)
- [Glassmorphism Implementation Guide](https://playground.halfaccessible.com/blog/glassmorphism-design-trend-implementation-guide) -- CSS techniques, performance (MEDIUM confidence)
- [React Router v7.5 Faster Lazy Loading](https://remix.run/blog/faster-lazy-loading) -- Granular lazy loading API (HIGH confidence)
- [Zustand + React Query Architecture Guide](https://dev.to/neetigyachahar/architecture-guide-building-scalable-react-or-react-native-apps-with-zustand-react-query-1nn4) -- State separation pattern (MEDIUM confidence)
