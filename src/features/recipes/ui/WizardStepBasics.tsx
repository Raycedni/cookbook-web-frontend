import { useEffect, useRef } from 'react'
import { GlassPanel } from '@/shared/ui/GlassPanel'
import { ImageDropZone } from './ImageDropZone'
import { IngredientRowList } from './IngredientRowList'
import type { IngredientFormRow, Unit, WizardState } from '@/features/recipes/api/types'

interface WizardStepBasicsProps {
  form: WizardState
  updateForm: (partial: Partial<WizardState>) => void
  units: Unit[]
  onNext: () => void
  isNextDisabled: boolean
}

const inputClass =
  'mt-1 block w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white placeholder-white/30 outline-none transition-colors focus:border-accent/50 focus:bg-white/[0.08]'

export function WizardStepBasics({
  form,
  updateForm,
  units,
  onNext,
  isNextDisabled,
}: WizardStepBasicsProps) {
  const previewUrlRef = useRef<string | null>(null)

  // Clean up objectURL on unmount or when heroImage changes
  useEffect(() => {
    return () => {
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current)
      }
    }
  }, [])

  function handleHeroImageSelected(files: File[]) {
    if (files.length === 0) return
    const file = files[0]
    // Revoke previous objectURL
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current)
    }
    const previewUrl = URL.createObjectURL(file)
    previewUrlRef.current = previewUrl
    updateForm({ heroImage: file, heroImagePreview: previewUrl })
  }

  function handleIngredientUpdate(
    localId: string,
    partial: Partial<IngredientFormRow>,
  ) {
    updateForm({
      ingredients: form.ingredients.map((row) =>
        row.localId === localId ? { ...row, ...partial } : row,
      ),
    })
  }

  function handleIngredientRemove(localId: string) {
    updateForm({
      ingredients: form.ingredients.filter((row) => row.localId !== localId),
    })
  }

  function handleIngredientAdd() {
    updateForm({
      ingredients: [
        ...form.ingredients,
        {
          localId: crypto.randomUUID(),
          ingredientId: null,
          ingredientName: '',
          amount: '',
          unitId: null,
        },
      ],
    })
  }

  function handleIngredientReorder(ingredients: IngredientFormRow[]) {
    updateForm({ ingredients })
  }

  const heroPreview = form.heroImagePreview || form.existingHeroImageUrl
  const heroPreviews = heroPreview ? [heroPreview] : []

  return (
    <div className="space-y-6">
      {/* Name */}
      <GlassPanel className="p-6 space-y-4">
        <div>
          <label className="text-sm font-medium text-white/80">
            Recipe Name <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => updateForm({ name: e.target.value })}
            placeholder="Give your recipe a name"
            className={inputClass}
          />
        </div>

        {/* Description */}
        <div>
          <label className="text-sm font-medium text-white/80">
            Description
          </label>
          <textarea
            value={form.description}
            onChange={(e) => updateForm({ description: e.target.value })}
            placeholder="A short description of your recipe..."
            rows={3}
            className={`${inputClass} resize-none`}
          />
        </div>

        {/* Servings, Prep Time, Cook Time */}
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-medium text-white/80">
              Servings
            </label>
            <input
              type="number"
              value={form.servings}
              onChange={(e) =>
                updateForm({ servings: Number(e.target.value) || 0 })
              }
              min={1}
              className={inputClass}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-white/80">
              Prep Time (min)
            </label>
            <input
              type="number"
              value={form.prepTimeMinutes}
              onChange={(e) =>
                updateForm({ prepTimeMinutes: Number(e.target.value) || 0 })
              }
              min={0}
              className={inputClass}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-white/80">
              Cook Time (min)
            </label>
            <input
              type="number"
              value={form.cookTimeMinutes}
              onChange={(e) =>
                updateForm({ cookTimeMinutes: Number(e.target.value) || 0 })
              }
              min={0}
              className={inputClass}
            />
          </div>
        </div>
      </GlassPanel>

      {/* Hero Image */}
      <GlassPanel className="p-6 space-y-3">
        <h3 className="text-sm font-medium text-white/80">Hero Image</h3>
        <ImageDropZone
          label="Drop hero image here or click to upload"
          previews={heroPreviews}
          onFilesSelected={handleHeroImageSelected}
        />
      </GlassPanel>

      {/* Ingredients */}
      <GlassPanel className="p-6 space-y-3">
        <h3 className="text-sm font-medium text-white/80">
          Ingredients <span className="text-red-400">*</span>
        </h3>
        <IngredientRowList
          ingredients={form.ingredients}
          units={units}
          onUpdate={handleIngredientUpdate}
          onRemove={handleIngredientRemove}
          onReorder={handleIngredientReorder}
          onAdd={handleIngredientAdd}
        />
      </GlassPanel>

      {/* Next button */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={onNext}
          disabled={isNextDisabled}
          className="rounded-lg bg-accent px-6 py-2 font-medium text-white transition-colors hover:bg-accent/80 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
    </div>
  )
}
