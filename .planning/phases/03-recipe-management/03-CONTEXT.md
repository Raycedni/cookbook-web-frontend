# Phase 3: Recipe Management - Context

**Gathered:** 2026-03-15
**Status:** Ready for planning

<domain>
## Phase Boundary

Users can create, edit, and delete their own recipes with images, tags, and shareable links. This phase covers all recipe mutation operations. Read-only browsing was Phase 2; meal planning is Phase 4.

</domain>

<decisions>
## Implementation Decisions

### Recipe form structure
- Multi-step wizard with 2 steps, shared between create and edit flows
- **Step 1: Basics, Image & Ingredients** — recipe name, description, servings, prep/cook times, main hero image upload, and ingredient list
- **Step 2: Cooking Steps & Tags** — ordered cooking steps (each with optional multiple images), tag selection from tag tree, and save button
- Progress indicator at top showing current step
- Per-step validation: Next button disabled until required fields on current step are filled; inline error messages
- Edit mode uses the same wizard, pre-filled with existing recipe data

### Ingredient entry
- Search-to-add rows: user types to search ingredients (debounced, reusing FavoriteIngredients dropdown pattern), then fills in amount and selects unit from dropdown
- Each ingredient row shows: amount input, unit dropdown (fetched from `GET /api/v1/units`), ingredient name (search autocomplete from `GET /api/v1/ingredients/search`), remove button
- Drag-and-drop reordering of ingredient rows (requires a drag library like dnd-kit — new dependency)
- "Add ingredient" button appends a new empty row

### Cooking step editing
- Each step is a numbered card with: text area for instructions, optional multi-image upload area, drag handle, remove button
- Steps are auto-numbered based on position
- Drag-and-drop reordering (same library as ingredients)
- "Add Step" button appends a new step card
- Each step supports multiple images via drag-and-drop drop zone + file picker button fallback
- Step images upload after recipe save (backend needs step database ID from `RecipeStepResponse.id`)

### Image upload
- Main hero image: drag-and-drop zone + click-to-browse on wizard Step 1, uploaded via `POST /api/v1/media/recipes/{recipeId}` with `isPrimary=true`
- Per-step images: drag-and-drop zone on each step card, uploaded via `POST /api/v1/media/recipes/{recipeId}/steps/{stepId}`
- Preview via `URL.createObjectURL` before upload
- Backend constraints: max 10MB, accepts image/jpeg, image/png, image/gif, image/webp
- Image URLs from backend `MediaFileResponse.url` field used directly as `<img src>`

### Share link
- Share button on recipe detail page opens a modal with the generated link and copy-to-clipboard button
- Uses `POST /api/v1/recipes/{id}/share` (idempotent — returns existing token if one exists)
- Permanent links — no revocation management UI needed
- Copy uses `navigator.clipboard.writeText`

### Shared recipe view
- Same recipe detail page layout, read-only (no rate/favorite/edit/delete buttons)
- Route: `/recipes/share/{token}` hitting `GET /api/v1/recipes/share/{token}` (public, no auth)
- No app shell login required

### Delete confirmation
- Delete button on recipe detail page (visible only to recipe author)
- Confirmation before delete — either `window.confirm` or a simple modal (Claude's discretion)
- On success: redirect to recipe list, invalidate recipe queries

### Claude's Discretion
- Drag-and-drop library choice (dnd-kit recommended based on codebase patterns)
- Exact wizard progress indicator design
- Toast/success feedback after save (Zustand store pattern or simpler approach)
- Whether to build a reusable Modal component or use a one-off overlay
- Form state management approach (controlled state vs. useReducer for complex wizard state)
- Image compression/resize before upload (if any)

</decisions>

<specifics>
## Specific Ideas

- User wants the main image upload prominent on the first wizard step alongside basic info — not buried in a later step
- Per-step images were specifically requested to show what the dish looks like at each cooking stage
- Multiple images per step (not limited to one) — the backend supports this via repeated uploads to the same step ID
- Drag-and-drop for both ingredients and steps — consistent reorder UX across the form

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- `GlassPanel` (src/shared/ui/GlassPanel.tsx): Section container for wizard steps
- `TagTree` + `TagChips` (src/features/recipes/ui/): Drop-in tag selection — tree for picking, chips for showing selected with remove
- `buildTagTree()` (src/features/recipes/api/types.ts): Converts flat tags to nested tree
- `FavoriteIngredients` pattern (src/features/profile/ui/): Debounced search dropdown for ingredient autocomplete — reuse the pattern
- `useDebounce` (src/shared/hooks/useDebounce.ts): 300ms debounce for search inputs
- `apiClient` (src/shared/api/client.ts): ky-based HTTP client with Bearer token — use for all mutations
- `EmptyState` (src/shared/ui/EmptyState.tsx): For empty ingredient/step lists
- `Skeleton` (src/shared/ui/Skeleton.tsx): Loading states for edit form data fetch
- Input styling token: `"mt-1 block w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white placeholder-white/30 outline-none transition-colors focus:border-accent/50 focus:bg-white/[0.08]"`

### Established Patterns
- Controlled form state with `useState` (ProfileForm pattern) — no form library
- Inline mutations in route components with `useMutation` + `queryClient.invalidateQueries`
- `recipeQueries.all()` as root query key `['recipes']` for invalidation after create/edit/delete
- Feature-sliced directory: `src/features/{domain}/api/{types,api,queries}.ts`
- TanStack Router file-based routing under `src/routes/_authenticated/`
- Sidebar content via Zustand `setContent/content` pattern

### Integration Points
- New routes: `/recipes/new` (create wizard), `/recipes/$recipeId/edit` (edit wizard), `/recipes/share/$token` (public shared view)
- `/recipes/new` must be defined before `$recipeId` in file system to avoid route conflict
- Edit/Delete buttons on existing recipe detail page (conditional on authorship)
- Share button on existing recipe detail page
- NavBar: may need "My Recipes" or "Create Recipe" link

### Backend API Contract
- `POST /api/v1/recipes` — CreateRecipeRequest: `{ name, description?, servings?, prepTimeMinutes?, cookTimeMinutes?, isPublic?, steps?[], ingredients?[], tagIds?[] }`
- `PUT /api/v1/recipes/{id}` — UpdateRecipeRequest: same fields, all optional; steps/ingredients/tags are **full replacement** when provided
- `DELETE /api/v1/recipes/{id}` — 204 no body
- `POST /api/v1/media/recipes/{recipeId}` — multipart `file` + `isPrimary` boolean for recipe images
- `POST /api/v1/media/recipes/{recipeId}/steps/{stepId}` — multipart `file` for step images
- `GET /api/v1/media/recipes/{recipeId}` — all images for recipe
- `GET /api/v1/media/steps/{stepId}` — all images for step
- `POST /api/v1/recipes/{id}/share` — returns `{ shareToken }`, idempotent
- `GET /api/v1/recipes/share/{token}` — public, returns full RecipeResponse
- `GET /api/v1/units` — all measurement units (id, name, abbreviation, type)
- `GET /api/v1/ingredients/search?query=` — paginated ingredient search
- `GET /api/v1/tags/assignable` — tags allowed for recipe assignment
- Note: backend uses `name` (not `title`), steps use `stepOrder` + `description` (not `instruction`)

</code_context>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 03-recipe-management*
*Context gathered: 2026-03-15*
