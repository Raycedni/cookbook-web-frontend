import { useState, useEffect, useCallback } from 'react'
import { X, Sparkles, Loader2 } from 'lucide-react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { GlassPanel } from '@/shared/ui/GlassPanel'
import { recipeQueries } from '@/features/recipes/api/recipe-queries'
import { generateMeals } from '@/features/meals/api/meal-plan-api'
import { mealPlanQueries } from '@/features/meals/api/meal-plan-queries'
import type { MealPlan, GeneratePreferences } from '@/features/meals/api/types'

interface AutoFillModalProps {
  isOpen: boolean
  onClose: () => void
  planId: string
  plan: MealPlan
  onGenerating?: (slotIds: string[], isPending: boolean) => void
}

export function AutoFillModal({
  isOpen,
  onClose,
  planId,
  plan,
  onGenerating,
}: AutoFillModalProps) {
  const queryClient = useQueryClient()
  const { data: tags } = useQuery({ ...recipeQueries.tags(), enabled: isOpen })

  // Form state
  const [mealSlotIds, setMealSlotIds] = useState<string[]>([])
  const [tagIds, setTagIds] = useState<number[]>([])
  const [favoritesOnly, setFavoritesOnly] = useState(false)
  const [hasCookTimeLimit, setHasCookTimeLimit] = useState(false)
  const [maxCookTimeMinutes, setMaxCookTimeMinutes] = useState(60)
  const [fillMode, setFillMode] = useState<'empty_only' | 'replace_all'>(
    'empty_only',
  )
  const [maxRepeats, setMaxRepeats] = useState(2)

  // Pre-fill from existing preferences or defaults
  useEffect(() => {
    if (!isOpen) return
    const prefs = plan.generatePreferences
    if (prefs) {
      setMealSlotIds(prefs.mealSlotIds)
      setTagIds(prefs.tagIds)
      setFavoritesOnly(prefs.favoritesOnly)
      setHasCookTimeLimit(prefs.maxCookTimeMinutes !== null)
      setMaxCookTimeMinutes(prefs.maxCookTimeMinutes ?? 60)
      setFillMode(prefs.fillMode)
      setMaxRepeats(prefs.maxRepeats)
    } else {
      setMealSlotIds(plan.mealSlots.map((s) => s.id))
      setTagIds([])
      setFavoritesOnly(false)
      setHasCookTimeLimit(false)
      setMaxCookTimeMinutes(60)
      setFillMode('empty_only')
      setMaxRepeats(2)
    }
  }, [isOpen, plan])

  const generateMutation = useMutation({
    mutationFn: (preferences: GeneratePreferences) =>
      generateMeals(planId, { preferences }),
    onSuccess: () => {
      queryClient.invalidateQueries(mealPlanQueries.detail(planId))
      onClose()
    },
    onSettled: () => {
      onGenerating?.([], false)
    },
  })

  const handleGenerate = () => {
    const preferences: GeneratePreferences = {
      mealSlotIds,
      tagIds,
      favoritesOnly,
      maxCookTimeMinutes: hasCookTimeLimit ? maxCookTimeMinutes : null,
      fillMode,
      maxRepeats,
    }
    onGenerating?.(mealSlotIds, true)
    generateMutation.mutate(preferences)
  }

  const toggleSlotId = (id: string) => {
    setMealSlotIds((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id],
    )
  }

  const toggleTagId = (id: number) => {
    setTagIds((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id],
    )
  }

  // Close on Escape
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    },
    [onClose],
  )

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      return () => document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, handleKeyDown])

  if (!isOpen) return null

  const sortedSlots = [...plan.mealSlots].sort(
    (a, b) => a.orderIndex - b.orderIndex,
  )

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <GlassPanel
        intensity="heavy"
        className="mx-4 flex max-h-[80vh] w-full max-w-md flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 p-4">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-white/90">
            <Sparkles className="h-5 w-5 text-accent" />
            Auto-fill Meal Plan
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-white/40 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <div className="flex-1 overflow-y-auto p-4 space-y-5">
          {/* 1. Meal types to fill */}
          <fieldset>
            <legend className="mb-2 text-sm font-medium text-white/70">
              Meal types to fill
            </legend>
            <div className="flex flex-wrap gap-2">
              {sortedSlots.map((slot) => (
                <label
                  key={slot.id}
                  className={`inline-flex cursor-pointer items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm transition-colors ${
                    mealSlotIds.includes(slot.id)
                      ? 'bg-accent/20 text-accent'
                      : 'bg-white/10 text-white/50 hover:bg-white/15'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={mealSlotIds.includes(slot.id)}
                    onChange={() => toggleSlotId(slot.id)}
                    className="sr-only"
                  />
                  {slot.name}
                </label>
              ))}
            </div>
          </fieldset>

          {/* 2. Tag preferences */}
          <fieldset>
            <legend className="mb-2 text-sm font-medium text-white/70">
              Tag preferences
            </legend>
            {tags && tags.length > 0 ? (
              <div className="flex flex-wrap gap-1.5 max-h-[120px] overflow-y-auto">
                {tags.map((tag) => (
                  <label
                    key={tag.id}
                    className={`inline-flex cursor-pointer items-center rounded-full px-2.5 py-1 text-xs transition-colors ${
                      tagIds.includes(tag.id)
                        ? 'bg-accent/20 text-accent'
                        : 'bg-white/10 text-white/50 hover:bg-white/15'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={tagIds.includes(tag.id)}
                      onChange={() => toggleTagId(tag.id)}
                      className="sr-only"
                    />
                    {tag.name}
                  </label>
                ))}
              </div>
            ) : (
              <p className="text-xs text-white/30">No tags available</p>
            )}
          </fieldset>

          {/* 3. Favorites only */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-white/70">
              Use only favorites
            </span>
            <button
              type="button"
              role="switch"
              aria-checked={favoritesOnly}
              onClick={() => setFavoritesOnly((prev) => !prev)}
              className={`relative h-6 w-11 rounded-full transition-colors ${
                favoritesOnly ? 'bg-accent' : 'bg-white/20'
              }`}
            >
              <span
                className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                  favoritesOnly ? 'translate-x-5.5' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>

          {/* 4. Max cook time */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-white/70">
                Max cook time
              </span>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasCookTimeLimit}
                  onChange={(e) => setHasCookTimeLimit(e.target.checked)}
                  className="h-3.5 w-3.5 rounded border-white/30 bg-white/10 text-accent focus:ring-accent"
                />
                <span className="text-xs text-white/50">Set limit</span>
              </label>
            </div>
            {hasCookTimeLimit ? (
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min={10}
                  max={180}
                  step={5}
                  value={maxCookTimeMinutes}
                  onChange={(e) =>
                    setMaxCookTimeMinutes(Number(e.target.value))
                  }
                  className="flex-1 accent-accent"
                />
                <span className="w-16 text-right text-sm text-white/60">
                  {maxCookTimeMinutes} min
                </span>
              </div>
            ) : (
              <p className="text-xs text-white/30">No limit</p>
            )}
          </div>

          {/* 5. Fill mode */}
          <fieldset>
            <legend className="mb-2 text-sm font-medium text-white/70">
              Fill mode
            </legend>
            <div className="flex flex-col gap-2">
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="radio"
                  name="fillMode"
                  checked={fillMode === 'empty_only'}
                  onChange={() => setFillMode('empty_only')}
                  className="h-3.5 w-3.5 border-white/30 bg-white/10 text-accent focus:ring-accent"
                />
                <span className="text-sm text-white/60">
                  Fill empty slots only
                </span>
              </label>
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="radio"
                  name="fillMode"
                  checked={fillMode === 'replace_all'}
                  onChange={() => setFillMode('replace_all')}
                  className="h-3.5 w-3.5 border-white/30 bg-white/10 text-accent focus:ring-accent"
                />
                <span className="text-sm text-white/60">Replace all</span>
              </label>
            </div>
          </fieldset>

          {/* 6. Repeat tolerance */}
          <div>
            <label className="mb-2 block text-sm font-medium text-white/70">
              Max times a recipe can appear
            </label>
            <input
              type="number"
              min={1}
              max={7}
              value={maxRepeats}
              onChange={(e) =>
                setMaxRepeats(Math.max(1, Math.min(7, Number(e.target.value))))
              }
              className="w-20 rounded bg-white/10 px-3 py-1.5 text-sm text-white outline-none focus:ring-1 focus:ring-accent"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-white/10 p-4">
          <button
            type="button"
            onClick={handleGenerate}
            disabled={
              generateMutation.isPending || mealSlotIds.length === 0
            }
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-accent/20 px-4 py-2.5 text-sm font-medium text-accent hover:bg-accent/30 disabled:opacity-50 transition-colors"
          >
            {generateMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Generate Meals
              </>
            )}
          </button>
        </div>
      </GlassPanel>
    </div>
  )
}
