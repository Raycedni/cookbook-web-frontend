---
phase: 02-recipe-browsing-ratings-and-profiles
plan: 01
subsystem: api
tags: [tanstack-query, ky, typescript, react, lucide-react]

# Dependency graph
requires:
  - phase: 01-foundation-and-authentication
    provides: apiClient (ky), GlassPanel, Skeleton, cn utility, test setup
provides:
  - SpringPage<T> generic type for Spring Data pagination
  - RecipeSummary, RecipeDetail, RecipeFilters, Tag, TagNode types
  - RatingCriterion, RatingSummary, UserRating, RatingSubmission types
  - UserProfile, UserPreferences, Allergen types
  - Ingredient, IngredientDetail types
  - recipeQueries factory (list with infiniteQueryOptions, detail, tags)
  - ratingQueries factory (criteria, summary, userRating)
  - favoriteQueries factory and useToggleFavorite optimistic mutation
  - profileQueries factory (profile, preferences, allergens)
  - ingredientQueries factory (list, detail)
  - useDebounce hook
  - StarRating component (fractional, interactive)
  - EmptyState component
  - renderWithProviders test utility
  - buildTagTree utility (flat tags -> nested tree)
affects: [02-02, 02-03, 02-04]

# Tech tracking
tech-stack:
  added: []
  patterns: [query-options-factory, infinite-query-pagination, optimistic-mutation, debounce-hook]

key-files:
  created:
    - src/features/recipes/api/types.ts
    - src/features/recipes/api/recipe-api.ts
    - src/features/recipes/api/recipe-queries.ts
    - src/features/ratings/api/types.ts
    - src/features/ratings/api/rating-api.ts
    - src/features/ratings/api/rating-queries.ts
    - src/features/favorites/api/favorite-api.ts
    - src/features/favorites/api/favorite-queries.ts
    - src/features/profile/api/types.ts
    - src/features/profile/api/profile-api.ts
    - src/features/profile/api/profile-queries.ts
    - src/features/ingredients/api/types.ts
    - src/features/ingredients/api/ingredient-api.ts
    - src/features/ingredients/api/ingredient-queries.ts
    - src/shared/hooks/useDebounce.ts
    - src/shared/hooks/useDebounce.test.ts
    - src/shared/ui/StarRating.tsx
    - src/shared/ui/EmptyState.tsx
    - src/test/utils.tsx
  modified: []

key-decisions:
  - "useToggleFavorite uses optimistic updates with onMutate/onError/onSettled pattern"
  - "buildTagTree converts flat Tag[] with parentId to nested TagNode[] tree"
  - "StarRating uses CSS clip-path overflow for fractional star fill display"
  - "Removed @testing-library/user-event re-export from test utils (not installed)"

patterns-established:
  - "Query options factory: recipeQueries.list(filters) returns infiniteQueryOptions with filter-aware keys"
  - "API function pattern: apiClient.get(endpoint, { searchParams }).json<Type>()"
  - "Feature-sliced directory: src/features/{domain}/api/{types,api,queries}.ts"

requirements-completed: [BROWSE-01, BROWSE-02, BROWSE-04, BROWSE-05, BROWSE-06, BROWSE-07, BROWSE-08, RATE-01, RATE-02, RATE-03, RATE-04, USER-01, USER-02, USER-03, USER-04, INGR-01, INGR-02]

# Metrics
duration: 4min
completed: 2026-03-15
---

# Phase 2 Plan 01: API Layer and Shared Utilities Summary

**Domain types, ky API functions, TanStack Query factories for recipes/ratings/favorites/profile/ingredients plus useDebounce hook, StarRating, EmptyState components, and test render utility**

## Performance

- **Duration:** 4 min
- **Started:** 2026-03-14T23:54:06Z
- **Completed:** 2026-03-14T23:58:13Z
- **Tasks:** 2
- **Files created:** 19

## Accomplishments
- All 5 feature domains (recipes, ratings, favorites, profile, ingredients) have complete type definitions, API functions, and query factories
- Recipe list uses infiniteQueryOptions with Spring Data pagination mapping (page 0-indexed, getNextPageParam from last flag)
- useToggleFavorite mutation with optimistic UI updates and rollback on error
- useDebounce hook with 4 passing tests (initial value, delayed update, timer reset, cleanup)
- StarRating renders fractional 1-5 stars with interactive mode for score input
- EmptyState provides consistent empty state UX with icon/title/description/action

## Task Commits

Each task was committed atomically:

1. **Task 1: Type definitions, API functions, and TanStack Query factories for all domains** - `18cc290` (feat)
2. **Task 2: Shared UI utilities -- useDebounce, StarRating, EmptyState, test render helper** - `fed8542` (feat)

## Files Created/Modified
- `src/features/recipes/api/types.ts` - SpringPage<T>, RecipeSummary, RecipeDetail, Tag, TagNode, RecipeFilters, buildTagTree
- `src/features/recipes/api/recipe-api.ts` - getRecipes (paginated), getRecipe, getTags
- `src/features/recipes/api/recipe-queries.ts` - recipeQueries factory with infiniteQueryOptions for list
- `src/features/ratings/api/types.ts` - RatingCriterion, RatingSummary, UserRating, RatingSubmission
- `src/features/ratings/api/rating-api.ts` - CRUD functions for ratings (get, submit, update, delete)
- `src/features/ratings/api/rating-queries.ts` - ratingQueries factory for criteria, summary, userRating
- `src/features/favorites/api/favorite-api.ts` - getFavorites, toggleFavorite, removeFavorite
- `src/features/favorites/api/favorite-queries.ts` - favoriteQueries factory and useToggleFavorite optimistic mutation
- `src/features/profile/api/types.ts` - UserProfile, UserPreferences, Allergen
- `src/features/profile/api/profile-api.ts` - getProfile, updateProfile, getPreferences, updatePreferences, getAllergens
- `src/features/profile/api/profile-queries.ts` - profileQueries factory
- `src/features/ingredients/api/types.ts` - Ingredient, IngredientDetail
- `src/features/ingredients/api/ingredient-api.ts` - getIngredients (with search), getIngredient
- `src/features/ingredients/api/ingredient-queries.ts` - ingredientQueries factory
- `src/shared/hooks/useDebounce.ts` - Generic debounce hook with configurable delay
- `src/shared/hooks/useDebounce.test.ts` - 4 tests covering initial value, delay, reset, cleanup
- `src/shared/ui/StarRating.tsx` - Fractional star display with interactive mode
- `src/shared/ui/EmptyState.tsx` - Centered empty state with icon/title/description/action
- `src/test/utils.tsx` - renderWithProviders wrapping QueryClientProvider

## Decisions Made
- useToggleFavorite uses optimistic updates following Pattern 5 from research (cancel, snapshot, optimistic, rollback, invalidate)
- buildTagTree handles orphaned tags (parentId references missing parent) by promoting to root
- StarRating uses CSS overflow clip on a percentage-width container for fractional star fill
- Removed @testing-library/user-event re-export from test utils since the package is not installed in devDependencies

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Removed user-event re-export from test utils**
- **Found during:** Task 2 (test render utility)
- **Issue:** @testing-library/user-event is not installed in the project; re-exporting it caused TypeScript compilation failure
- **Fix:** Removed the `export { default as userEvent } from '@testing-library/user-event'` line
- **Files modified:** src/test/utils.tsx
- **Verification:** `npx tsc -b --noEmit` passes
- **Committed in:** fed8542 (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** Minor -- removed one unavailable re-export. No scope creep.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- All domain types and query factories ready for Plans 02-04 to build UI components against
- Feature-sliced directory structure established (src/features/{domain}/api/)
- Shared utilities (useDebounce, StarRating, EmptyState, renderWithProviders) available for all subsequent plans

## Self-Check: PASSED

All 19 created files verified present. Both task commits (18cc290, fed8542) verified in git log.

---
*Phase: 02-recipe-browsing-ratings-and-profiles*
*Completed: 2026-03-15*
