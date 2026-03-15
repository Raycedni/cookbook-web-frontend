---
phase: 03-recipe-management
plan: 01
subsystem: api, ui
tags: [dnd-kit, tanstack-query, ky, drag-drop, image-upload, recipe-crud]

requires:
  - phase: 02-recipe-browsing
    provides: recipe types, apiClient, recipeQueries factory
provides:
  - CreateRecipeRequest, UpdateRecipeRequest, WizardState form types
  - Recipe CRUD API functions (create, update, delete, share, image upload)
  - units(), assignableTags(), shared() query factories
  - ImageDropZone reusable component with drag-and-drop file upload
  - dnd-kit packages for sortable ingredient/step lists
affects: [03-recipe-management]

tech-stack:
  added: ["@dnd-kit/core", "@dnd-kit/sortable", "@dnd-kit/utilities"]
  patterns: [FormData multipart upload for images, form row types with localId for dnd-kit keys]

key-files:
  created:
    - src/features/recipes/ui/ImageDropZone.tsx
    - src/features/recipes/ui/ImageDropZone.test.tsx
  modified:
    - src/features/recipes/api/types.ts
    - src/features/recipes/api/recipe-api.ts
    - src/features/recipes/api/recipe-queries.ts
    - package.json

key-decisions:
  - "IngredientFormRow/StepFormRow use localId (crypto.randomUUID) as dnd-kit sortable keys"
  - "Image upload uses FormData body without explicit Content-Type (ky auto-sets multipart boundary)"
  - "ImageDropZone filters dropped files by type.startsWith('image/') for safety"

patterns-established:
  - "Form row types with localId for drag-and-drop reordering"
  - "Glassmorphism drop zone: border-dashed border-white/20 with accent on drag-over"

requirements-completed: [RECIPE-01, RECIPE-02, RECIPE-04]

duration: 4min
completed: 2026-03-15
---

# Phase 03 Plan 01: Recipe API Foundation Summary

**Recipe CRUD API layer with mutation types, image upload, query factories, dnd-kit, and ImageDropZone component**

## Performance

- **Duration:** 4 min
- **Started:** 2026-03-15T13:20:37Z
- **Completed:** 2026-03-15T13:24:51Z
- **Tasks:** 2
- **Files modified:** 6

## Accomplishments
- Extended types.ts with 9 new types (Unit, MediaFileResponse, ShareResponse, IngredientFormRow, StepFormRow, WizardState, CreateRecipeRequest, UpdateRecipeRequest)
- Added 10 API functions for recipe CRUD, sharing, image upload, units, and assignable tags
- Added 3 query factory entries (units, assignableTags, shared)
- Built ImageDropZone component with drag-and-drop, file picker, preview thumbnails, and 7 passing tests
- Installed dnd-kit packages for sortable ingredient/step lists in upcoming wizard

## Task Commits

Each task was committed atomically:

1. **Task 1: Install dnd-kit and add mutation types + API functions** - `74b11e2` (feat)
2. **Task 2 RED: Failing tests for ImageDropZone** - `637e9b4` (test)
3. **Task 2 GREEN: Implement ImageDropZone component** - `0e2ffb9` (feat)

## Files Created/Modified
- `src/features/recipes/api/types.ts` - Added 9 new types for recipe mutations and wizard form state
- `src/features/recipes/api/recipe-api.ts` - Added 10 API functions for CRUD, sharing, image upload
- `src/features/recipes/api/recipe-queries.ts` - Added units, assignableTags, shared query factories
- `src/features/recipes/ui/ImageDropZone.tsx` - Reusable drag-and-drop image upload component
- `src/features/recipes/ui/ImageDropZone.test.tsx` - 7 tests for ImageDropZone
- `package.json` - Added @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities

## Decisions Made
- IngredientFormRow and StepFormRow use `localId` (crypto.randomUUID) as dnd-kit sortable keys
- Image upload uses FormData body without explicit Content-Type header (ky auto-sets multipart boundary)
- ImageDropZone filters dropped files by `type.startsWith('image/')` for safety

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed drag-over test assertion specificity**
- **Found during:** Task 2 (ImageDropZone TDD GREEN phase)
- **Issue:** Test checked `not.toMatch(/border-accent/)` after dragLeave, but the default state includes `hover:border-accent/50` which also matches
- **Fix:** Changed assertion to check for specific classes (`border-accent bg-accent/10` vs `border-white/20`)
- **Files modified:** src/features/recipes/ui/ImageDropZone.test.tsx
- **Verification:** All 7 tests pass
- **Committed in:** 0e2ffb9 (Task 2 GREEN commit)

---

**Total deviations:** 1 auto-fixed (1 bug)
**Impact on plan:** Minor test assertion fix for correctness. No scope creep.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- All types, API functions, and shared components ready for Plan 02 (Recipe Wizard Form)
- dnd-kit installed and ready for sortable ingredient/step rows
- ImageDropZone ready for hero image and step image uploads in wizard

---
*Phase: 03-recipe-management*
*Completed: 2026-03-15*
