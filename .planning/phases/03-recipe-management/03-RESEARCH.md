# Phase 3: Recipe Management - Research

**Researched:** 2026-03-15
**Domain:** React form wizards, drag-and-drop reordering, file uploads, share links
**Confidence:** HIGH

## Summary

Phase 3 adds recipe creation, editing, deletion, image uploads, and share links to an existing React 19 + TanStack Router + TanStack Query + ky SPA with a glassmorphism design system. The codebase already has robust patterns for API calls, query management, and UI components from Phases 1-2.

The primary new technical challenge is drag-and-drop reordering for ingredient rows and cooking steps. The `@dnd-kit/core` + `@dnd-kit/sortable` packages (stable versions 6.x and 10.x) are the standard choice and the only new dependency needed. File uploads use the existing `ky`-based API client with `FormData` -- ky handles multipart automatically when you pass a `FormData` body. The multi-step wizard form is managed with plain `useState` (matching the existing ProfileForm pattern) -- no form library is needed.

**Primary recommendation:** Use `@dnd-kit/core` + `@dnd-kit/sortable` + `@dnd-kit/utilities` for drag-and-drop; manage all wizard state with `useState` objects; upload images via `FormData` through the existing `apiClient`; share the same wizard component for create and edit flows.

<user_constraints>

## User Constraints (from CONTEXT.md)

### Locked Decisions
- Multi-step wizard with 2 steps, shared between create and edit flows
- **Step 1: Basics, Image & Ingredients** -- recipe name, description, servings, prep/cook times, main hero image upload, and ingredient list
- **Step 2: Cooking Steps & Tags** -- ordered cooking steps (each with optional multiple images), tag selection from tag tree, and save button
- Progress indicator at top showing current step
- Per-step validation: Next button disabled until required fields on current step are filled; inline error messages
- Edit mode uses the same wizard, pre-filled with existing recipe data
- Ingredient entry: Search-to-add rows with debounced search, amount input, unit dropdown (from `GET /api/v1/units`), ingredient autocomplete (from `GET /api/v1/ingredients/search`), remove button, drag-and-drop reordering
- Cooking steps: Numbered cards with text area, optional multi-image upload, drag handle, remove button, drag-and-drop reordering, auto-numbered by position
- Step images upload after recipe save (backend needs step database ID from `RecipeStepResponse.id`)
- Main hero image: drag-and-drop zone + click-to-browse, uploaded via `POST /api/v1/media/recipes/{recipeId}` with `isPrimary=true`
- Per-step images: drag-and-drop zone on each step card, uploaded via `POST /api/v1/media/recipes/{recipeId}/steps/{stepId}`
- Preview via `URL.createObjectURL` before upload
- Backend constraints: max 10MB, accepts image/jpeg, image/png, image/webp, image/gif
- Share button opens modal with generated link and copy-to-clipboard
- Uses `POST /api/v1/recipes/{id}/share` (idempotent)
- Permanent links -- no revocation UI
- Copy uses `navigator.clipboard.writeText`
- Shared recipe view: same detail layout, read-only, route `/recipes/share/{token}`, public endpoint, no auth required
- Delete button on recipe detail (visible only to author), confirmation before delete, redirect to list on success

### Claude's Discretion
- Drag-and-drop library choice (dnd-kit recommended)
- Exact wizard progress indicator design
- Toast/success feedback after save
- Whether to build a reusable Modal component or use a one-off overlay
- Form state management approach (controlled state vs. useReducer)
- Image compression/resize before upload (if any)

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope

</user_constraints>

<phase_requirements>

## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| RECIPE-01 | User can create a new recipe with title, description, servings, prep/cook times, ingredients, and steps | Wizard form pattern with useState, POST /api/v1/recipes, sequential image upload after save |
| RECIPE-02 | User can add/remove/reorder ingredients with amount, unit, and ingredient selection | dnd-kit sortable list, debounced ingredient search, unit dropdown from GET /api/v1/units |
| RECIPE-03 | User can add/remove/reorder cooking steps | dnd-kit sortable list (shared DndContext pattern with ingredients) |
| RECIPE-04 | User can upload images with drag-and-drop and preview | HTML5 drag events + file input, URL.createObjectURL for preview, FormData + ky for upload |
| RECIPE-05 | User can edit their own recipes | Same wizard component, pre-filled via GET recipe detail query, PUT /api/v1/recipes/{id} |
| RECIPE-06 | User can delete their own recipes with confirmation | window.confirm or modal, DELETE endpoint, query invalidation + redirect |
| RECIPE-07 | User can assign tags to recipes | Existing TagTree + TagChips components, GET /api/v1/tags/assignable |
| RECIPE-08 | User can share a recipe via generated link | POST /api/v1/recipes/{id}/share, modal with clipboard API |
| RECIPE-09 | Unauthenticated user can view shared recipe via share link | Public route outside _authenticated layout, GET /api/v1/recipes/share/{token} |

</phase_requirements>

## Standard Stack

### Core (New Dependency)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @dnd-kit/core | ^6.3.1 | Drag-and-drop engine | Zero-dependency, accessible, sensor-based architecture |
| @dnd-kit/sortable | ^10.0.0 | Sortable list preset | Built on @dnd-kit/core, provides useSortable hook and arrayMove |
| @dnd-kit/utilities | ^3.2.2 | CSS transform utilities | CSS.Transform.toString helper for smooth drag animations |

### Already in Stack (No Changes)
| Library | Version | Purpose |
|---------|---------|---------|
| react | ^19.2.4 | UI framework |
| @tanstack/react-query | ^5.90.21 | Server state, mutations, cache invalidation |
| @tanstack/react-router | ^1.167.0 | File-based routing, route params |
| ky | ^1.14.3 | HTTP client -- FormData upload support built-in |
| zustand | ^5.0.11 | Client state (sidebar pattern) |
| lucide-react | ^0.577.0 | Icons (GripVertical for drag handles, Upload, Share2, Trash2, etc.) |
| clsx + tailwind-merge | latest | Conditional class composition |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| @dnd-kit/core + sortable | @dnd-kit/react (0.3.2) | New API but still pre-release (v0.x), not stable -- avoid |
| @dnd-kit | react-beautiful-dnd | Deprecated by Atlassian, does not support React 19 |
| @dnd-kit | HTML5 native drag | No keyboard accessibility, poor mobile support, no animation |
| useState objects | react-hook-form | Project convention is no form library; useState is sufficient for this wizard |
| useReducer | useState | Either works; useState with object spread is simpler and matches codebase patterns |

**Installation:**
```bash
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
```

## Architecture Patterns

### New Files Structure
```
src/
├── features/recipes/
│   ├── api/
│   │   ├── types.ts              # ADD: CreateRecipeRequest, UpdateRecipeRequest, Unit, MediaFileResponse, ShareResponse types
│   │   ├── recipe-api.ts         # ADD: createRecipe, updateRecipe, deleteRecipe, shareRecipe, getSharedRecipe, uploadRecipeImage, uploadStepImage, getUnits, searchIngredients
│   │   └── recipe-queries.ts     # ADD: shared query, units query, assignable tags query
│   └── ui/
│       ├── RecipeWizard.tsx       # NEW: 2-step wizard container (shared create/edit)
│       ├── WizardStepBasics.tsx   # NEW: Step 1 -- name, desc, servings, times, hero image, ingredients
│       ├── WizardStepDetails.tsx  # NEW: Step 2 -- cooking steps, tags, save
│       ├── IngredientRowList.tsx  # NEW: Sortable ingredient rows with dnd-kit
│       ├── IngredientRow.tsx      # NEW: Single ingredient row (amount, unit, name search, remove)
│       ├── CookingStepList.tsx    # NEW: Sortable step cards with dnd-kit
│       ├── CookingStepCard.tsx    # NEW: Single step card (textarea, image drop zone, remove)
│       ├── ImageDropZone.tsx      # NEW: Reusable drag-and-drop file upload with preview
│       └── ShareModal.tsx         # NEW: Share link modal with copy button
├── routes/
│   ├── _authenticated/recipes/
│   │   ├── new.tsx               # NEW: Create recipe route (MUST be before $recipeId in FS)
│   │   ├── $recipeId.edit.tsx    # NEW: Edit recipe route
│   │   └── $recipeId.tsx         # MODIFY: Add edit/delete/share buttons
│   └── recipes/
│       └── share/
│           └── $token.tsx        # NEW: Public shared recipe view (OUTSIDE _authenticated)
```

### Pattern 1: Multi-Step Wizard with Shared State
**What:** Single RecipeWizard component that holds all form state, renders Step 1 or Step 2 based on `currentStep` state.
**When to use:** Create and edit flows -- edit passes `initialData` prop.
**Example:**
```typescript
// Source: Matches ProfileForm useState pattern from codebase
interface WizardState {
  name: string
  description: string
  servings: number
  prepTimeMinutes: number
  cookTimeMinutes: number
  heroImage: File | null
  heroImagePreview: string | null
  ingredients: IngredientFormRow[]
  steps: StepFormRow[]
  tagIds: number[]
}

// In RecipeWizard.tsx
const [form, setForm] = useState<WizardState>(initialData ?? defaultState)
const [currentStep, setCurrentStep] = useState(0)

// Partial updater pattern
function updateForm(partial: Partial<WizardState>) {
  setForm(prev => ({ ...prev, ...partial }))
}
```

### Pattern 2: dnd-kit Sortable List
**What:** Wrap items in DndContext + SortableContext, each item uses useSortable hook.
**When to use:** Ingredient rows and cooking step cards.
**Example:**
```typescript
// Source: https://dndkit.com/presets/sortable
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

// Container
const sensors = useSensors(
  useSensor(PointerSensor),
  useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
)

function handleDragEnd(event: DragEndEvent) {
  const { active, over } = event
  if (over && active.id !== over.id) {
    setItems(prev => {
      const oldIndex = prev.findIndex(i => i.id === active.id)
      const newIndex = prev.findIndex(i => i.id === over.id)
      return arrayMove(prev, oldIndex, newIndex)
    })
  }
}

// Item
function SortableItem({ id }: { id: string }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id })
  const style = { transform: CSS.Transform.toString(transform), transition }
  return (
    <div ref={setNodeRef} style={style}>
      <button {...attributes} {...listeners}><GripVertical /></button>
      {/* content */}
    </div>
  )
}
```

### Pattern 3: File Upload with Preview
**What:** HTML5 drag events + hidden file input, preview via URL.createObjectURL, upload via FormData.
**When to use:** Hero image on Step 1, per-step images on Step 2.
**Example:**
```typescript
// Preview before upload
function handleFileSelect(file: File) {
  const preview = URL.createObjectURL(file)
  setPreviewUrl(preview)
  setSelectedFile(file)
}

// Upload after save (using existing apiClient)
async function uploadImage(recipeId: string, file: File, isPrimary: boolean) {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('isPrimary', String(isPrimary))
  return apiClient.post(`media/recipes/${recipeId}`, { body: formData }).json()
}

// Cleanup preview URLs
useEffect(() => {
  return () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl)
  }
}, [previewUrl])
```

### Pattern 4: Sequential Save Flow (Create)
**What:** Recipe must be saved first to get IDs, then images are uploaded separately.
**When to use:** Create and edit flows with images.
**Example:**
```typescript
async function handleSave(form: WizardState) {
  // 1. Create/update recipe
  const recipe = await createRecipe({
    name: form.name,
    description: form.description,
    servings: form.servings,
    prepTimeMinutes: form.prepTimeMinutes,
    cookTimeMinutes: form.cookTimeMinutes,
    steps: form.steps.map((s, i) => ({ stepOrder: i + 1, description: s.text })),
    ingredients: form.ingredients.map((ing, i) => ({
      ingredientId: ing.ingredientId,
      amount: ing.amount,
      unitId: ing.unitId,
      orderIndex: i,
    })),
    tagIds: form.tagIds,
  })

  // 2. Upload hero image
  if (form.heroImage) {
    await uploadRecipeImage(recipe.id, form.heroImage, true)
  }

  // 3. Upload step images (need step IDs from response)
  for (const step of recipe.steps) {
    const formStep = form.steps[step.stepNumber - 1]
    if (formStep?.images?.length) {
      for (const file of formStep.images) {
        await uploadStepImage(recipe.id, step.id, file)
      }
    }
  }

  // 4. Invalidate and navigate
  queryClient.invalidateQueries({ queryKey: recipeQueries.all() })
  navigate({ to: '/recipes/$recipeId', params: { recipeId: recipe.id } })
}
```

### Pattern 5: Public Route Outside Auth Layout
**What:** Share route must be accessible without authentication.
**When to use:** `/recipes/share/$token` route.
**Example:**
```typescript
// src/routes/recipes/share/$token.tsx
// This is NOT under _authenticated/, so no auth guard
export const Route = createFileRoute('/recipes/share/$token')({
  component: SharedRecipePage,
})

function SharedRecipePage() {
  const { token } = Route.useParams()
  const { data: recipe, isLoading } = useQuery({
    queryKey: ['recipes', 'shared', token],
    queryFn: () => getSharedRecipe(token),
  })
  // Render read-only recipe detail (reuse layout from $recipeId.tsx)
}
```

### Anti-Patterns to Avoid
- **Setting Content-Type header for FormData:** ky (and fetch) auto-sets multipart boundary. Manually setting it breaks the upload.
- **Uploading images before recipe save:** Backend needs the recipe ID and step IDs first. Always save recipe, then upload images.
- **Using a single DndContext for both ingredients and steps:** Use separate DndContext wrappers for each sortable list to avoid cross-list interference.
- **Forgetting URL.revokeObjectURL:** Causes memory leaks. Clean up in useEffect return.
- **Using `title` instead of `name` in API payloads:** Backend expects `name`. The existing RecipeSummary type uses `title` for display but the create/update API uses `name`.
- **Using `instruction` instead of `description` for steps:** Backend step model uses `description` field, not `instruction`.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Sortable drag-and-drop | Custom drag handlers with mouse events | @dnd-kit/sortable | Keyboard accessibility, touch support, animations, collision detection |
| Array reordering | Manual splice/index manipulation | arrayMove from @dnd-kit/sortable | Immutable, correct, tested |
| Debounced search | Custom setTimeout/clearTimeout | useDebounce hook (already exists) | Existing, tested, 300ms default |
| Tag selection tree | Custom tree component | TagTree + TagChips (already exist) | Built in Phase 2, handles expand/collapse/selection |
| Ingredient autocomplete | Custom search UI | FavoriteIngredients dropdown pattern | Debounced search, dropdown results, add/remove pattern |
| Clipboard API | Custom textarea+select+copy | navigator.clipboard.writeText | Standard API, works in all modern browsers |

## Common Pitfalls

### Pitfall 1: Route File Ordering for `/recipes/new` vs `/recipes/$recipeId`
**What goes wrong:** TanStack Router's file-based routing may match `new` as a `$recipeId` parameter.
**Why it happens:** Dynamic route params are greedy. If `$recipeId.tsx` is evaluated before `new.tsx`, "new" becomes a recipeId.
**How to avoid:** TanStack Router resolves static routes before dynamic ones within the same directory. The file `new.tsx` will match before `$recipeId.tsx` because static segments have higher priority. Verify this works by testing navigation.
**Warning signs:** Navigating to `/recipes/new` shows recipe detail page or 404.

### Pitfall 2: Backend Field Name Mismatches
**What goes wrong:** Frontend sends `title` but backend expects `name`; sends `instruction` but backend expects `description` for steps.
**Why it happens:** The existing RecipeSummary display type uses `title` (mapped from backend's `name`) and RecipeStep uses `instruction` field.
**How to avoid:** Create separate request types (CreateRecipeRequest) that use `name` and step `description`. Map display types to request types explicitly.
**Warning signs:** 400 Bad Request on create/update.

### Pitfall 3: Image Upload After Save Timing
**What goes wrong:** Images fail to upload because recipe/step IDs don't exist yet.
**Why it happens:** Attempting to upload images before the recipe create response returns.
**How to avoid:** Sequential flow: save recipe -> get response with IDs -> upload hero image -> upload step images. Use async/await, not parallel Promise.all for the full chain.
**Warning signs:** 404 errors on media upload endpoints.

### Pitfall 4: Steps/Ingredients Full Replacement on Update
**What goes wrong:** Partial updates lose data -- sending only changed steps replaces ALL steps.
**Why it happens:** PUT /api/v1/recipes/{id} treats steps[], ingredients[], and tagIds[] as full replacement arrays.
**How to avoid:** Always send the COMPLETE list of steps, ingredients, and tagIds on every update, not just the modified ones.
**Warning signs:** Steps or ingredients disappearing after edit.

### Pitfall 5: DndContext Nesting Conflicts
**What goes wrong:** Dragging an ingredient row triggers the step list's drag context or vice versa.
**Why it happens:** Nested or sibling DndContext components can interfere with each other's event handling.
**How to avoid:** Keep ingredient list and step list in separate DndContext instances. Since they are on different wizard steps (Step 1 vs Step 2), they won't render simultaneously.
**Warning signs:** Unexpected drag behavior, items jumping between lists.

### Pitfall 6: Memory Leaks from ObjectURL Previews
**What goes wrong:** Browser memory grows with each image preview.
**Why it happens:** `URL.createObjectURL` allocates a blob URL that persists until revoked.
**How to avoid:** Call `URL.revokeObjectURL(url)` when the component unmounts or when the preview changes.
**Warning signs:** Browser tab memory growing during extended form editing.

## Code Examples

### API Functions for Recipe Mutations
```typescript
// Source: Matches existing recipe-api.ts pattern
import { apiClient } from '@/shared/api/client'

export async function createRecipe(data: CreateRecipeRequest): Promise<RecipeDetail> {
  return apiClient.post('recipes', { json: data }).json<RecipeDetail>()
}

export async function updateRecipe(id: string, data: UpdateRecipeRequest): Promise<RecipeDetail> {
  return apiClient.put(`recipes/${id}`, { json: data }).json<RecipeDetail>()
}

export async function deleteRecipe(id: string): Promise<void> {
  await apiClient.delete(`recipes/${id}`)
}

export async function shareRecipe(id: string): Promise<{ shareToken: string }> {
  return apiClient.post(`recipes/${id}/share`).json<{ shareToken: string }>()
}

export async function getSharedRecipe(token: string): Promise<RecipeDetail> {
  return apiClient.get(`recipes/share/${token}`).json<RecipeDetail>()
}

export async function uploadRecipeImage(recipeId: string, file: File, isPrimary: boolean) {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('isPrimary', String(isPrimary))
  return apiClient.post(`media/recipes/${recipeId}`, { body: formData }).json()
}

export async function uploadStepImage(recipeId: string, stepId: number, file: File) {
  const formData = new FormData()
  formData.append('file', file)
  return apiClient.post(`media/recipes/${recipeId}/steps/${stepId}`, { body: formData }).json()
}

export async function getUnits(): Promise<Unit[]> {
  return apiClient.get('units').json<Unit[]>()
}

export async function searchIngredients(query: string): Promise<Ingredient[]> {
  return apiClient.get('ingredients/search', { searchParams: { query } }).json<Ingredient[]>()
}
```

### Share Modal with Clipboard
```typescript
// Source: navigator.clipboard.writeText is standard Web API
function ShareModal({ recipeId, onClose }: { recipeId: string; onClose: () => void }) {
  const [shareUrl, setShareUrl] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const shareMutation = useMutation({
    mutationFn: () => shareRecipe(recipeId),
    onSuccess: (data) => {
      setShareUrl(`${window.location.origin}/recipes/share/${data.shareToken}`)
    },
  })

  useEffect(() => { shareMutation.mutate() }, [])

  async function handleCopy() {
    if (shareUrl) {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <GlassPanel className="max-w-md w-full mx-4 p-6" onClick={e => e.stopPropagation()}>
        {/* Share link display + copy button */}
      </GlassPanel>
    </div>
  )
}
```

### ImageDropZone Component Pattern
```typescript
// Source: HTML5 Drag and Drop API + File API
function ImageDropZone({ onFilesSelected, previews, multiple = false }: ImageDropZoneProps) {
  const [isDragging, setIsDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setIsDragging(false)
    const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'))
    if (files.length) onFilesSelected(multiple ? files : [files[0]])
  }

  return (
    <div
      onDragOver={e => { e.preventDefault(); setIsDragging(true) }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      className={cn(
        'rounded-lg border-2 border-dashed p-4 text-center cursor-pointer transition-colors',
        isDragging ? 'border-accent bg-accent/10' : 'border-white/20 hover:border-white/40'
      )}
    >
      <input ref={inputRef} type="file" accept="image/*" multiple={multiple} className="hidden"
        onChange={e => { if (e.target.files) onFilesSelected(Array.from(e.target.files)) }} />
      {/* Preview thumbnails or upload prompt */}
    </div>
  )
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| react-beautiful-dnd | @dnd-kit | 2023 (rbd deprecated) | dnd-kit is the standard React DnD library |
| @dnd-kit/core classic API | @dnd-kit/react (v0.x) | 2024-2025 (beta) | New API exists but is not stable; use classic @dnd-kit/core + sortable |
| Form libraries (react-hook-form) | Controlled useState | Project convention | Consistent with ProfileForm, FavoriteIngredients patterns |

**Deprecated/outdated:**
- react-beautiful-dnd: Deprecated by Atlassian, no React 18+ support
- @dnd-kit/react: Still v0.3.2, pre-release, sortable issues reported in GitHub issues

## Open Questions

1. **RecipeDetail response shape for create/update**
   - What we know: GET response has `title` (mapped from backend `name`), steps have `instruction` (mapped from `description`), `id` as string
   - What's unclear: Whether POST/PUT response matches GET exactly (same RecipeDetail shape with step IDs)
   - Recommendation: Assume same shape; if not, the step image upload flow will need adjustment. Test with actual backend.

2. **Auth context for determining recipe authorship**
   - What we know: Edit/delete should only show for recipe author
   - What's unclear: Whether RecipeDetail includes an `authorId` or `isOwner` field
   - Recommendation: Check the backend response. If no ownership field exists, compare with current user ID from OIDC context (`auth.user?.profile.sub`).

3. **Shared recipe route and AppLayout**
   - What we know: The `__root.tsx` wraps everything in AppLayout (nav, sidebar)
   - What's unclear: Whether shared recipe view should show the full app shell or a minimal layout
   - Recommendation: The CONTEXT.md says "no app shell login required" -- the shared view is outside `_authenticated/` but still within `__root.tsx` AppLayout. The nav/sidebar may show unauthenticated state. This should work as-is since AppLayout renders regardless of auth.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest 4.1.0 with jsdom |
| Config file | vitest.config.ts |
| Quick run command | `npm run test` |
| Full suite command | `npm run test` |

### Phase Requirements to Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| RECIPE-01 | Create recipe form renders, validates required fields, calls create API | unit | `npx vitest run src/features/recipes/ui/RecipeWizard.test.tsx -x` | Wave 0 |
| RECIPE-02 | Ingredient rows add/remove/reorder, search filters results | unit | `npx vitest run src/features/recipes/ui/IngredientRowList.test.tsx -x` | Wave 0 |
| RECIPE-03 | Cooking step cards add/remove/reorder | unit | `npx vitest run src/features/recipes/ui/CookingStepList.test.tsx -x` | Wave 0 |
| RECIPE-04 | ImageDropZone accepts files, shows preview | unit | `npx vitest run src/features/recipes/ui/ImageDropZone.test.tsx -x` | Wave 0 |
| RECIPE-05 | Edit wizard pre-fills with existing data | unit | `npx vitest run src/features/recipes/ui/RecipeWizard.test.tsx -x` | Wave 0 |
| RECIPE-06 | Delete confirmation flow | unit | `npx vitest run src/routes/_authenticated/recipes/RecipeDetail.test.tsx -x` | Wave 0 |
| RECIPE-07 | Tag selection uses TagTree, selected tags show as chips | unit | Covered by existing TagTree.test.tsx + wizard test | Partial |
| RECIPE-08 | Share modal shows URL, copy button works | unit | `npx vitest run src/features/recipes/ui/ShareModal.test.tsx -x` | Wave 0 |
| RECIPE-09 | Shared recipe page renders read-only view | unit | `npx vitest run src/routes/recipes/share/SharedRecipe.test.tsx -x` | Wave 0 |

### Sampling Rate
- **Per task commit:** `npm run test`
- **Per wave merge:** `npm run test`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `src/features/recipes/ui/RecipeWizard.test.tsx` -- covers RECIPE-01, RECIPE-05
- [ ] `src/features/recipes/ui/IngredientRowList.test.tsx` -- covers RECIPE-02
- [ ] `src/features/recipes/ui/CookingStepList.test.tsx` -- covers RECIPE-03
- [ ] `src/features/recipes/ui/ImageDropZone.test.tsx` -- covers RECIPE-04
- [ ] `src/features/recipes/ui/ShareModal.test.tsx` -- covers RECIPE-08

## Sources

### Primary (HIGH confidence)
- Codebase analysis: src/features/recipes/, src/routes/_authenticated/, src/shared/ -- all patterns verified by reading actual files
- [dnd-kit official docs](https://dndkit.com/presets/sortable) -- sortable setup pattern, useSortable hook, arrayMove utility
- [ky npm](https://www.npmjs.com/package/ky) -- FormData body auto-sets Content-Type

### Secondary (MEDIUM confidence)
- [@dnd-kit/core npm](https://www.npmjs.com/package/@dnd-kit/core) -- version 6.3.1
- [@dnd-kit/sortable npm](https://www.npmjs.com/package/@dnd-kit/sortable) -- version 10.0.0
- [dnd-kit GitHub](https://github.com/clauderic/dnd-kit) -- @dnd-kit/react still v0.x pre-release

### Tertiary (LOW confidence)
- None

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- dnd-kit is the clear standard; all other libraries already in use
- Architecture: HIGH -- patterns directly match existing codebase conventions (ProfileForm, FavoriteIngredients, apiClient)
- Pitfalls: HIGH -- field name mismatches and upload sequencing verified against CONTEXT.md API contract

**Research date:** 2026-03-15
**Valid until:** 2026-04-15 (stable ecosystem, no fast-moving changes expected)
