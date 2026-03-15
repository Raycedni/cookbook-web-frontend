# Phase 4: Meal Planning and Shopping - Research

**Researched:** 2026-03-15
**Domain:** Meal plan CRUD, calendar grid layout, drag-and-drop assignment, auto-generation UI, shopping list aggregation
**Confidence:** HIGH

## Summary

Phase 4 adds meal planning with a weekly calendar grid, drag-and-drop recipe assignment, auto-generation with preference parameters, and shopping list generation with ingredient aggregation. The project already has dnd-kit installed (`@dnd-kit/core` ^6.3.1, `@dnd-kit/sortable` ^10.0.0) for sortable lists in recipe forms. This phase extends dnd-kit usage to a different pattern: dragging recipe items onto droppable calendar slot targets using `useDraggable` + `useDroppable` (not `@dnd-kit/sortable`).

The existing codebase establishes strong patterns: feature-sliced architecture (`src/features/meals/`), TanStack Router file-based routing, TanStack Query with query factory pattern, ky-based API client, glassmorphism UI with `GlassPanel`/`GlassCard`/`Skeleton`, and Zustand for local UI state. All of these carry forward directly. The backend API contract is unknown and must be discovered during implementation; API functions should be written against reasonable REST conventions and adjusted when the actual endpoints are confirmed.

**Primary recommendation:** Build incrementally -- meal plan CRUD and types first, then calendar grid layout, then drag-and-drop overlay, then auto-generate UI, then shopping list. Keep the DndContext for calendar assignment separate from any sortable contexts (consistent with Phase 3's "separate DndContext per interaction" decision).

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- 7-column CSS grid for weekly layout: days as columns, meal slots as rows
- Desktop shows full week; mobile shows all 7 days stacked vertically with vertical scroll
- No external calendar library -- built with CSS grid + dnd-kit
- User-defined meal slots (not fixed breakfast/lunch/dinner) -- users create custom meal types
- Meal slot management: users can add/rename/remove slot types for their plans
- Primary flow: click "+" on empty slot opens recipe picker modal with search/filter
- Power-user flow: drag recipe from collapsible recipe panel onto a meal slot (dnd-kit)
- Auto-fill button opens settings panel/modal with 4 preference parameters: meal types to fill, tag/category preferences (reuses TagTree), use only favorites toggle, max cook time slider/input
- Fill mode: "Fill empty slots only" vs "Replace all"
- Configurable repeat tolerance: user sets max times a recipe can appear
- Generated meals show highlighted/badge state ("Generated")
- Full "Regenerate" button + per-slot refresh icon for single meal regeneration
- Loading state: skeleton shimmer in affected slots during generation
- Preferences persist per plan
- Shopping list on dedicated page navigated from meal plan
- Items grouped by ingredient category in collapsible sections
- Each ingredient row: aggregated amount + unit, sub-line listing source recipes
- Per-item estimated cost + total estimated cost (uses backend cost estimation endpoints)
- Checked items: strikethrough + dimmed opacity, stay in place (no reflow)

### Claude's Discretion
- Create/edit form layout and fields presentation
- Navigation between multiple plans (list view, recent plans, etc.)
- Exact recipe picker modal design
- Collapsible recipe panel placement and behavior for drag flow
- Meal slot management UI (add/rename/remove slot types)
- Shopping list check-off persistence strategy (backend vs localStorage based on API availability)
- Empty states for new plans, empty days, empty shopping list
- Cost estimation formatting (currency symbol, decimal places)

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| MEAL-01 | User can create a meal plan with name, date range, and participants count | Standard form pattern with useState, POST to meal-plans API, navigate to plan on success |
| MEAL-02 | User can view meal plans in a calendar/weekly layout with day and meal slots | 7-column CSS grid, user-defined meal slot rows, responsive stacking on mobile |
| MEAL-03 | User can add recipes to meal plan slots | Recipe picker modal (primary) + drag-from-panel (power-user), dnd-kit useDraggable/useDroppable |
| MEAL-04 | User can remove meals from a plan | Click action on filled slot, DELETE mutation, invalidate plan query |
| MEAL-05 | User can auto-generate a meal plan with preference parameters | Settings modal with 4 params + fill mode + repeat tolerance, POST to generate endpoint, skeleton loading |
| MEAL-06 | User can edit an existing meal plan | Reuse create form pre-filled with existing data, PUT to meal-plans API |
| MEAL-07 | User can delete a meal plan with confirmation | window.confirm pattern (consistent with Phase 3), DELETE mutation, navigate to list |
| SHOP-01 | User can generate a shopping list from a meal plan | "Generate shopping list" button, GET/POST to shopping-list endpoint, navigate to shopping page |
| SHOP-02 | Shopping list aggregates ingredients across recipes and groups by category | Backend returns grouped data; frontend renders collapsible category sections |
| SHOP-03 | User can check off items on the shopping list | Checkbox per item, strikethrough + dimmed styling, persist via backend or localStorage |
</phase_requirements>

## Standard Stack

### Core (already installed)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @dnd-kit/core | ^6.3.1 | Drag-and-drop: DndContext, useDraggable, useDroppable | Already installed; used in Phase 3 for sortable lists |
| @dnd-kit/sortable | ^10.0.0 | Sortable within lists (if needed for slot reordering) | Already installed |
| @tanstack/react-query | ^5.90.21 | Server state for meal plans, shopping lists | Project standard |
| @tanstack/react-router | ^1.167.0 | File-based routing for meal plan pages | Project standard |
| ky | ^1.14.3 | HTTP client via apiClient | Project standard |
| zustand | ^5.0.11 | Local UI state (collapsible panel, drag state) | Project standard |
| lucide-react | ^0.577.0 | Icons (CalendarDays, Plus, Trash2, RefreshCw, ShoppingCart, Check) | Project standard |
| tailwindcss | ^4.2.1 | CSS grid layout, responsive design | Project standard |

### No Additional Libraries Needed
The project stack already covers all requirements. No new dependencies are needed for this phase.

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Custom CSS grid calendar | react-big-calendar, FullCalendar | Over-engineered; user explicitly chose CSS grid + dnd-kit, no external calendar lib |
| dnd-kit for drag assignment | react-dnd, HTML5 drag API | dnd-kit already installed and proven in codebase |
| localStorage for check-off | No persistence | localStorage gives offline resilience; try backend first |

## Architecture Patterns

### Recommended Project Structure
```
src/
  features/
    meals/
      api/
        types.ts          # MealPlan, MealSlot, MealAssignment, GenerateParams, ShoppingList types
        meal-plan-api.ts  # CRUD + generate + shopping list API functions
        meal-plan-queries.ts  # TanStack Query factory (mealPlanQueries)
      ui/
        MealPlanListPage.tsx    # List of user's meal plans
        MealPlanForm.tsx        # Create/edit form (name, date range, participants)
        WeeklyCalendar.tsx      # 7-column CSS grid layout
        CalendarCell.tsx        # Individual day+slot cell (droppable target)
        RecipePickerModal.tsx   # Modal with search/filter for adding recipes
        RecipeDragPanel.tsx     # Collapsible side panel with draggable recipe items
        DraggableRecipe.tsx     # useDraggable wrapper for recipe cards in panel
        AutoFillModal.tsx       # Auto-generate settings: meal types, tags, favorites, cook time
        MealSlotManager.tsx     # Add/rename/remove custom meal slot types
        ShoppingListPage.tsx    # Dedicated shopping list page
        ShoppingCategory.tsx    # Collapsible ingredient category section
        ShoppingItem.tsx        # Single ingredient row with check-off
  routes/
    _authenticated/
      meal-plans.tsx            # /meal-plans - list page
      meal-plans/
        new.tsx                 # /meal-plans/new - create form
        $planId.tsx             # /meal-plans/$planId - calendar view
        $planId.shopping.tsx    # /meal-plans/$planId/shopping - shopping list
```

### Pattern 1: dnd-kit Drag-to-Assign (useDraggable + useDroppable)
**What:** Dragging a recipe from a side panel onto a calendar cell to assign it to that day+slot.
**When to use:** Power-user flow for recipe assignment (not the primary modal flow).
**Key difference from Phase 3:** Phase 3 used `@dnd-kit/sortable` for reordering within a list. This phase uses `useDraggable` on recipe items and `useDroppable` on calendar cells -- items move between containers, not within one.

```typescript
// DraggableRecipe.tsx
import { useDraggable } from '@dnd-kit/core'

interface DraggableRecipeProps {
  recipe: RecipeSummary
}

export function DraggableRecipe({ recipe }: DraggableRecipeProps) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `recipe-${recipe.id}`,
    data: { type: 'recipe', recipe },
  })

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={cn('cursor-grab', isDragging && 'opacity-30')}
    >
      <GlassCard>
        {/* compact recipe card */}
      </GlassCard>
    </div>
  )
}
```

```typescript
// CalendarCell.tsx
import { useDroppable } from '@dnd-kit/core'

interface CalendarCellProps {
  dayIndex: number
  slotId: string
  meal: MealAssignment | null
  onAddClick: () => void
  onRemove: () => void
}

export function CalendarCell({ dayIndex, slotId, meal, onAddClick, onRemove }: CalendarCellProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: `cell-${dayIndex}-${slotId}`,
    data: { dayIndex, slotId },
  })

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'min-h-[80px] rounded-lg border border-white/10 p-2',
        isOver && 'border-accent bg-accent/10',
      )}
    >
      {meal ? (
        <FilledCell meal={meal} onRemove={onRemove} />
      ) : (
        <button onClick={onAddClick} className="...">
          <Plus className="h-5 w-5" />
        </button>
      )}
    </div>
  )
}
```

```typescript
// WeeklyCalendar.tsx -- DndContext onDragEnd handler
function handleDragEnd(event: DragEndEvent) {
  const { active, over } = event
  if (!over) return

  const recipe = active.data.current?.recipe as RecipeSummary
  const { dayIndex, slotId } = over.data.current as { dayIndex: number; slotId: string }

  if (recipe && dayIndex !== undefined && slotId) {
    assignMutation.mutate({ planId, dayIndex, slotId, recipeId: recipe.id })
  }
}
```

### Pattern 2: 7-Column CSS Grid Calendar
**What:** Weekly layout using CSS grid, responsive to mobile.
**When to use:** The main meal plan view.

```typescript
// Desktop: 7 columns (days) with meal slot rows
// Header row for day labels, then one row per meal slot type
<div className="hidden md:grid grid-cols-7 gap-2">
  {daysOfWeek.map(day => (
    <div key={day} className="text-center text-sm text-white/60 font-medium pb-2">
      {day}
    </div>
  ))}
  {mealSlots.map(slot => (
    daysOfWeek.map((_, dayIndex) => (
      <CalendarCell
        key={`${dayIndex}-${slot.id}`}
        dayIndex={dayIndex}
        slotId={slot.id}
        meal={getMeal(dayIndex, slot.id)}
        onAddClick={() => openPicker(dayIndex, slot.id)}
        onRemove={() => removeMeal(dayIndex, slot.id)}
      />
    ))
  ))}
</div>

// Mobile: stacked days with vertical scroll
<div className="md:hidden space-y-4">
  {daysOfWeek.map((day, dayIndex) => (
    <GlassPanel key={day} className="p-3">
      <h3 className="text-white font-medium mb-2">{day}</h3>
      <div className="space-y-2">
        {mealSlots.map(slot => (
          <CalendarCell key={slot.id} dayIndex={dayIndex} slotId={slot.id} ... />
        ))}
      </div>
    </GlassPanel>
  ))}
</div>
```

### Pattern 3: Query Factory for Meal Plans
**What:** TanStack Query factory following existing recipeQueries pattern.
**When to use:** All meal plan and shopping list data fetching.

```typescript
export const mealPlanQueries = {
  all: () => ['meal-plans'] as const,

  list: () =>
    queryOptions({
      queryKey: [...mealPlanQueries.all(), 'list'] as const,
      queryFn: () => getMealPlans(),
    }),

  detail: (planId: string) =>
    queryOptions({
      queryKey: [...mealPlanQueries.all(), 'detail', planId] as const,
      queryFn: () => getMealPlan(planId),
    }),

  shoppingList: (planId: string) =>
    queryOptions({
      queryKey: [...mealPlanQueries.all(), 'shopping', planId] as const,
      queryFn: () => getShoppingList(planId),
    }),
}
```

### Pattern 4: Collapsible Sections for Shopping List
**What:** Category groups that expand/collapse, using local state.
**When to use:** Shopping list ingredient display.

```typescript
function ShoppingCategory({ category, items, onToggle }: ShoppingCategoryProps) {
  const [expanded, setExpanded] = useState(true)
  const checkedCount = items.filter(i => i.checked).length

  return (
    <GlassPanel className="overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-4"
      >
        <span className="text-white font-medium">{category}</span>
        <span className="text-white/40 text-sm">{checkedCount}/{items.length}</span>
        <ChevronDown className={cn('h-4 w-4 transition-transform', expanded && 'rotate-180')} />
      </button>
      {expanded && (
        <div className="px-4 pb-4 space-y-2">
          {items.map(item => (
            <ShoppingItem key={item.id} item={item} onToggle={onToggle} />
          ))}
        </div>
      )}
    </GlassPanel>
  )
}
```

### Anti-Patterns to Avoid
- **Nested DndContext:** Do NOT nest the calendar's DndContext inside any other DndContext. Keep it isolated (per Phase 3 decision: "Separate DndContext per interaction").
- **CSS grid row spanning for slots:** Do NOT use `grid-row` to position meal slots -- use simple iteration. The grid has a fixed structure: header row + one row per meal slot type.
- **Inline drag state management:** Do NOT manage drag state with useState. Use dnd-kit's built-in `DragOverlay` component for rendering the dragged item's visual preview.
- **Fetching shopping list on meal plan page:** Shopping list is a separate page with its own route and query. Do NOT pre-fetch it on the calendar page.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Drag-and-drop | Custom pointer events + transforms | dnd-kit useDraggable/useDroppable | Touch support, accessibility, collision detection built-in |
| Ingredient aggregation | Client-side sum/group logic | Backend endpoint | Backend knows units, conversions, categories; client just renders |
| Cost estimation | Client-side price lookups | Backend cost estimation endpoints | Prices change, unit conversion is complex, backend is authoritative |
| Date range computation | Manual date math | Native Date or small utility functions | Date ranges for a week are simple enough; no library needed |
| Form validation | Custom validation logic | Simple conditional checks before submit | Forms are simple (name + date range + number); no form library needed per project convention |

**Key insight:** The backend handles the heavy computation (ingredient aggregation, cost estimation, auto-generation). The frontend is a display and interaction layer -- focus on good UX patterns, not business logic.

## Common Pitfalls

### Pitfall 1: DndContext Scope Collision
**What goes wrong:** If the DndContext for drag-to-assign wraps the entire page and another DndContext exists for sortable meal slots, drag events leak between them.
**Why it happens:** Multiple DndContexts with overlapping DOM trees.
**How to avoid:** Single DndContext per interaction pattern. The calendar drag-to-assign gets its own DndContext wrapping the calendar grid + recipe panel. Meal slot reordering (if needed) uses a separate DndContext in the slot manager.
**Warning signs:** Dragging a recipe triggers a sort handler, or sort events fire during recipe assignment.

### Pitfall 2: CSS Grid + Day Alignment on Variable Slot Counts
**What goes wrong:** When users add many meal slot types, the grid becomes very tall and hard to read.
**Why it happens:** Each meal slot type adds a full row across all 7 columns.
**How to avoid:** Limit visual density -- consider a max visible slot count with scroll, or compact cell design. Show slot name as a small label inside each cell, not as a row header that takes full column width.
**Warning signs:** Grid becomes taller than viewport on desktop with 5+ meal slot types.

### Pitfall 3: Drag Overlay Positioning
**What goes wrong:** The dragged recipe preview appears at wrong position or behind other elements.
**Why it happens:** Missing DragOverlay component or z-index issues with glassmorphism panels.
**How to avoid:** Use `<DragOverlay>` from dnd-kit, rendered at root level of the DndContext. Set z-50 or higher. Use `createPortal` if needed for z-index stacking context issues.
**Warning signs:** Dragged item disappears behind glass panels or appears offset.

### Pitfall 4: Stale Calendar Data After Mutation
**What goes wrong:** After assigning/removing a recipe, the calendar doesn't reflect the change.
**Why it happens:** Missing query invalidation after mutation.
**How to avoid:** Invalidate `mealPlanQueries.detail(planId)` on every assign/remove/generate mutation. Consider optimistic updates for assign/remove to feel instant.
**Warning signs:** User has to manually refresh to see changes.

### Pitfall 5: Mobile Drag Not Working
**What goes wrong:** Drag-and-drop is unusable on mobile touch devices.
**Why it happens:** PointerSensor alone may conflict with scroll gestures on the stacked mobile layout.
**How to avoid:** On mobile, rely on the modal-based flow (primary flow) as the main interaction. The drag panel can be hidden on mobile or shown as a secondary option. Use `TouchSensor` with appropriate `activationConstraint` (e.g., delay or distance) to distinguish drag from scroll.
**Warning signs:** Users can't scroll the stacked day view because touch is captured by DndContext.

### Pitfall 6: Auto-Generate Loading State
**What goes wrong:** User clicks "Auto-fill" and nothing visibly happens for seconds while backend generates.
**Why it happens:** No loading feedback during the generation API call.
**How to avoid:** Show skeleton shimmer in all affected slots immediately on mutation start (using `onMutate` or `isPending`). Use the `useDelayedLoading` hook (200ms delay + 500ms minimum) consistent with existing patterns.
**Warning signs:** Users click the button multiple times thinking it didn't work.

## Code Examples

### API Types (anticipated backend contract)

```typescript
// types.ts - Meal planning domain types

export interface MealPlan {
  id: string
  name: string
  startDate: string        // ISO date, e.g., "2026-03-16"
  endDate: string          // ISO date, e.g., "2026-03-22"
  participants: number
  mealSlots: MealSlotType[]
  meals: MealAssignment[]
  generatePreferences?: GeneratePreferences  // persisted per plan
}

export interface MealSlotType {
  id: string
  name: string             // e.g., "Breakfast", "Second Breakfast", "Lunch"
  orderIndex: number
}

export interface MealAssignment {
  id: string
  dayIndex: number         // 0-6 within the plan's date range
  mealSlotId: string
  recipe: RecipeSummary    // reuse from recipes/api/types
  isGenerated: boolean     // badge state for auto-generated meals
}

export interface GeneratePreferences {
  mealSlotIds: string[]     // which slots to fill
  tagIds: number[]          // tag/category preferences
  favoritesOnly: boolean
  maxCookTimeMinutes: number | null
  fillMode: 'empty_only' | 'replace_all'
  maxRepeats: number        // max times a recipe can appear
}

export interface GenerateRequest {
  preferences: GeneratePreferences
}

export interface ShoppingList {
  planId: string
  categories: ShoppingCategory[]
  totalEstimatedCost: number
}

export interface ShoppingCategory {
  name: string              // "Dairy", "Produce", "Meat", "Pantry", etc.
  items: ShoppingItem[]
}

export interface ShoppingItem {
  id: string
  ingredientName: string
  aggregatedAmount: number
  unit: string
  recipeNames: string[]     // which recipes need this ingredient
  estimatedCost: number
  checked: boolean
}

// API request types
export interface CreateMealPlanRequest {
  name: string
  startDate: string
  endDate: string
  participants: number
}

export interface UpdateMealPlanRequest {
  name?: string
  startDate?: string
  endDate?: string
  participants?: number
}

export interface AssignMealRequest {
  dayIndex: number
  mealSlotId: string
  recipeId: string
}
```

### API Functions Pattern

```typescript
// meal-plan-api.ts
import { apiClient } from '@/shared/api/client'
import type { ... } from './types'

export async function getMealPlans(): Promise<MealPlan[]> {
  return apiClient.get('meal-plans').json<MealPlan[]>()
}

export async function getMealPlan(id: string): Promise<MealPlan> {
  return apiClient.get(`meal-plans/${id}`).json<MealPlan>()
}

export async function createMealPlan(data: CreateMealPlanRequest): Promise<MealPlan> {
  return apiClient.post('meal-plans', { json: data }).json<MealPlan>()
}

export async function updateMealPlan(id: string, data: UpdateMealPlanRequest): Promise<MealPlan> {
  return apiClient.put(`meal-plans/${id}`, { json: data }).json<MealPlan>()
}

export async function deleteMealPlan(id: string): Promise<void> {
  await apiClient.delete(`meal-plans/${id}`)
}

export async function assignMeal(planId: string, data: AssignMealRequest): Promise<MealAssignment> {
  return apiClient.post(`meal-plans/${planId}/meals`, { json: data }).json<MealAssignment>()
}

export async function removeMeal(planId: string, mealId: string): Promise<void> {
  await apiClient.delete(`meal-plans/${planId}/meals/${mealId}`)
}

export async function generateMeals(planId: string, data: GenerateRequest): Promise<MealAssignment[]> {
  return apiClient.post(`meal-plans/${planId}/generate`, { json: data }).json<MealAssignment[]>()
}

// Meal slot management
export async function addMealSlot(planId: string, name: string): Promise<MealSlotType> {
  return apiClient.post(`meal-plans/${planId}/slots`, { json: { name } }).json<MealSlotType>()
}

export async function updateMealSlot(planId: string, slotId: string, name: string): Promise<MealSlotType> {
  return apiClient.put(`meal-plans/${planId}/slots/${slotId}`, { json: { name } }).json<MealSlotType>()
}

export async function removeMealSlot(planId: string, slotId: string): Promise<void> {
  await apiClient.delete(`meal-plans/${planId}/slots/${slotId}`)
}

// Shopping list
export async function getShoppingList(planId: string): Promise<ShoppingList> {
  return apiClient.get(`meal-plans/${planId}/shopping-list`).json<ShoppingList>()
}

export async function toggleShoppingItem(planId: string, itemId: string, checked: boolean): Promise<void> {
  await apiClient.patch(`meal-plans/${planId}/shopping-list/items/${itemId}`, { json: { checked } })
}
```

### NavBar Update

```typescript
// NavBar.tsx - Change the disabled "Meal Plans" span to an active Link
<Link
  to="/meal-plans"
  className="text-white/70 hover:text-white transition-colors [&.active]:text-accent"
>
  Meal Plans
</Link>

// MobileNav.tsx - Enable the "Meals" nav item
{ to: '/meal-plans', icon: CalendarDays, label: 'Meals', disabled: false },
```

### Shopping Item Check-Off with localStorage Fallback

```typescript
// Strategy: Try backend PATCH first; if API returns 404 or not available, fall back to localStorage
function useShoppingCheckOff(planId: string) {
  const queryClient = useQueryClient()
  const localKey = `shopping-checked-${planId}`

  // Try backend persistence
  const mutation = useMutation({
    mutationFn: ({ itemId, checked }: { itemId: string; checked: boolean }) =>
      toggleShoppingItem(planId, itemId, checked),
    onError: (_err, { itemId, checked }) => {
      // Fallback: persist to localStorage
      const stored = JSON.parse(localStorage.getItem(localKey) ?? '{}')
      stored[itemId] = checked
      localStorage.setItem(localKey, JSON.stringify(stored))
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: mealPlanQueries.shoppingList(planId).queryKey })
    },
  })

  return mutation
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| react-dnd with HTML5 backend | dnd-kit with pointer/touch sensors | 2022+ | Better touch support, smaller bundle, no provider nesting |
| Full calendar libraries for simple grids | CSS grid + custom components | Current | Much lighter, full control over glassmorphism styling |
| Client-side ingredient aggregation | Backend aggregation endpoint | Current | Correct unit conversion, authoritative data |
| redux for form state | useState + Zustand for UI state | Project convention | Simpler, less boilerplate |

## Open Questions

1. **Backend API contract for meal plans**
   - What we know: Backend exists (docker-compose references cookbook-network), REST API at `/api/v1/`
   - What's unclear: Exact endpoint paths, request/response shapes, whether meal slot management is per-plan or global
   - Recommendation: Implement against the anticipated contract above, adjust when actual API is discovered. Structure API functions in a single file for easy modification.

2. **Shopping list check-off persistence**
   - What we know: User wants checked items to persist
   - What's unclear: Whether backend has a PATCH endpoint for shopping item check state
   - Recommendation: Try backend first with localStorage fallback (code example above)

3. **Cost estimation currency/locale**
   - What we know: Backend has cost estimation endpoints
   - What's unclear: What currency the backend returns, whether it's locale-aware
   - Recommendation: Format with `Intl.NumberFormat` using a sensible default (EUR or USD), adjust based on backend response

4. **Meal slot types scope**
   - What we know: Users can create custom slot types per plan
   - What's unclear: Whether slots are plan-scoped or user-global with per-plan selection
   - Recommendation: Implement as plan-scoped (simplest), adjust if backend reveals global slots

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest 4.1.0 + @testing-library/react 16.3.2 |
| Config file | vitest.config.ts |
| Quick run command | `npx vitest run --reporter=verbose` |
| Full suite command | `npx vitest run` |

### Phase Requirements to Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| MEAL-01 | Create meal plan form submits correct data | unit | `npx vitest run src/features/meals/ui/MealPlanForm.test.tsx -t "submits"` | No - Wave 0 |
| MEAL-02 | Weekly calendar renders 7 columns with slot rows | unit | `npx vitest run src/features/meals/ui/WeeklyCalendar.test.tsx` | No - Wave 0 |
| MEAL-03 | Recipe picker adds recipe to slot; drag assigns recipe | unit | `npx vitest run src/features/meals/ui/RecipePickerModal.test.tsx` | No - Wave 0 |
| MEAL-04 | Remove meal from slot triggers mutation | unit | `npx vitest run src/features/meals/ui/CalendarCell.test.tsx` | No - Wave 0 |
| MEAL-05 | Auto-fill modal sends correct preference params | unit | `npx vitest run src/features/meals/ui/AutoFillModal.test.tsx` | No - Wave 0 |
| MEAL-06 | Edit form pre-fills with existing plan data | unit | `npx vitest run src/features/meals/ui/MealPlanForm.test.tsx -t "edit"` | No - Wave 0 |
| MEAL-07 | Delete triggers confirm + mutation | unit | `npx vitest run src/features/meals/ui/MealPlanForm.test.tsx -t "delete"` | No - Wave 0 |
| SHOP-01 | Shopping list page fetches and renders categories | unit | `npx vitest run src/features/meals/ui/ShoppingListPage.test.tsx` | No - Wave 0 |
| SHOP-02 | Shopping categories render grouped items with recipe sources | unit | `npx vitest run src/features/meals/ui/ShoppingCategory.test.tsx` | No - Wave 0 |
| SHOP-03 | Check-off toggles item styling and persists | unit | `npx vitest run src/features/meals/ui/ShoppingItem.test.tsx` | No - Wave 0 |

### Sampling Rate
- **Per task commit:** `npx vitest run --reporter=verbose`
- **Per wave merge:** `npx vitest run`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `src/features/meals/ui/MealPlanForm.test.tsx` -- covers MEAL-01, MEAL-06, MEAL-07
- [ ] `src/features/meals/ui/WeeklyCalendar.test.tsx` -- covers MEAL-02
- [ ] `src/features/meals/ui/CalendarCell.test.tsx` -- covers MEAL-03, MEAL-04
- [ ] `src/features/meals/ui/AutoFillModal.test.tsx` -- covers MEAL-05
- [ ] `src/features/meals/ui/ShoppingListPage.test.tsx` -- covers SHOP-01
- [ ] `src/features/meals/ui/ShoppingCategory.test.tsx` -- covers SHOP-02
- [ ] `src/features/meals/ui/ShoppingItem.test.tsx` -- covers SHOP-03

## Sources

### Primary (HIGH confidence)
- Codebase analysis: existing patterns from src/features/recipes/, src/shared/ui/, src/routes/_authenticated/
- package.json: confirmed @dnd-kit/core ^6.3.1, @dnd-kit/sortable ^10.0.0 installed
- dnd-kit official docs (dndkit.com): useDroppable and useDraggable API documentation

### Secondary (MEDIUM confidence)
- [dnd-kit docs - useDroppable](https://dndkit.com/api-documentation/droppable/usedroppable) - API for droppable containers
- [dnd-kit docs - useDraggable](https://dndkit.com/api-documentation/draggable/usedraggable) - API for draggable items

### Tertiary (LOW confidence)
- Backend API contract: anticipated based on REST conventions and CONTEXT.md description; actual endpoints unverified

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - all libraries already installed and proven in codebase
- Architecture: HIGH - follows established feature-sliced patterns exactly
- Pitfalls: HIGH - dnd-kit scope issues observed in Phase 3, patterns documented
- Backend API contract: LOW - anticipated, not verified against actual backend
- Shopping check-off persistence: MEDIUM - fallback strategy covers both scenarios

**Research date:** 2026-03-15
**Valid until:** 2026-04-15 (stable stack, no fast-moving dependencies)
