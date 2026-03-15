---
phase: 04-meal-planning-and-shopping
plan: 04
subsystem: ui
tags: [react, dnd-kit, drag-and-drop, auto-generate, meal-planning, tanstack-query]

requires:
  - phase: 04-meal-planning-and-shopping
    provides: WeeklyCalendar, CalendarCell, RecipePickerModal, MealSlotManager, $planId route
  - phase: 02-recipe-browsing
    provides: recipeQueries.list, recipeQueries.tags, RecipeSummary, StarRating, GlassPanel, Skeleton, useDebounce
provides:
  - RecipeDragPanel with searchable draggable recipe list using @dnd-kit/core
  - DraggableRecipe with useDraggable hook for recipe items
  - AutoFillModal with 6 preference parameters for meal generation
  - DndContext-wrapped calendar with DragOverlay and drop targets
  - Per-slot regeneration with skeleton shimmer loading
affects: [04-05]

tech-stack:
  added: []
  patterns: [DndContext with useDraggable/useDroppable for cross-component drag-and-drop, PointerSensor with distance constraint]

key-files:
  created:
    - src/features/meals/ui/RecipeDragPanel.tsx
    - src/features/meals/ui/DraggableRecipe.tsx
    - src/features/meals/ui/AutoFillModal.tsx
  modified:
    - src/features/meals/ui/WeeklyCalendar.tsx
    - src/features/meals/ui/CalendarCell.tsx
    - src/routes/_authenticated/meal-plans/$planId.tsx

key-decisions:
  - "DndContext wraps both calendar grid and RecipeDragPanel as siblings (no nested DndContexts)"
  - "PointerSensor with distance: 8 distinguishes click from drag"
  - "DragOverlay renders compact recipe card preview at z-50 with backdrop-blur"
  - "AutoFillModal pre-fills from plan.generatePreferences if exists"
  - "Per-slot regeneration reuses existing preferences with single-slot override"
  - "useDelayedLoading (200ms delay + 500ms min) for generation skeleton shimmer"

patterns-established:
  - "useDraggable/useDroppable paired pattern: draggable sets data.recipe, droppable sets data.dayIndex+slotId"
  - "Generation loading: parent tracks generatingSlotIds + useDelayedLoading, passes to CalendarCell"

requirements-completed: [MEAL-03, MEAL-05]

duration: 5min
completed: 2026-03-15
---

# Phase 4 Plan 04: Drag-and-Drop and Auto-Generate Summary

**Drag-and-drop recipe assignment via dnd-kit with collapsible side panel, plus auto-generate modal with 6 preference parameters and per-slot regeneration**

## Performance

- **Duration:** 5 min
- **Started:** 2026-03-15T15:19:48Z
- **Completed:** 2026-03-15T15:25:00Z
- **Tasks:** 2
- **Files modified:** 6

## Accomplishments
- Drag-and-drop recipe assignment from collapsible side panel to calendar cells via DndContext
- DragOverlay shows compact recipe card preview during drag, cells highlight with accent border on hover
- Auto-fill modal with meal type checkboxes, tag multi-select, favorites toggle, cook time slider, fill mode radios, repeat tolerance input
- Skeleton shimmer loading in affected calendar cells during generation with useDelayedLoading
- Per-slot refresh icon on generated meals for single-slot regeneration
- Preferences persist per plan and pre-fill on next auto-fill open

## Task Commits

Each task was committed atomically:

1. **Task 1: Add drag-and-drop recipe assignment with DndContext and collapsible panel** - `5ac03ea` (feat)
2. **Task 2: Build AutoFillModal with preference parameters and generation flow** - `d451515` (feat)

## Files Created/Modified
- `src/features/meals/ui/DraggableRecipe.tsx` - useDraggable wrapper rendering compact recipe card with image, title, cook time, rating
- `src/features/meals/ui/RecipeDragPanel.tsx` - Collapsible 250px side panel with search, infinite scroll, draggable recipe list
- `src/features/meals/ui/AutoFillModal.tsx` - Auto-generate settings modal with 6 preference controls and generation mutation
- `src/features/meals/ui/WeeklyCalendar.tsx` - Added DndContext, DragOverlay, PointerSensor, drag event handlers, RecipeDragPanel integration
- `src/features/meals/ui/CalendarCell.tsx` - Added useDroppable with accent highlight, RefreshCw regenerate button, skeleton loading state
- `src/routes/_authenticated/meal-plans/$planId.tsx` - Wired Auto-fill/Regenerate buttons, drag panel toggle, generation state management

## Decisions Made
- DndContext wraps calendar grid and RecipeDragPanel as siblings to avoid nested DndContext conflicts
- PointerSensor with distance: 8px activation constraint prevents accidental drags on click
- DragOverlay uses dropAnimation={null} for immediate response (no spring animation)
- Per-slot regeneration reuses plan.generatePreferences with slotId override and fillMode 'replace_all'
- useDelayedLoading with 200ms delay and 500ms minimum display for consistent skeleton experience
- Drag panel hidden on mobile (power-user only; mobile uses modal flow per CONTEXT.md)

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- All meal planning UI complete (CRUD, calendar, picker, drag-and-drop, auto-generate)
- Ready for Plan 05: Shopping list view
- Shopping List link already wired in toolbar

---
*Phase: 04-meal-planning-and-shopping*
*Completed: 2026-03-15*
