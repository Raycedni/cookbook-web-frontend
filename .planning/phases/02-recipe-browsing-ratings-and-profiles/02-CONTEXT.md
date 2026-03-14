# Phase 2: Recipe Browsing, Ratings, and Profiles - Context

**Gathered:** 2026-03-15
**Status:** Ready for planning

<domain>
## Phase Boundary

Users can discover, browse, search, and read recipes with full detail views, rate recipes, manage favorites, set preferences, and browse ingredients. This phase covers all read-only recipe interactions, the rating system, user profile/preferences, and ingredient browsing. Recipe creation/editing belongs to Phase 3.

</domain>

<decisions>
## Implementation Decisions

### Recipe card grid layout
- Responsive auto-fill grid using CSS grid with auto-fill/minmax — 1 column on mobile, 2-3 on tablet, 3-4 on desktop
- Cards auto-flow into available space; consistent card size with natural reflow at breakpoints
- Uses existing GlassCard component with hover effect

### Recipe card content
- Hero image at top of each card (large, prominent)
- Recipe title below image
- Cook time (e.g. "30 min") and average star rating (e.g. "4.2") in metadata row
- 1-2 tag chips displayed on card for at-a-glance categorization
- Favorite heart icon overlaid on top-right corner of hero image — filled when favorited, outline when not, tap to toggle

### Pagination
- "Load more" button at bottom of grid to append next page of results
- Previous results remain visible (append, don't replace)
- Show count indicator (e.g. "Showing 6 of 24 recipes")
- Uses TanStack Query's useInfiniteQuery for load-more pattern with Spring Data pagination params

### Search bar placement and behavior
- Search bar at top of content area, full width, always visible above the recipe grid
- Active filter chips (tags) shown below search bar — each chip has an X to remove
- Debounced live search (~300ms after typing stops) — results update dynamically (BROWSE-02)
- Clear search and tag filters independently

### Tag filtering
- Search keyword AND selected tags apply simultaneously (combined AND filtering)
- Hierarchical expandable tag tree in sidebar (sidebar already exists with placeholder)
- Collapsible parent tags with nested children — click parent to expand/collapse, click leaf tag to add as filter
- Selected tags appear as removable chips below search bar in content area

### Claude's Discretion
- Recipe detail page layout (hero image, ingredient/step sections, rating breakdown, serving scaler)
- Rating interaction UI (stars, sliders, per-criterion presentation)
- User profile and preferences page layout
- Ingredient browsing page design
- Empty states for no results, no favorites, no ratings
- Image placeholder/fallback when recipe has no hero image
- Mobile tag access (how sidebar tags are accessible on mobile)
- URL sync for search/filter state (whether search query and tags persist in URL)

</decisions>

<specifics>
## Specific Ideas

- Cards should use the existing GlassCard component — consistent with the glassmorphism design system from Phase 1
- Favorite heart overlay on hero image corner — quick toggle without opening detail view
- "Load more" instead of numbered pagination — keeps browsing flow uninterrupted
- Live debounced search for a fluid, modern feel — matches the "smooth browsing experience" vision
- Tag tree in sidebar matches the Phase 1 sidebar placeholder that says "Tag browsing will appear here"
- Combined AND filtering lets users progressively narrow results (search + tags work together)

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- GlassCard (src/shared/ui/GlassCard.tsx): Card component with light/medium/heavy intensity, hover effect, polymorphic `as` prop — use for recipe cards
- GlassPanel (src/shared/ui/GlassPanel.tsx): Base glass panel — use for search bar container, filter area
- Skeleton (src/shared/ui/Skeleton.tsx): Text/circular/rectangular variants with shimmer — use for card skeletons, detail page skeletons
- useDelayedLoading (src/shared/ui/useDelayedLoading.ts): 200ms delay + 500ms minimum display — prevents skeleton flicker
- apiClient (src/shared/api/client.ts): ky-based HTTP client with Bearer token injection — use for all recipe/rating/profile API calls
- Sidebar (src/shared/ui/Sidebar.tsx): Collapsible sidebar with tag placeholder — replace placeholder with hierarchical tag tree
- cn utility (src/shared/lib/cn.ts): Tailwind class merging

### Established Patterns
- TanStack Router file-based routing (src/routes/) — add recipe routes under _authenticated
- TanStack Query for server state — extend with recipe/rating/profile queries
- Zustand for UI state (sidebar store pattern) — extend for search/filter state if needed
- Glassmorphism tokens defined in CSS custom properties
- Lucide React for icons

### Integration Points
- Route: /recipes for grid, /recipes/$recipeId for detail, /profile for user settings, /favorites for favorites list, /ingredients for browsing
- Sidebar: Replace placeholder content with actual tag tree component
- NavBar: May need "Favorites" and "Profile" nav items added
- API: Spring Data paginated responses (page, size, sort params) — map to TanStack Query pagination

</code_context>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 02-recipe-browsing-ratings-and-profiles*
*Context gathered: 2026-03-15*
