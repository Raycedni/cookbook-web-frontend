# Phase 2: Recipe Browsing, Ratings, and Profiles - Research

**Researched:** 2026-03-15
**Domain:** React SPA feature implementation -- recipe browsing, rating system, user profiles, ingredient browsing
**Confidence:** HIGH

## Summary

Phase 2 builds the core read-only experience on top of the Phase 1 foundation. It spans four feature domains: recipe browsing with search/filter/pagination (BROWSE-*), multi-criteria ratings (RATE-*), user profile and preferences (USER-*), and ingredient browsing (INGR-*). The existing stack (TanStack Query, TanStack Router, ky, Zustand, Tailwind v4, glassmorphism design system) provides all the primitives needed -- no new dependencies are required.

The primary technical challenges are: (1) wiring TanStack Query's `useInfiniteQuery` to Spring Data's page/size pagination model for the load-more pattern, (2) syncing search/filter state with URL search params via TanStack Router's `validateSearch`, (3) building a hierarchical tag tree component that integrates with the existing sidebar, and (4) implementing serving-count scaling with correct fractional arithmetic for ingredient amounts.

**Primary recommendation:** Use TanStack Router search params as the source of truth for search/filter state (keyword, selected tags, page), TanStack Query's `useInfiniteQuery` for the load-more pagination pattern, and keep all new pages under the `_authenticated` layout route. No new npm dependencies needed.

<user_constraints>

## User Constraints (from CONTEXT.md)

### Locked Decisions
- Responsive auto-fill CSS grid (1 col mobile, 2-3 tablet, 3-4 desktop) using auto-fill/minmax
- Cards use existing GlassCard component with hover effect
- Card content: hero image, title, cook time, average star rating, 1-2 tag chips, favorite heart overlay on image corner
- "Load more" button (not infinite scroll, not numbered pagination) -- appends results, shows count indicator
- Uses TanStack Query's useInfiniteQuery with Spring Data pagination params (page, size)
- Search bar at top of content area, full width, always visible above grid
- Active filter chips (tags) below search bar with X to remove
- Debounced live search (~300ms) with dynamic result updates
- Combined AND filtering (keyword + tags applied simultaneously)
- Hierarchical expandable tag tree in sidebar (replacing existing placeholder)
- Collapsible parent tags with nested children -- click parent to expand/collapse, click leaf to filter

### Claude's Discretion
- Recipe detail page layout (hero image, ingredient/step sections, rating breakdown, serving scaler)
- Rating interaction UI (stars, sliders, per-criterion presentation)
- User profile and preferences page layout
- Ingredient browsing page design
- Empty states for no results, no favorites, no ratings
- Image placeholder/fallback when recipe has no hero image
- Mobile tag access (how sidebar tags are accessible on mobile)
- URL sync for search/filter state (whether search query and tags persist in URL)

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope

</user_constraints>

<phase_requirements>

## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| BROWSE-01 | User can view recipes in a card grid with hero images, title, cook time, and rating | CSS grid auto-fill/minmax pattern, GlassCard component, ky GET with searchParams |
| BROWSE-02 | User can search recipes by keyword with results updating dynamically | Debounced input + TanStack Router search params + query key invalidation |
| BROWSE-03 | User can filter recipes by tags via hierarchical tag navigation | Recursive tree component in sidebar, tag IDs in search params |
| BROWSE-04 | User can view paginated recipe lists with load-more controls | useInfiniteQuery with Spring Data page/size, getNextPageParam from totalPages |
| BROWSE-05 | User can view a recipe detail page with hero image, ingredients, steps, metadata, and ratings | Dynamic route /recipes/$recipeId, useQuery for single recipe fetch |
| BROWSE-06 | User can adjust serving count and see ingredient amounts recalculated in real-time | Local state for serving multiplier, fractional arithmetic utility |
| BROWSE-07 | User can add/remove recipes from favorites via heart icon on cards and detail page | Optimistic mutation with useMutation, heart icon toggle |
| BROWSE-08 | User can view their favorites list | Dedicated /favorites route, useQuery for favorites endpoint |
| RATE-01 | User can view rating summary (average scores) on recipe cards and detail page | Rating data included in recipe API responses, star display component |
| RATE-02 | User can view detailed multi-criteria rating breakdown on recipe detail page | Criteria list with individual scores, bar/star visualization |
| RATE-03 | User can submit a rating with scores for each active criterion | useMutation POST, form with per-criterion star input |
| RATE-04 | User can edit or delete their own rating | useMutation PUT/DELETE, conditional render based on user's existing rating |
| USER-01 | User can view and edit their profile (display name) | /profile route, GET + PUT user profile endpoint |
| USER-02 | User can set dietary/allergen preferences | Allergen checkbox/toggle list, PUT preferences endpoint |
| USER-03 | User can manage favorite ingredients | Search + add/remove ingredient favorites, dedicated API calls |
| USER-04 | User can hide/unhide tags from their browsing experience | Tag visibility toggles in profile, persisted via API |
| INGR-01 | User can browse ingredients with search | /ingredients route, searchable list with ky GET |
| INGR-02 | User can view ingredient details including nutritional info and allergens | Ingredient detail view/modal with allergen badges |

</phase_requirements>

## Standard Stack

### Core (already installed -- no new dependencies)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @tanstack/react-query | ^5.90.21 | Server state, caching, infinite queries | Already in use; useInfiniteQuery for load-more, useMutation for ratings/favorites |
| @tanstack/react-router | ^1.167.0 | File-based routing, type-safe search params | Already in use; validateSearch for URL-synced filters |
| ky | ^1.14.3 | HTTP client with searchParams | Already in use; searchParams option for pagination/filter params |
| zustand | ^5.0.11 | Client-side UI state | Already in use; sidebar state pattern established |
| lucide-react | ^0.577.0 | Icons | Already in use; Heart, Star, Search, ChevronRight, ChevronDown, etc. |
| tailwindcss | ^4.2.1 | Utility CSS with glassmorphism tokens | Already in use; CSS grid, responsive utilities |

### Supporting (already installed)
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| clsx + tailwind-merge (via cn) | ^2.1.1 / ^3.5.0 | Conditional class merging | All component className composition |

### No New Dependencies Needed
The existing stack covers all Phase 2 needs:
- Debouncing: use a simple `useDebounce` custom hook (setTimeout/clearTimeout) -- no library needed for a single 300ms debounce
- Form state for ratings: local React state -- no form library needed for simple star inputs
- Fractional math for serving scaling: plain JS arithmetic -- no library needed

## Architecture Patterns

### Recommended Project Structure
```
src/
  routes/
    _authenticated/
      recipes.tsx              # /recipes - grid with search/filter/pagination
      recipes.$recipeId.tsx    # /recipes/$recipeId - detail page
      favorites.tsx            # /favorites - favorites list
      profile.tsx              # /profile - user profile & preferences
      ingredients.tsx          # /ingredients - ingredient browsing
  features/
    recipes/
      api/
        recipe-queries.ts      # queryOptions factories for recipes
        recipe-api.ts          # ky-based API functions (getRecipes, getRecipe, etc.)
      ui/
        RecipeCard.tsx          # Single recipe card (uses GlassCard)
        RecipeGrid.tsx          # CSS grid of RecipeCards + load-more
        RecipeCardSkeleton.tsx  # Loading skeleton for card
        SearchBar.tsx           # Debounced search input
        TagTree.tsx             # Hierarchical tag tree for sidebar
        TagChips.tsx            # Active filter tag chips with remove
        ServingScaler.tsx       # +/- serving count adjuster
        IngredientList.tsx      # Scaled ingredient list
        StepList.tsx            # Recipe steps display
    ratings/
      api/
        rating-queries.ts      # queryOptions for ratings
        rating-api.ts          # ky-based rating API functions
      ui/
        RatingStars.tsx         # Star display (read-only) for cards/detail
        RatingBreakdown.tsx     # Multi-criteria breakdown display
        RatingForm.tsx          # Per-criterion star input form
    favorites/
      api/
        favorite-queries.ts    # queryOptions for favorites
        favorite-api.ts        # ky-based favorite API functions
      ui/
        FavoriteButton.tsx     # Heart icon toggle (used on cards + detail)
    profile/
      api/
        profile-queries.ts     # queryOptions for profile/preferences
        profile-api.ts         # ky-based profile API functions
      ui/
        ProfileForm.tsx        # Display name edit form
        AllergenPreferences.tsx # Allergen toggles
        FavoriteIngredients.tsx # Manage favorite ingredients
        TagVisibility.tsx      # Hide/unhide tags
    ingredients/
      api/
        ingredient-queries.ts  # queryOptions for ingredients
        ingredient-api.ts      # ky-based ingredient API functions
      ui/
        IngredientCard.tsx     # Ingredient display with allergen info
        IngredientSearch.tsx   # Search input for ingredients
  shared/
    hooks/
      useDebounce.ts           # Generic debounce hook
    ui/
      StarRating.tsx           # Reusable star display (1-5, fractional)
      EmptyState.tsx           # Reusable empty state component
```

### Pattern 1: TanStack Query Options Factories
**What:** Centralize query configuration using `queryOptions()` factory functions.
**When to use:** Every API data-fetching concern.
**Example:**
```typescript
// features/recipes/api/recipe-queries.ts
import { queryOptions, infiniteQueryOptions } from '@tanstack/react-query'
import { getRecipes, getRecipe } from './recipe-api'

export const recipeQueries = {
  all: () => ['recipes'] as const,
  list: (filters: RecipeFilters) =>
    infiniteQueryOptions({
      queryKey: [...recipeQueries.all(), 'list', filters],
      queryFn: ({ pageParam }) => getRecipes({ ...filters, page: pageParam }),
      initialPageParam: 0,
      getNextPageParam: (lastPage) =>
        lastPage.last ? undefined : lastPage.number + 1,
    }),
  detail: (id: string) =>
    queryOptions({
      queryKey: [...recipeQueries.all(), 'detail', id],
      queryFn: () => getRecipe(id),
    }),
}
```

### Pattern 2: Spring Data Pagination with useInfiniteQuery
**What:** Map Spring Data's Page response to TanStack Query's infinite query model.
**When to use:** Recipe grid load-more (BROWSE-04).
**Example:**
```typescript
// Spring Data Page response shape
interface SpringPage<T> {
  content: T[]
  number: number        // 0-based current page
  size: number          // page size
  totalElements: number // total items
  totalPages: number    // total pages
  last: boolean         // is this the last page?
  first: boolean        // is this the first page?
}

// API function
async function getRecipes(params: {
  page: number
  size?: number
  search?: string
  tagIds?: number[]
}): Promise<SpringPage<RecipeSummary>> {
  return apiClient
    .get('recipes', {
      searchParams: {
        page: params.page,
        size: params.size ?? 12,
        ...(params.search && { search: params.search }),
        ...(params.tagIds?.length && { tagIds: params.tagIds.join(',') }),
      },
    })
    .json<SpringPage<RecipeSummary>>()
}

// In component
const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
  useInfiniteQuery(recipeQueries.list(filters))

// Flatten pages for rendering
const recipes = data?.pages.flatMap((page) => page.content) ?? []
const totalElements = data?.pages[0]?.totalElements ?? 0
```

### Pattern 3: URL-Synced Search/Filter State via TanStack Router
**What:** Use TanStack Router's `validateSearch` to make search params the source of truth for filters.
**When to use:** Recipe browsing page -- search keyword and tag filters persist in URL.
**Recommendation (Claude's Discretion):** YES, sync search/filter state to URL. This enables shareable filtered views and preserves state on browser back/forward.
**Example:**
```typescript
// routes/_authenticated/recipes.tsx
import { createFileRoute } from '@tanstack/react-router'

type RecipeSearch = {
  q?: string
  tags?: number[]
}

export const Route = createFileRoute('/_authenticated/recipes')({
  validateSearch: (search: Record<string, unknown>): RecipeSearch => ({
    q: typeof search.q === 'string' ? search.q : undefined,
    tags: Array.isArray(search.tags)
      ? search.tags.filter((t): t is number => typeof t === 'number')
      : undefined,
  }),
  component: RecipeBrowsePage,
})

function RecipeBrowsePage() {
  const { q, tags } = Route.useSearch()
  const navigate = useNavigate({ from: Route.fullPath })

  // Update search params (triggers re-render, updates URL)
  const setSearch = (query: string) => {
    navigate({ search: (prev) => ({ ...prev, q: query || undefined }) })
  }
  const toggleTag = (tagId: number) => {
    navigate({
      search: (prev) => {
        const current = prev.tags ?? []
        const next = current.includes(tagId)
          ? current.filter((t) => t !== tagId)
          : [...current, tagId]
        return { ...prev, tags: next.length ? next : undefined }
      },
    })
  }
}
```

### Pattern 4: Debounced Search Input
**What:** Debounce user input before updating URL search params to avoid excessive API calls.
**When to use:** Search bar (BROWSE-02).
**Example:**
```typescript
// shared/hooks/useDebounce.ts
import { useState, useEffect } from 'react'

export function useDebounce<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])
  return debounced
}

// Usage in SearchBar: local state for immediate input, debounced value syncs to URL
function SearchBar({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [input, setInput] = useState(value)
  const debounced = useDebounce(input, 300)

  useEffect(() => {
    onChange(debounced)
  }, [debounced, onChange])

  // Sync external value changes (e.g., clear)
  useEffect(() => {
    setInput(value)
  }, [value])

  return (
    <GlassPanel className="flex items-center gap-3 px-4 py-3">
      <Search className="h-5 w-5 text-white/40" />
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Search recipes..."
        className="flex-1 bg-transparent text-white placeholder-white/30 outline-none"
      />
      {input && (
        <button onClick={() => setInput('')}>
          <X className="h-4 w-4 text-white/40 hover:text-white" />
        </button>
      )}
    </GlassPanel>
  )
}
```

### Pattern 5: Optimistic Favorite Toggle
**What:** Immediately update UI when toggling favorites, roll back on error.
**When to use:** Favorite heart icon (BROWSE-07).
**Example:**
```typescript
function useToggleFavorite() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (recipeId: string) =>
      apiClient.post(`users/me/favorites/${recipeId}`).json(),
    onMutate: async (recipeId) => {
      // Cancel outgoing queries
      await queryClient.cancelQueries({ queryKey: ['recipes'] })
      // Snapshot for rollback
      const previous = queryClient.getQueryData(['favorites'])
      // Optimistically update
      queryClient.setQueryData(['favorites'], (old: string[]) =>
        old?.includes(recipeId)
          ? old.filter((id) => id !== recipeId)
          : [...(old ?? []), recipeId],
      )
      return { previous }
    },
    onError: (_err, _id, context) => {
      queryClient.setQueryData(['favorites'], context?.previous)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] })
      queryClient.invalidateQueries({ queryKey: ['recipes'] })
    },
  })
}
```

### Pattern 6: Serving Count Scaling
**What:** Multiply ingredient amounts by a ratio when user adjusts servings.
**When to use:** Recipe detail page (BROWSE-06).
**Example:**
```typescript
function scaleAmount(originalAmount: number, originalServings: number, targetServings: number): number {
  const scaled = (originalAmount / originalServings) * targetServings
  // Round to 2 decimal places, clean trailing zeros
  return Math.round(scaled * 100) / 100
}

function formatAmount(amount: number): string {
  // Display clean numbers: 1 not 1.00, 0.5 not 0.50, 1.25 stays 1.25
  return amount % 1 === 0 ? String(amount) : String(amount)
}
```

### Anti-Patterns to Avoid
- **Zustand for server state:** Do NOT put recipe data, ratings, or favorites in Zustand. Use TanStack Query for all server-fetched data. Zustand is only for client-only UI state (sidebar open/close, local UI toggles).
- **Fetching on mount without query keys including filters:** Always include search/filter params in the query key so TanStack Query refetches when filters change. `['recipes', 'list', { q, tags }]` not just `['recipes']`.
- **Replacing pages on load-more:** The load-more pattern appends. Use `useInfiniteQuery` which accumulates `data.pages` array. Never replace previous results.
- **Uncontrolled search input synced directly to URL:** This causes a keystroke per navigation. Use local state + debounce, then sync debounced value to URL.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Pagination cache | Custom page cache/state | TanStack Query useInfiniteQuery | Handles page accumulation, cache invalidation, refetch, garbage collection |
| Server state management | Zustand store for API data | TanStack Query useQuery/useMutation | Stale-while-revalidate, deduplication, background refetch, optimistic updates |
| URL search params parsing | Manual URLSearchParams | TanStack Router validateSearch | Type-safe validation, automatic serialization/deserialization |
| HTTP request construction | Raw fetch with manual headers | ky apiClient (already configured) | Bearer token injection, prefix URL, searchParams serialization |
| CSS grid responsive layout | Manual media queries | Tailwind grid + auto-fill/minmax | `grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))]` -- one class string |

**Key insight:** The existing stack already solves every infrastructure problem in this phase. The work is feature implementation on top of established patterns, not infrastructure.

## Common Pitfalls

### Pitfall 1: useInfiniteQuery key mismatch on filter change
**What goes wrong:** When search/filter params change, stale pages from the old filter are shown because the query key didn't change.
**Why it happens:** Filter params omitted from query key, or using a single static key.
**How to avoid:** Always include all filter params in the query key: `['recipes', 'list', { q, tags }]`. TanStack Query treats different keys as different cache entries.
**Warning signs:** Changing search text shows old results briefly, or results don't update at all.

### Pitfall 2: Spring Data page is 0-indexed
**What goes wrong:** First page returns empty or second page of results.
**Why it happens:** Spring Data pages start at 0, but developers often pass 1 as the initial page.
**How to avoid:** Set `initialPageParam: 0` and increment in `getNextPageParam` as `lastPage.number + 1`.
**Warning signs:** First load shows wrong results or "page 2" content.

### Pitfall 3: Debounce causing stale closure over navigate
**What goes wrong:** Debounced callback captures an old reference to navigate, causing search params to overwrite each other.
**Why it happens:** useEffect with debounce captures the navigate function at closure time.
**How to avoid:** Use the functional updater form: `navigate({ search: (prev) => ({ ...prev, q }) })` so it always merges with the latest params.
**Warning signs:** Adding a tag clears the search query, or typing clears selected tags.

### Pitfall 4: Favorite toggle race condition
**What goes wrong:** Rapid toggling sends multiple POST/DELETE requests that arrive out of order.
**Why it happens:** No request deduplication or cancellation.
**How to avoid:** Use optimistic updates with `onMutate`/`onError` rollback and `onSettled` invalidation. The UI reflects the intent immediately; the server state syncs eventually.
**Warning signs:** Heart icon flickers or ends up in wrong state after rapid clicks.

### Pitfall 5: Tag tree re-renders entire sidebar on expand/collapse
**What goes wrong:** Expanding a parent tag re-renders all tags, causing visible lag with many tags.
**Why it happens:** Single state object for all expand/collapse states, passed as prop.
**How to avoid:** Use a `Set<number>` for expanded tag IDs. Memoize individual TagNode components with `React.memo`. Pass callbacks via context or stable references.
**Warning signs:** Noticeable jank when expanding/collapsing tag categories.

### Pitfall 6: Image loading causes layout shift
**What goes wrong:** Recipe cards jump around as hero images load at different times.
**Why it happens:** No explicit height/aspect ratio on image container.
**How to avoid:** Set a fixed aspect ratio on the image container (e.g., `aspect-[4/3]`) and use `object-cover`. Show a placeholder gradient until the image loads.
**Warning signs:** Cards visibly resize after page load.

## Code Examples

### CSS Grid Layout for Recipe Cards
```typescript
// Responsive auto-fill grid -- locked decision
<div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-4">
  {recipes.map((recipe) => (
    <RecipeCard key={recipe.id} recipe={recipe} />
  ))}
</div>
```

### Recipe Card Component Structure
```typescript
function RecipeCard({ recipe }: { recipe: RecipeSummary }) {
  return (
    <Link to="/recipes/$recipeId" params={{ recipeId: recipe.id }}>
      <GlassCard className="p-0 overflow-hidden">
        {/* Hero image with favorite overlay */}
        <div className="relative aspect-[4/3]">
          <img
            src={recipe.imageUrl ?? '/placeholder-recipe.svg'}
            alt={recipe.title}
            className="h-full w-full object-cover"
          />
          <FavoriteButton
            recipeId={recipe.id}
            isFavorite={recipe.isFavorite}
            className="absolute top-2 right-2"
          />
        </div>
        {/* Card content */}
        <div className="p-4 space-y-2">
          <h3 className="font-semibold text-white truncate">{recipe.title}</h3>
          <div className="flex items-center gap-3 text-sm text-white/60">
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {recipe.cookTime} min
            </span>
            <span className="flex items-center gap-1">
              <Star className="h-3.5 w-3.5 fill-accent text-accent" />
              {recipe.averageRating.toFixed(1)}
            </span>
          </div>
          {/* Tag chips */}
          <div className="flex gap-1.5 flex-wrap">
            {recipe.tags.slice(0, 2).map((tag) => (
              <span key={tag.id} className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-white/60">
                {tag.name}
              </span>
            ))}
          </div>
        </div>
      </GlassCard>
    </Link>
  )
}
```

### Load More Button
```typescript
function LoadMoreButton({
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
  shown,
  total,
}: LoadMoreProps) {
  return (
    <div className="flex flex-col items-center gap-3 pt-6">
      <p className="text-sm text-white/40">
        Showing {shown} of {total} recipes
      </p>
      {hasNextPage && (
        <button
          onClick={() => fetchNextPage()}
          disabled={isFetchingNextPage}
          className="px-6 py-2 rounded-lg bg-accent/20 text-accent-light hover:bg-accent/30 transition-colors disabled:opacity-50"
        >
          {isFetchingNextPage ? 'Loading...' : 'Load more'}
        </button>
      )}
    </div>
  )
}
```

### Hierarchical Tag Tree
```typescript
interface TagNode {
  id: number
  name: string
  children: TagNode[]
}

function TagTree({ tags, selectedIds, onToggle }: TagTreeProps) {
  return (
    <ul className="space-y-1">
      {tags.map((tag) => (
        <TagTreeNode
          key={tag.id}
          tag={tag}
          selectedIds={selectedIds}
          onToggle={onToggle}
        />
      ))}
    </ul>
  )
}

function TagTreeNode({ tag, selectedIds, onToggle }: TagTreeNodeProps) {
  const [expanded, setExpanded] = useState(false)
  const hasChildren = tag.children.length > 0
  const isSelected = selectedIds.includes(tag.id)

  return (
    <li>
      <div className="flex items-center gap-1.5 py-1 text-sm">
        {hasChildren ? (
          <button onClick={() => setExpanded(!expanded)} className="text-white/40 hover:text-white">
            {expanded ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
          </button>
        ) : (
          <span className="w-3.5" /> /* spacer */
        )}
        <button
          onClick={() => onToggle(tag.id)}
          className={cn(
            'hover:text-white transition-colors',
            isSelected ? 'text-accent-light font-medium' : 'text-white/60',
          )}
        >
          {tag.name}
        </button>
      </div>
      {hasChildren && expanded && (
        <ul className="ml-4">
          {tag.children.map((child) => (
            <TagTreeNode
              key={child.id}
              tag={child}
              selectedIds={selectedIds}
              onToggle={onToggle}
            />
          ))}
        </ul>
      )}
    </li>
  )
}
```

### Mobile Tag Access (Claude's Discretion Recommendation)
**Recommendation:** Use a slide-up sheet/modal triggered by a "Filter" button visible only on mobile. The same TagTree component renders inside the sheet. This avoids the sidebar (which is hidden on mobile) and keeps the mobile experience clean.

```typescript
// On mobile: show filter button below search bar
<button
  onClick={() => setShowMobileTags(true)}
  className="md:hidden flex items-center gap-2 px-3 py-2 rounded-lg bg-white/10 text-white/60"
>
  <Filter className="h-4 w-4" />
  Filter by tags
  {selectedTags.length > 0 && (
    <span className="bg-accent/30 text-accent-light text-xs px-1.5 rounded-full">
      {selectedTags.length}
    </span>
  )}
</button>
```

### Recipe Detail Layout (Claude's Discretion Recommendation)
**Recommendation:** Full-width hero image at top, then two-column layout on desktop (left: ingredients with serving scaler, right: steps). Rating breakdown in a separate section below steps. On mobile, stack everything single-column.

### Rating UI (Claude's Discretion Recommendation)
**Recommendation:** Interactive clickable stars (1-5) for each criterion. Display criteria names with star inputs in a vertical list. Show overall average prominently at top. Use filled/half/empty star icons from lucide-react (Star with fill prop).

### Empty States (Claude's Discretion Recommendation)
**Recommendation:** Centered illustration area (lucide icon + text) inside a GlassPanel:
- No search results: "No recipes found. Try different keywords or filters."
- No favorites: "No favorites yet. Heart a recipe to save it here."
- No ratings: "Be the first to rate this recipe."

### Image Fallback (Claude's Discretion Recommendation)
**Recommendation:** Use a gradient placeholder (`bg-gradient-to-br from-accent/20 to-accent/5`) with a centered ChefHat icon when no image URL exists. Use `onError` on `<img>` to swap to placeholder on broken images.

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| useQuery + manual page tracking | useInfiniteQuery with initialPageParam | TanStack Query v5 (2023) | getNextPageParam replaces manual page state; maxPages replaces refetchPage |
| Manual URLSearchParams parsing | TanStack Router validateSearch | TanStack Router v1 (2024) | Type-safe, automatic serialization, integrates with routing |
| Separate state for search + API call | Query key includes search params | TanStack Query pattern | Automatic refetch on filter change, cache per filter combination |

**Current patterns confirmed:**
- TanStack Query v5: `infiniteQueryOptions()` factory is the recommended approach (replaces inline config)
- TanStack Router v1: `Route.useSearch()` is preferred over `useSearch({ from: ... })` for co-located routes
- ky `searchParams` option handles query string serialization natively -- no URLSearchParams construction needed

## Open Questions

1. **Backend API shape for ratings**
   - What we know: Multi-criteria ratings exist (RATE-01, RATE-02). Criteria are managed by admin (ADMIN-05).
   - What's unclear: Exact API endpoints and response shape for submitting/fetching ratings. Whether rating criteria come as part of recipe detail or require separate fetch.
   - Recommendation: Assume `GET /recipes/{id}/ratings` for breakdown, `POST /recipes/{id}/ratings` for submission, `GET /rating-criteria` for active criteria list. Adjust when backend API docs are available.

2. **Backend API for tag hierarchy**
   - What we know: Tags are hierarchical with parent/child relationships.
   - What's unclear: Whether the API returns a flat list with parentId or a nested tree structure.
   - Recommendation: Assume flat list with parentId. Build a `buildTagTree()` utility that converts flat to nested. This handles both cases.

3. **Favorite ingredient API**
   - What we know: USER-03 requires managing favorite ingredients.
   - What's unclear: Exact endpoint structure.
   - Recommendation: Assume `GET/POST/DELETE /users/me/favorite-ingredients` pattern consistent with recipe favorites.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest 4.1.0 + @testing-library/react 16.3.2 |
| Config file | vitest.config.ts |
| Quick run command | `npm test` (vitest run) |
| Full suite command | `npm test` |

### Phase Requirements to Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| BROWSE-01 | Recipe grid renders cards with image, title, time, rating | unit | `npx vitest run src/features/recipes/ui/RecipeGrid.test.tsx` | No -- Wave 0 |
| BROWSE-02 | Search input debounces and updates results | unit | `npx vitest run src/features/recipes/ui/SearchBar.test.tsx` | No -- Wave 0 |
| BROWSE-03 | Tag tree renders hierarchy, toggles filter | unit | `npx vitest run src/features/recipes/ui/TagTree.test.tsx` | No -- Wave 0 |
| BROWSE-04 | Load-more fetches next page, appends results | unit | `npx vitest run src/features/recipes/ui/RecipeGrid.test.tsx` | No -- Wave 0 |
| BROWSE-05 | Recipe detail renders all sections | unit | `npx vitest run src/routes/_authenticated/recipes.$recipeId.test.tsx` | No -- Wave 0 |
| BROWSE-06 | Serving scaler recalculates amounts | unit | `npx vitest run src/features/recipes/ui/ServingScaler.test.tsx` | No -- Wave 0 |
| BROWSE-07 | Favorite toggle calls mutation | unit | `npx vitest run src/features/favorites/ui/FavoriteButton.test.tsx` | No -- Wave 0 |
| BROWSE-08 | Favorites list renders user favorites | unit | `npx vitest run src/routes/_authenticated/favorites.test.tsx` | No -- Wave 0 |
| RATE-01 | Rating stars display average score | unit | `npx vitest run src/features/ratings/ui/RatingStars.test.tsx` | No -- Wave 0 |
| RATE-02 | Rating breakdown shows per-criterion scores | unit | `npx vitest run src/features/ratings/ui/RatingBreakdown.test.tsx` | No -- Wave 0 |
| RATE-03 | Rating form submits scores per criterion | unit | `npx vitest run src/features/ratings/ui/RatingForm.test.tsx` | No -- Wave 0 |
| RATE-04 | User can edit/delete own rating | unit | `npx vitest run src/features/ratings/ui/RatingForm.test.tsx` | No -- Wave 0 |
| USER-01 | Profile form displays and updates name | unit | `npx vitest run src/features/profile/ui/ProfileForm.test.tsx` | No -- Wave 0 |
| USER-02 | Allergen preferences toggle and save | unit | `npx vitest run src/features/profile/ui/AllergenPreferences.test.tsx` | No -- Wave 0 |
| USER-03 | Favorite ingredients add/remove | unit | `npx vitest run src/features/profile/ui/FavoriteIngredients.test.tsx` | No -- Wave 0 |
| USER-04 | Tag visibility toggles and saves | unit | `npx vitest run src/features/profile/ui/TagVisibility.test.tsx` | No -- Wave 0 |
| INGR-01 | Ingredient search filters list | unit | `npx vitest run src/features/ingredients/ui/IngredientSearch.test.tsx` | No -- Wave 0 |
| INGR-02 | Ingredient detail shows allergens | unit | `npx vitest run src/features/ingredients/ui/IngredientCard.test.tsx` | No -- Wave 0 |

### Sampling Rate
- **Per task commit:** `npm test`
- **Per wave merge:** `npm test`
- **Phase gate:** Full suite green before /gsd:verify-work

### Wave 0 Gaps
- [ ] `src/features/recipes/ui/RecipeGrid.test.tsx` -- covers BROWSE-01, BROWSE-04
- [ ] `src/features/recipes/ui/SearchBar.test.tsx` -- covers BROWSE-02
- [ ] `src/features/recipes/ui/TagTree.test.tsx` -- covers BROWSE-03
- [ ] `src/features/recipes/ui/ServingScaler.test.tsx` -- covers BROWSE-06
- [ ] `src/features/favorites/ui/FavoriteButton.test.tsx` -- covers BROWSE-07
- [ ] `src/features/ratings/ui/RatingStars.test.tsx` -- covers RATE-01
- [ ] `src/features/ratings/ui/RatingForm.test.tsx` -- covers RATE-03, RATE-04
- [ ] `src/features/profile/ui/ProfileForm.test.tsx` -- covers USER-01
- [ ] `src/shared/hooks/useDebounce.test.ts` -- covers debounce utility
- [ ] Test mocks for TanStack Query (QueryClientProvider wrapper) and TanStack Router (RouterProvider mock)

## Sources

### Primary (HIGH confidence)
- Existing codebase analysis (src/shared/*, src/routes/*, package.json) -- established patterns, component APIs, versions
- [TanStack Query Infinite Queries docs](https://tanstack.com/query/latest/docs/framework/react/guides/infinite-queries) -- useInfiniteQuery API
- [TanStack Router Search Params guide](https://tanstack.com/router/latest/docs/guide/search-params) -- validateSearch, useSearch patterns
- [ky GitHub](https://github.com/sindresorhus/ky) -- searchParams option API

### Secondary (MEDIUM confidence)
- [DeepWiki TanStack Router search params](https://deepwiki.com/tanstack/router/9.2-search-parameters-and-state-management) -- validateSearch code examples verified against official docs
- [Leonardo Montini TanStack Router query params](https://leonardomontini.dev/tanstack-router-query-params/) -- Route.useSearch() pattern verified

### Tertiary (LOW confidence)
- Backend API shapes (ratings, tags, ingredients) -- assumed based on requirements and common Spring Data patterns; needs validation against actual API docs

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- all libraries already installed and patterns established in Phase 1
- Architecture: HIGH -- feature-sliced structure follows established project patterns
- Pitfalls: HIGH -- well-documented TanStack Query/Router gotchas with known solutions
- Backend API shapes: LOW -- assumed from requirements, not verified against actual backend

**Research date:** 2026-03-15
**Valid until:** 2026-04-15 (stable -- all dependencies already locked in package.json)
