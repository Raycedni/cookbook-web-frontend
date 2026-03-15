# Phase 4: Meal Planning and Shopping - Context

**Gathered:** 2026-03-15
**Status:** Ready for planning

<domain>
## Phase Boundary

Users can plan meals across a week using a calendar grid, auto-generate plans with preference parameters, and produce aggregated shopping lists with cost estimation. This phase covers meal plan CRUD, calendar layout, auto-generation, shopping list generation, and check-off. Recipe creation/editing was Phase 3; admin features are Phase 5.

</domain>

<decisions>
## Implementation Decisions

### Weekly calendar layout
- 7-column CSS grid: days as columns, meal slots as rows
- Each cell shows recipe thumbnail + name, or "+" button if empty
- Desktop shows full week; mobile shows all 7 days stacked vertically with vertical scroll, each day showing its meal slots
- No external calendar library — built with CSS grid + dnd-kit for drag interactions
- User-defined meal slots (not fixed breakfast/lunch/dinner) — users create custom meal types (e.g., "Second Breakfast", "Afternoon Tea")
- Meal slot management: users can add/rename/remove slot types for their plans

### Adding recipes to meal slots
- Primary flow: click "+" on empty slot opens a recipe picker modal with search/filter (reuses existing search patterns)
- Power-user flow: drag recipe from a collapsible recipe panel onto a meal slot (uses dnd-kit, already installed)
- Both flows assign the selected recipe to the target day + slot

### Auto-generate experience
- "Auto-fill" button in the meal plan page toolbar opens a settings panel/modal with preference parameters
- Preference parameters (all four):
  - Meal types to fill (which user-defined slots to generate for)
  - Tag/category preferences (reuses existing TagTree component for include selection)
  - Use only favorites toggle
  - Max cook time slider/input
- Fill mode: user chooses per generation — "Fill empty slots only" vs "Replace all"
- Configurable repeat tolerance: user sets max times a recipe can appear in the plan (e.g., allow up to 2 repeats)
- Generated meals appear inline in the calendar grid with a highlighted/badge state ("Generated")
- Full "Regenerate" button re-runs with same parameters + per-slot refresh icon to regenerate a single meal
- Loading state: skeleton shimmer in affected slots while backend generates (consistent with existing skeleton patterns)
- Preferences persist per plan — next time user hits "Auto-fill" on this plan, settings are pre-filled

### Shopping list interaction
- "Generate shopping list" button on meal plan page navigates to a dedicated shopping list page
- Items grouped by ingredient category (Dairy, Produce, Meat, Pantry, etc.) in collapsible sections
- Each ingredient row shows: aggregated amount + unit, small sub-line listing which recipes need it (e.g., "Pasta, Curry")
- Per-item estimated cost + total estimated cost at bottom (uses backend cost estimation endpoints)
- Check-off: Claude's discretion on persistence (backend if API supports it, localStorage fallback)
- Checked items: strikethrough text + dimmed opacity, stay in place (no reflow)

### Meal plan CRUD flow
- Claude's discretion on create/edit form layout (name, date range, participants), navigation between plans, and list view of existing plans

### Claude's Discretion
- Create/edit form layout and fields presentation
- Navigation between multiple plans (list view, recent plans, etc.)
- Exact recipe picker modal design
- Collapsible recipe panel placement and behavior for drag flow
- Meal slot management UI (add/rename/remove slot types)
- Shopping list check-off persistence strategy (backend vs localStorage based on API availability)
- Empty states for new plans, empty days, empty shopping list
- Cost estimation formatting (currency symbol, decimal places)

</decisions>

<specifics>
## Specific Ideas

- User wants the full 7-day week visible on desktop as a grid — overview is important for meal planning
- Mobile shows all 7 days stacked vertically (not single-day switching), user scrolls through the week
- Both modal-based and drag-and-drop recipe assignment — modal is primary, drag is power-user shortcut
- User-defined meal slots give flexibility for different eating schedules and cultural meal patterns
- Auto-generate preferences should persist per plan so different plans can have different dietary constraints
- Per-slot regenerate icon enables fine-tuning without re-running the whole generation
- Shopping list should show recipe source info per ingredient to help users understand why items are on the list
- Backend has cost estimation endpoints — use them to show per-item and total costs on shopping list

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- `GlassCard` (src/shared/ui/GlassCard.tsx): Use for recipe cards in calendar cells and recipe picker
- `GlassPanel` (src/shared/ui/GlassPanel.tsx): Use for calendar grid container, generate settings panel, shopping list sections
- `Skeleton` (src/shared/ui/Skeleton.tsx): Shimmer loading for calendar cells during generation
- `useDelayedLoading` (src/shared/ui/useDelayedLoading.ts): 200ms delay + 500ms minimum for skeleton display
- `TagTree` + `TagChips` (src/features/recipes/ui/): Reuse for tag preference selection in auto-generate settings
- `SearchBar` (src/features/recipes/ui/SearchBar.tsx): Reuse or adapt for recipe picker modal search
- `RecipeCard` (src/features/recipes/ui/RecipeCard.tsx): Compact version for recipe picker results
- `EmptyState` (src/shared/ui/EmptyState.tsx): For empty plans, empty days, empty shopping list
- `apiClient` (src/shared/api/client.ts): ky-based HTTP client for all meal plan/shopping API calls
- `useDebounce` (src/shared/hooks/useDebounce.ts): For recipe search in picker modal
- `StarRating` (src/shared/ui/StarRating.tsx): Show ratings in recipe picker to aid selection
- dnd-kit (`@dnd-kit/core`, `@dnd-kit/sortable`): Already installed — use for drag-to-assign recipe flow

### Established Patterns
- Feature-sliced directory: `src/features/meals/api/{types,api,queries}.ts` + `src/features/meals/ui/`
- TanStack Router file-based routing under `src/routes/_authenticated/`
- TanStack Query for server state with query factory pattern
- Controlled form state with `useState` (no form library)
- Sidebar content via Zustand `setContent/content` pattern
- `window.confirm` for delete confirmations
- Spring Data pagination format (page, size, sort)

### Integration Points
- New routes: `/meal-plans` (list), `/meal-plans/new` (create), `/meal-plans/$planId` (calendar view), `/meal-plans/$planId/shopping` (shopping list)
- NavBar: add "Meal Plans" nav item
- Recipe queries: reuse `recipeQueries` for recipe picker search
- Ingredient types: reuse `RecipeIngredient` type structure for shopping list aggregation

### Backend API Contract (to be researched)
- Meal plan CRUD endpoints (create, read, update, delete)
- Meal assignment to plan slots (add/remove recipe to day+slot)
- Auto-generate endpoint with preference parameters
- Shopping list generation from meal plan
- Cost estimation endpoints (user specifically requested)
- Meal slot type management (user-defined slots)

</code_context>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 04-meal-planning-and-shopping*
*Context gathered: 2026-03-15*
