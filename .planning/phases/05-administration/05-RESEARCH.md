# Phase 5: Administration - Research

**Researched:** 2026-03-15
**Domain:** Admin panel CRUD, layout routes, inline editing, tag tree management
**Confidence:** HIGH

## Summary

Phase 5 builds a dedicated admin panel with 8 management sections. The project already has all necessary libraries installed (dnd-kit, TanStack Router/Query, ky, Zustand, Lucide icons) and well-established patterns from Phases 1-4 (feature-sliced architecture, query factories, inline forms with useState, GlassPanel/GlassCard components). No new dependencies are needed.

The primary technical challenges are: (1) creating a nested layout route with a persistent admin sidebar using TanStack Router's layout route pattern, (2) building a reusable inline-editable table component to avoid repeating the same edit/create/delete pattern across 6 similar sections, and (3) adapting the existing read-only TagTree into an editable tree with dnd-kit drag-to-move and merge capabilities.

**Primary recommendation:** Create an AdminLayout route wrapper at `_authenticated/admin.tsx` that renders the admin sidebar + Outlet. Build a single reusable `AdminTable` component with inline edit/create/delete behavior, then use it for all table-based sections (users, IPs, config, criteria, ingredients, units). Tag management gets its own dedicated tree page.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Dashboard: simple stat cards with entity totals (users, recipes, meal plans, ratings, tags, units, ingredients). No trend charts, sparklines, or activity feeds. Cards clickable, navigating to corresponding management section. Responsive grid of GlassCard components.
- Admin list/table design: glass tables inside GlassPanel for users, blocked IPs, config, rating criteria, ingredients, units. Inline editing (click edit -> row becomes editable with save/cancel). Inline creation ("+ Add" inserts editable row at top). Search bar above every table (debounced with useDebounce). Actions column with edit/delete. Delete via window.confirm.
- Tag management: dedicated tree view page (not table). Drag-and-drop to move tags (reuse dnd-kit). Merge: select tag, "Merge into..." button, pick target from dropdown/search, confirmation shows affected recipe count, source tag deleted. Tree nodes show inline rename and delete. "+ Add Tag" button with parent selection.
- Admin navigation: dedicated `/admin` route with persistent left sidebar listing all sections (Dashboard, Users, Blocked IPs, Config, Rating Criteria, Ingredients, Tags, Units). Main NavBar stays visible. Admin link in NavBar updated to point to `/admin`. Mobile: sidebar collapses to hamburger overlay. Route-level role gating via useAuthRoles.
- Rating criteria: table with name, description, active/inactive toggle switch (not edit mode). CRUD follows standard inline pattern.

### Claude's Discretion
- Exact admin sidebar styling and icon choices for each section
- Table pagination approach (load-more vs numbered pages)
- Rating criteria toggle switch component design
- Config key-value pair edit UX (key might be read-only after creation)
- Ingredient management columns (name, category, allergens -- may need multi-select for allergens)
- Unit management columns (name, abbreviation, type)
- IP blocking input format and validation
- Empty states for sections with no data
- Mobile table responsiveness (horizontal scroll vs stacked cards on small screens)

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| ADMIN-01 | Admin can view system statistics dashboard | Dashboard stat cards using GlassCard, admin API endpoints for entity counts, clickable cards linking to sections |
| ADMIN-02 | Admin can manage users (list, search, update roles, delete) | AdminTable with inline editing, admin/users API with Spring Data pagination, role dropdown |
| ADMIN-03 | Admin can manage blocked IPs (list, add, remove) | AdminTable with inline add, admin/blocked-ips API, IP format validation |
| ADMIN-04 | Admin can manage system configuration key-value pairs | AdminTable with inline edit, admin/config API, key read-only after creation |
| ADMIN-05 | Admin can manage rating criteria (CRUD + activate/deactivate) | AdminTable with toggle switch column, admin/rating-criteria API |
| ADMIN-06 | Admin can manage ingredients (CRUD) | AdminTable with inline edit, admin/ingredients API with allergen multi-select |
| ADMIN-07 | Admin can manage tags (CRUD + move + merge) | Editable TagTree with dnd-kit drag-to-move, merge modal with recipe count confirmation |
| ADMIN-08 | Admin can manage measurement units | AdminTable with inline edit, admin/units API |
</phase_requirements>

## Standard Stack

### Core (Already Installed)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @tanstack/react-router | ^1.167.0 | File-based routing with layout routes for admin | Already used, layout route pattern for admin sidebar |
| @tanstack/react-query | ^5.90.21 | Server state for all admin CRUD operations | Already used, query factory pattern established |
| ky | ^1.14.3 | HTTP client for admin API calls | Already used via apiClient |
| @dnd-kit/core | ^6.3.1 | Drag-and-drop for tag tree move | Already installed, used in Phase 3+4 |
| @dnd-kit/sortable | ^10.0.0 | Sortable tree nodes | Already installed |
| lucide-react | ^0.577.0 | Icons for admin sidebar and actions | Already used throughout |
| zustand | ^5.0.11 | Admin sidebar state (mobile toggle) | Already used for main sidebar |
| tailwindcss | ^4.2.1 | Styling | Already used |

### Supporting (Already Installed)
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| clsx + tailwind-merge | ^2.1.1 / ^3.5.0 | Conditional class merging via cn() | All component styling |
| react | ^19.2.4 | useState for inline edit forms | All form state |

### New Dependencies
None required. All libraries are already installed.

## Architecture Patterns

### Recommended Project Structure
```
src/
  features/
    admin/
      api/
        types.ts          # Admin-specific types (AdminUser, BlockedIp, SystemConfig, AdminStats)
        admin-api.ts      # All admin API functions (GET/POST/PUT/DELETE)
        admin-queries.ts  # Query factory: adminQueries.stats(), .users(), .ips(), etc.
      ui/
        AdminSidebar.tsx      # Persistent sidebar with section links
        AdminDashboard.tsx    # Stat cards grid
        StatCard.tsx          # Individual clickable stat card
        AdminTable.tsx        # Reusable inline-editable table component
        UserManagement.tsx    # Users section using AdminTable
        BlockedIpSection.tsx  # IP blocking section using AdminTable
        ConfigSection.tsx     # System config section using AdminTable
        CriteriaSection.tsx   # Rating criteria with toggle using AdminTable
        IngredientSection.tsx # Ingredient management using AdminTable
        UnitSection.tsx       # Unit management using AdminTable
        AdminTagTree.tsx      # Editable tree (extends TagTree pattern)
        TagMergeModal.tsx     # Modal for tag merge with confirmation
  routes/
    _authenticated/
      admin.tsx               # Layout route: role guard + AdminSidebar + Outlet
      admin/
        index.tsx             # Dashboard (default admin route)
        users.tsx             # User management
        ips.tsx               # Blocked IPs
        config.tsx            # System config
        rating-criteria.tsx   # Rating criteria
        ingredients.tsx       # Ingredient management
        tags.tsx              # Tag tree management
        units.tsx             # Unit management
```

### Pattern 1: TanStack Router Layout Route for Admin
**What:** A layout route at `_authenticated/admin.tsx` that renders the admin sidebar alongside an Outlet for child routes. This mirrors how `_authenticated.tsx` wraps all auth-required routes.
**When to use:** When a group of routes share a persistent UI element (sidebar).
**Example:**
```typescript
// src/routes/_authenticated/admin.tsx
import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import { AdminSidebar } from '@/features/admin/ui/AdminSidebar'

export const Route = createFileRoute('/_authenticated/admin')({
  beforeLoad: ({ context }) => {
    // Role guard: non-admin users redirect to home
    const claims = context.auth.user?.profile as { realm_access?: { roles?: string[] } } | undefined
    const roles = claims?.realm_access?.roles ?? []
    if (!roles.includes('ADMIN')) {
      throw redirect({ to: '/' })
    }
  },
  component: AdminLayout,
})

function AdminLayout() {
  return (
    <div className="flex gap-0">
      <AdminSidebar />
      <div className="flex-1 min-w-0">
        <Outlet />
      </div>
    </div>
  )
}
```

### Pattern 2: Reusable AdminTable with Inline Edit/Create
**What:** A generic table component that handles the repeating pattern: list rows, search filter, inline edit on click, inline add at top, delete with confirm.
**When to use:** For all 6 table-based admin sections.
**Example:**
```typescript
// Conceptual AdminTable interface
interface Column<T> {
  key: string
  header: string
  render: (item: T) => ReactNode
  editRender?: (value: unknown, onChange: (v: unknown) => void) => ReactNode
}

interface AdminTableProps<T> {
  columns: Column<T>[]
  data: T[]
  isLoading: boolean
  searchPlaceholder: string
  onSearch: (query: string) => void
  onSave: (item: Partial<T>) => Promise<void>
  onDelete: (item: T) => Promise<void>
  onCreate: (item: Partial<T>) => Promise<void>
  getId: (item: T) => string | number
  emptyDefaults: Partial<T>  // defaults for new row
}
```

### Pattern 3: Query Factory for Admin
**What:** Follow the established query factory pattern for admin API queries.
**When to use:** All admin data fetching.
**Example:**
```typescript
export const adminQueries = {
  all: () => ['admin'] as const,

  stats: () =>
    queryOptions({
      queryKey: [...adminQueries.all(), 'stats'] as const,
      queryFn: () => getAdminStats(),
    }),

  users: (search?: string, page?: number) =>
    queryOptions({
      queryKey: [...adminQueries.all(), 'users', { search, page }] as const,
      queryFn: () => getAdminUsers({ search, page }),
    }),

  blockedIps: () =>
    queryOptions({
      queryKey: [...adminQueries.all(), 'blocked-ips'] as const,
      queryFn: () => getBlockedIps(),
    }),

  config: () =>
    queryOptions({
      queryKey: [...adminQueries.all(), 'config'] as const,
      queryFn: () => getSystemConfig(),
    }),

  ratingCriteria: () =>
    queryOptions({
      queryKey: [...adminQueries.all(), 'rating-criteria'] as const,
      queryFn: () => getAdminRatingCriteria(),
    }),

  ingredients: (search?: string) =>
    queryOptions({
      queryKey: [...adminQueries.all(), 'ingredients', { search }] as const,
      queryFn: () => getAdminIngredients({ search }),
    }),

  tags: () =>
    queryOptions({
      queryKey: [...adminQueries.all(), 'tags'] as const,
      queryFn: () => getAdminTags(),
    }),

  units: () =>
    queryOptions({
      queryKey: [...adminQueries.all(), 'units'] as const,
      queryFn: () => getAdminUnits(),
    }),
}
```

### Pattern 4: Admin API Endpoint Convention
**What:** Admin endpoints are typically prefixed with `/admin/` to separate from regular user endpoints.
**Assumed API structure:**
```
GET    /admin/stats                    -> { users: N, recipes: N, mealPlans: N, ratings: N, tags: N, units: N, ingredients: N }
GET    /admin/users?search=&page=&size= -> SpringPage<AdminUser>
PUT    /admin/users/{id}/role           -> { role: 'USER'|'ADMIN' }
DELETE /admin/users/{id}
GET    /admin/blocked-ips               -> BlockedIp[]
POST   /admin/blocked-ips               -> BlockedIp
DELETE /admin/blocked-ips/{id}
GET    /admin/config                    -> SystemConfig[]
POST   /admin/config                    -> SystemConfig
PUT    /admin/config/{id}               -> SystemConfig
DELETE /admin/config/{id}
GET    /admin/rating-criteria           -> AdminRatingCriterion[] (includes active flag)
POST   /admin/rating-criteria           -> AdminRatingCriterion
PUT    /admin/rating-criteria/{id}      -> AdminRatingCriterion
PATCH  /admin/rating-criteria/{id}/toggle -> AdminRatingCriterion
DELETE /admin/rating-criteria/{id}
GET    /admin/ingredients?search=       -> Ingredient[] or SpringPage<Ingredient>
POST   /admin/ingredients               -> Ingredient
PUT    /admin/ingredients/{id}          -> Ingredient
DELETE /admin/ingredients/{id}
GET    /admin/tags                      -> Tag[] (flat, with parentId)
POST   /admin/tags                      -> Tag
PUT    /admin/tags/{id}                 -> Tag  (rename, move parent)
POST   /admin/tags/{id}/merge           -> { targetId: N } (merge source into target)
DELETE /admin/tags/{id}
GET    /admin/units                     -> Unit[]
POST   /admin/units                     -> Unit
PUT    /admin/units/{id}                -> Unit
DELETE /admin/units/{id}
```
**Confidence:** MEDIUM -- API structure assumed from typical Spring Boot admin patterns. Actual endpoints may differ; planner should flag API discovery as first task.

### Anti-Patterns to Avoid
- **Separate page per CRUD action:** Do NOT create separate create/edit pages for simple entities. The user decision mandates inline editing within tables.
- **Duplicating table logic across sections:** Do NOT copy-paste table editing code into each section. Build AdminTable once and configure per section.
- **Nesting admin under AppLayout sidebar:** The admin area has its OWN sidebar (section navigation), not the tag-browsing sidebar. The admin layout route should hide the main Sidebar's content (or the Sidebar just won't have content set on admin pages).
- **Using form libraries:** Project convention is useState for form state. Do not introduce react-hook-form or similar.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Drag-and-drop tree reorder | Custom mouse event handlers | @dnd-kit/core + @dnd-kit/sortable | Already installed, handles edge cases (touch, accessibility, drop zones) |
| Debounced search | Custom setTimeout logic | useDebounce hook (src/shared/hooks/useDebounce.ts) | Already exists at 300ms |
| Tag tree building | Manual parent-child nesting | buildTagTree (src/features/recipes/api/types.ts) | Already exists, converts flat Tag[] to TagNode[] |
| Loading states | Custom loading spinners | Skeleton + useDelayedLoading | Already established pattern with 200ms delay + 500ms minimum |
| HTTP client | fetch() calls | apiClient (src/shared/api/client.ts) | Already handles auth token injection |
| Role checking | Manual token parsing | useAuthRoles hook | Already exists with isAdmin boolean |
| Glass styling | Custom backdrop-blur CSS | GlassPanel + GlassCard components | Already exists with light/medium/heavy intensity |

## Common Pitfalls

### Pitfall 1: Admin Layout Conflicting with Main Sidebar
**What goes wrong:** The AppLayout already renders a Sidebar component. If admin pages also try to use the sidebar store, the admin sidebar and tag sidebar fight for the same slot.
**Why it happens:** AppLayout wraps ALL routes including admin.
**How to avoid:** The admin layout renders its OWN sidebar as a direct child within the `<Outlet>` content area. The main Sidebar simply has no content set on admin pages (no page calls `setContent`), so it stays collapsed/hidden. The admin sidebar is a separate component, not the Zustand-based Sidebar.
**Warning signs:** Main sidebar toggle button appearing on admin pages, tag content showing in admin sidebar.

### Pitfall 2: Role Guard Only in Component, Not Route
**What goes wrong:** Admin content briefly flashes before redirect if role check only happens in component render.
**Why it happens:** Component renders before the redirect logic fires.
**How to avoid:** Use `beforeLoad` in the layout route's `createFileRoute` to check admin role and throw `redirect({ to: '/' })` before any component renders.
**Warning signs:** Brief flash of admin UI for non-admin users.

### Pitfall 3: Stale Query Cache After Admin Mutations
**What goes wrong:** After creating/updating/deleting entities in admin, the user-facing pages show stale data.
**Why it happens:** Admin mutations use different query keys than user-facing queries (e.g., `['admin', 'tags']` vs `['tags']`).
**How to avoid:** After admin mutations, invalidate BOTH admin query keys AND related user-facing query keys. For example, after tag mutation, invalidate `['admin', 'tags']` AND `['tags']`.
**Warning signs:** Creating a tag in admin but not seeing it in recipe tag filter until refresh.

### Pitfall 4: Inline Edit State Collision
**What goes wrong:** User clicks edit on one row, then clicks edit on another without canceling -- both rows become editable simultaneously.
**Why it happens:** Each row manages its own edit state independently.
**How to avoid:** Track `editingId` at the table level (single state). When starting edit on a new row, cancel any active edit first.
**Warning signs:** Multiple rows in edit mode simultaneously, confusing UX.

### Pitfall 5: Tag Drag-and-Drop in Nested Tree
**What goes wrong:** Drag-and-drop of nested tree nodes causes items to be dropped at wrong levels or into their own descendants.
**Why it happens:** dnd-kit sortable strategy expects flat lists; tree structures need custom drop logic.
**How to avoid:** Use DndContext (not sortable) for tag tree. Implement custom collision detection. Prevent dropping a node into its own subtree. Use overlay for drag preview.
**Warning signs:** Tags disappearing, circular parent references, items dropping to wrong depth.

## Code Examples

### Inline Editable Table Row Pattern
```typescript
// Single editing row tracked at table level
const [editingId, setEditingId] = useState<number | null>(null)
const [editValues, setEditValues] = useState<Record<string, unknown>>({})
const [creatingNew, setCreatingNew] = useState(false)

function handleStartEdit(item: T) {
  setEditingId(getId(item))
  setEditValues(/* populate from item */)
  setCreatingNew(false)
}

function handleStartCreate() {
  setEditingId(null)
  setEditValues(emptyDefaults)
  setCreatingNew(true)
}

function handleSave() {
  if (creatingNew) {
    createMutation.mutate(editValues)
  } else {
    updateMutation.mutate({ id: editingId, ...editValues })
  }
  setEditingId(null)
  setCreatingNew(false)
}

function handleCancel() {
  setEditingId(null)
  setCreatingNew(false)
}
```

### Admin Sidebar Navigation
```typescript
import { Link } from '@tanstack/react-router'
import {
  LayoutDashboard, Users, ShieldBan, Settings,
  Star, Salad, Tags, Ruler,
} from 'lucide-react'

const adminSections = [
  { to: '/admin', icon: LayoutDashboard, label: 'Dashboard', exact: true },
  { to: '/admin/users', icon: Users, label: 'Users' },
  { to: '/admin/ips', icon: ShieldBan, label: 'Blocked IPs' },
  { to: '/admin/config', icon: Settings, label: 'Config' },
  { to: '/admin/rating-criteria', icon: Star, label: 'Rating Criteria' },
  { to: '/admin/ingredients', icon: Salad, label: 'Ingredients' },
  { to: '/admin/tags', icon: Tags, label: 'Tags' },
  { to: '/admin/units', icon: Ruler, label: 'Units' },
]
```

### Toggle Switch for Rating Criteria Active/Inactive
```typescript
// Simple toggle -- no edit mode needed
function ToggleSwitch({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={cn(
        'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
        checked ? 'bg-accent' : 'bg-white/20',
      )}
      role="switch"
      aria-checked={checked}
    >
      <span
        className={cn(
          'inline-block h-4 w-4 rounded-full bg-white transition-transform',
          checked ? 'translate-x-6' : 'translate-x-1',
        )}
      />
    </button>
  )
}
```

### Tag Merge Confirmation Flow
```typescript
// Step 1: Select source tag in tree
// Step 2: Click "Merge into..." -> opens modal
// Step 3: Modal shows search/dropdown to pick target tag
// Step 4: On select, API call to get affected recipe count
// Step 5: Show confirmation: "Merge 'Italian' into 'European'? This will update X recipes."
// Step 6: On confirm, POST /admin/tags/{sourceId}/merge { targetId }
// Step 7: Invalidate ['admin', 'tags'] and ['tags'] queries
```

### Admin API Function Pattern
```typescript
// Follows established apiClient pattern from recipe-api.ts
export async function getAdminStats(): Promise<AdminStats> {
  return apiClient.get('admin/stats').json<AdminStats>()
}

export async function getAdminUsers(params: {
  search?: string
  page?: number
  size?: number
}): Promise<SpringPage<AdminUser>> {
  return apiClient.get('admin/users', {
    searchParams: {
      page: params.page ?? 0,
      size: params.size ?? 20,
      ...(params.search && { search: params.search }),
    },
  }).json<SpringPage<AdminUser>>()
}
```

## Discretion Recommendations

### Table Pagination: Load-More Button
**Recommendation:** Use simple "Load more" button (same as recipe list pattern) rather than numbered pagination. Simpler to implement, consistent with existing patterns. For small entity lists (config, criteria, units, IPs), no pagination needed -- load all.
**Confidence:** HIGH -- aligns with existing project patterns.

### Config Key-Value: Key Read-Only After Creation
**Recommendation:** Make key field editable only during creation (in the "new row" form). Once saved, key displays as read-only text, only value is editable. This prevents accidental key changes that could break backend configuration.
**Confidence:** HIGH -- standard pattern for config management.

### Ingredient Columns: Name + Category
**Recommendation:** Columns: name (text input), category (text input or dropdown if categories are predefined). Allergens are stored as allergenIds -- use a multi-select dropdown with checkboxes. The existing Ingredient type has `allergenIds: number[]`.
**Confidence:** MEDIUM -- depends on actual admin API response shape for allergens.

### Unit Columns: Name + Abbreviation + Type
**Recommendation:** Three text columns matching the existing `Unit` type: `name`, `abbreviation`, `type`. The type field may be a dropdown (weight, volume, count, etc.) if the backend has a fixed enum.
**Confidence:** HIGH -- matches existing Unit type definition.

### IP Input Validation
**Recommendation:** Simple text input with basic regex validation for IPv4 (and optionally IPv6). Format: `xxx.xxx.xxx.xxx` or CIDR `xxx.xxx.xxx.xxx/yy`. Show inline validation error.
**Confidence:** MEDIUM -- depends on backend IP format expectations.

### Empty States
**Recommendation:** Use existing EmptyState component with contextual icons and "No X found" / "Add your first X" messaging. Each section gets its own empty state text.
**Confidence:** HIGH -- EmptyState component already exists.

### Mobile Tables
**Recommendation:** Horizontal scroll with `overflow-x-auto` on table container. Simpler than card transformation and sufficient for admin use (admin tasks are primarily desktop). Add `min-w-[600px]` on the table element to ensure readable column widths.
**Confidence:** HIGH -- admin panels are predominantly desktop; horizontal scroll is pragmatic.

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Separate admin pages per action | Inline editing in tables | Project decision | Faster admin workflow, less page navigation |
| Separate tag management table | Interactive tree view | Project decision | Better UX for hierarchical data |
| Custom drag library | @dnd-kit/core v6 | Already in project | Consistent with Phase 3+4 usage |

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest 4.1.0 + @testing-library/react 16.3.2 |
| Config file | vitest.config.ts |
| Quick run command | `npx vitest run --reporter=verbose` |
| Full suite command | `npx vitest run` |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| ADMIN-01 | Dashboard renders stat cards with counts | unit | `npx vitest run src/features/admin/ui/AdminDashboard.test.tsx -x` | Wave 0 |
| ADMIN-02 | User table renders, search filters, role update works | unit | `npx vitest run src/features/admin/ui/UserManagement.test.tsx -x` | Wave 0 |
| ADMIN-03 | Blocked IP list renders, add/remove works | unit | `npx vitest run src/features/admin/ui/BlockedIpSection.test.tsx -x` | Wave 0 |
| ADMIN-04 | Config table renders, inline edit saves | unit | `npx vitest run src/features/admin/ui/ConfigSection.test.tsx -x` | Wave 0 |
| ADMIN-05 | Rating criteria table with toggle | unit | `npx vitest run src/features/admin/ui/CriteriaSection.test.tsx -x` | Wave 0 |
| ADMIN-06 | Ingredient table CRUD | unit | `npx vitest run src/features/admin/ui/IngredientSection.test.tsx -x` | Wave 0 |
| ADMIN-07 | Tag tree renders, drag-move, merge modal | unit | `npx vitest run src/features/admin/ui/AdminTagTree.test.tsx -x` | Wave 0 |
| ADMIN-08 | Unit table CRUD | unit | `npx vitest run src/features/admin/ui/UnitSection.test.tsx -x` | Wave 0 |

### Sampling Rate
- **Per task commit:** `npx vitest run --reporter=verbose`
- **Per wave merge:** `npx vitest run`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `src/features/admin/ui/AdminDashboard.test.tsx` -- covers ADMIN-01
- [ ] `src/features/admin/ui/AdminTable.test.tsx` -- covers reusable table component
- [ ] `src/features/admin/ui/AdminTagTree.test.tsx` -- covers ADMIN-07

## Open Questions

1. **Admin API endpoint structure**
   - What we know: Backend is Spring Boot with standard REST patterns. Existing endpoints use `/recipes`, `/tags`, `/units` etc.
   - What's unclear: Whether admin endpoints are prefixed with `/admin/` or use the same base URLs with authorization. Whether stats endpoint exists.
   - Recommendation: First task should include API discovery -- check backend Swagger/OpenAPI if available, or probe endpoints. Build API layer to be easily adjustable.

2. **Tag merge -- recipe count preview**
   - What we know: Merge confirmation should show affected recipe count.
   - What's unclear: Whether the backend provides a preview endpoint (e.g., `GET /admin/tags/{id}/merge-preview?targetId=X`) or if we need to count from existing data.
   - Recommendation: Assume a preview/count endpoint exists. Fall back to a simple "Are you sure?" if not available.

3. **Admin user model**
   - What we know: Existing auth uses Keycloak roles.
   - What's unclear: Whether user management goes through the backend API (which proxies to Keycloak) or directly to Keycloak admin API.
   - Recommendation: Assume backend provides admin user endpoints that handle Keycloak interaction internally.

## Sources

### Primary (HIGH confidence)
- Project codebase analysis: route structure, component patterns, API patterns, existing types
- TanStack Router file-based routing -- layout routes via directory structure (verified from existing `_authenticated.tsx`)
- @dnd-kit -- already installed and used in Phase 3+4 for sortable lists
- Existing components: GlassPanel, GlassCard, EmptyState, Skeleton, useDelayedLoading, useDebounce, useAuthRoles

### Secondary (MEDIUM confidence)
- Admin API endpoint structure -- inferred from Spring Boot conventions and existing API patterns
- Tag merge flow -- designed from CONTEXT.md requirements

### Tertiary (LOW confidence)
- Exact allergen management UI for ingredients -- depends on backend API response shape
- IP blocking format -- depends on backend validation requirements

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- all libraries already installed and used
- Architecture: HIGH -- follows established project patterns exactly
- Pitfalls: HIGH -- derived from direct codebase analysis and known dnd-kit/TanStack patterns
- API endpoints: MEDIUM -- inferred from conventions, not verified against backend

**Research date:** 2026-03-15
**Valid until:** 2026-04-15 (stable project, no external dependency changes expected)
