# Phase 5: Administration - Context

**Gathered:** 2026-03-15
**Status:** Ready for planning

<domain>
## Phase Boundary

Admin users can manage all system-level configuration and content through a dedicated panel: statistics dashboard, user management, IP blocking, system config, rating criteria, ingredients, tags (with hierarchy manipulation and merge), and measurement units. This phase covers the full admin CRUD surface. All user-facing features were completed in Phases 1-4.

</domain>

<decisions>
## Implementation Decisions

### Dashboard statistics
- Simple stat cards showing entity totals: users, recipes, meal plans, ratings, tags, units, ingredients
- No trend charts, no sparklines, no recent activity feed — counts only
- Each stat card is clickable — navigates to the corresponding management section
- No blocked IPs stat card (too niche for the overview)
- Cards laid out in a responsive grid (GlassCard components)

### Admin list/table design
- Glass tables (data tables inside GlassPanel) for all entity management sections: users, blocked IPs, config, rating criteria, ingredients, units
- Inline editing: click edit button on a row, row becomes editable in-place with save/cancel buttons
- Inline creation: "+ Add" button inserts an editable row at the top of the table
- Search bar above every table (debounced, reuses useDebounce pattern) for filtering
- Actions column with edit/delete buttons per row
- Delete confirmation via window.confirm (consistent with Phase 3 pattern)

### Tag management
- Dedicated tree view page (not a table) — full interactive hierarchical tree
- Drag-and-drop to move tags between parents in the tree (reuses dnd-kit, already installed)
- Merge: select a tag, click "Merge into..." button, pick target from dropdown/search, confirmation shows affected recipe count, source tag deleted after merge
- Tree nodes show edit (inline rename) and delete buttons
- "+ Add Tag" button for creating new tags (with parent selection)

### Admin navigation
- Dedicated `/admin` route with persistent left sidebar listing all sections: Dashboard, Users, Blocked IPs, Config, Rating Criteria, Ingredients, Tags, Units
- Main app NavBar stays visible at top — admin sidebar sits below it
- Admin link in NavBar (already exists with Shield icon) updated to point to `/admin`
- Mobile: admin sidebar collapses to hamburger menu overlay
- Route-level role gating: non-admin users navigating to `/admin` are redirected to home page (uses existing useAuthRoles hook)

### Rating criteria management
- Table with columns: name, description, active/inactive toggle
- Activate/deactivate via inline toggle switch (not edit mode)
- CRUD follows the standard inline edit/create pattern

### Claude's Discretion
- Exact admin sidebar styling and icon choices for each section
- Table pagination approach (load-more vs numbered pages)
- Rating criteria toggle switch component design
- Config key-value pair edit UX (key might be read-only after creation)
- Ingredient management columns (name, category, allergens — may need multi-select for allergens)
- Unit management columns (name, abbreviation, type)
- IP blocking input format and validation
- Empty states for sections with no data
- Mobile table responsiveness (horizontal scroll vs stacked cards on small screens)

</decisions>

<specifics>
## Specific Ideas

- Dashboard is a quick health check — admin lands here, sees counts, clicks through to manage. No analytics or trends needed.
- Inline edit/create pattern keeps the admin flow fast — no page navigation for simple CRUD operations
- Tags are the exception to the table pattern — their hierarchical nature demands a dedicated tree view with drag-and-drop
- Tag merge needs clear confirmation showing impact (recipe count) before executing
- Admin area should feel like its own section but not a separate app — keeping the NavBar visible maintains context

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- `GlassCard` (src/shared/ui/GlassCard.tsx): Use for dashboard stat cards
- `GlassPanel` (src/shared/ui/GlassPanel.tsx): Use for table containers, sidebar, admin layout panels
- `Skeleton` (src/shared/ui/Skeleton.tsx): Loading states for admin data
- `useDelayedLoading` (src/shared/ui/useDelayedLoading.ts): 200ms delay + 500ms minimum for skeleton display
- `useAuthRoles` (src/shared/auth/useAuthRoles.ts): `isAdmin` check for route gating — already used in NavBar
- `useDebounce` (src/shared/hooks/useDebounce.ts): 300ms debounce for table search inputs
- `EmptyState` (src/shared/ui/EmptyState.tsx): For empty tables
- `apiClient` (src/shared/api/client.ts): ky-based HTTP client for all admin API calls
- `buildTagTree` (src/features/recipes/api/types.ts): Converts flat Tag[] to nested tree — reuse for admin tag tree
- `TagTree` (src/features/recipes/ui/): Existing tree rendering — adapt for editable admin tree
- dnd-kit (`@dnd-kit/core`, `@dnd-kit/sortable`): Already installed — use for tag tree drag-to-move
- Lucide React icons: `Shield` already used for admin nav link

### Established Patterns
- Feature-sliced directory: `src/features/admin/api/{types,api,queries}.ts` + `src/features/admin/ui/`
- TanStack Router file-based routing: admin routes under `src/routes/_authenticated/admin/`
- TanStack Query factory pattern for server state
- Controlled form state with `useState` (no form library)
- `window.confirm` for delete confirmations
- Sidebar content via Zustand `setContent/content` pattern
- Spring Data pagination format (page, size, sort params)

### Integration Points
- NavBar: update admin link from `to="/"` to `to="/admin"` (line 63 of NavBar.tsx)
- Routes: `/admin` (dashboard), `/admin/users`, `/admin/ips`, `/admin/config`, `/admin/rating-criteria`, `/admin/ingredients`, `/admin/tags`, `/admin/units`
- Admin layout: new layout route wrapping admin child routes with sidebar
- Role guard: route-level redirect for non-admin users

</code_context>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 05-administration*
*Context gathered: 2026-03-15*
