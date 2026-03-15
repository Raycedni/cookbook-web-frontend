import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Check } from 'lucide-react'
import { cn } from '@/shared/lib/cn'
import { recipeQueries } from '@/features/recipes/api/recipe-queries'
import {
  createRecipe,
  updateRecipe,
  uploadRecipeImage,
  uploadStepImage,
} from '@/features/recipes/api/recipe-api'
import type {
  CreateRecipeRequest,
  UpdateRecipeRequest,
  WizardState,
} from '@/features/recipes/api/types'
import { WizardStepBasics } from './WizardStepBasics'
import { WizardStepDetails } from './WizardStepDetails'

interface RecipeWizardProps {
  initialData?: WizardState
  recipeId?: string
  mode: 'create' | 'edit'
}

const defaultWizardState: WizardState = {
  name: '',
  description: '',
  servings: 4,
  prepTimeMinutes: 0,
  cookTimeMinutes: 0,
  heroImage: null,
  heroImagePreview: null,
  existingHeroImageUrl: null,
  ingredients: [],
  steps: [],
  tagIds: [],
}

const STEPS = ['Basics', 'Details'] as const

export function RecipeWizard({
  initialData,
  recipeId,
  mode,
}: RecipeWizardProps) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [form, setForm] = useState<WizardState>(
    initialData ?? defaultWizardState,
  )
  const [currentStep, setCurrentStep] = useState(0)
  const [isSaving, setIsSaving] = useState(false)

  const { data: units = [] } = useQuery(recipeQueries.units())

  function updateForm(partial: Partial<WizardState>) {
    setForm((prev) => ({ ...prev, ...partial }))
  }

  const isStep1Valid =
    form.name.trim().length > 0 &&
    form.ingredients.some((i) => i.ingredientId !== null)

  async function handleSave() {
    setIsSaving(true)
    try {
      const requestData = {
        name: form.name,
        description: form.description || undefined,
        servings: form.servings || undefined,
        prepTimeMinutes: form.prepTimeMinutes || undefined,
        cookTimeMinutes: form.cookTimeMinutes || undefined,
        isPublic: true,
        steps: form.steps.map((s, idx) => ({
          stepOrder: idx + 1,
          description: s.text,
        })),
        ingredients: form.ingredients
          .filter((i) => i.ingredientId !== null)
          .map((i, idx) => ({
            ingredientId: i.ingredientId!,
            amount: typeof i.amount === 'string' ? parseFloat(i.amount) || 0 : i.amount,
            unitId: i.unitId ?? 0,
            orderIndex: idx,
          })),
        tagIds: form.tagIds.length > 0 ? form.tagIds : undefined,
      }

      let recipe
      if (mode === 'create') {
        recipe = await createRecipe(requestData as CreateRecipeRequest)
      } else {
        recipe = await updateRecipe(
          recipeId!,
          requestData as UpdateRecipeRequest,
        )
      }

      // Upload hero image
      if (form.heroImage) {
        await uploadRecipeImage(recipe.id, form.heroImage, true)
      }

      // Upload step images sequentially
      if (recipe.steps) {
        for (let i = 0; i < recipe.steps.length; i++) {
          const formStep = form.steps[i]
          if (formStep && formStep.images.length > 0) {
            for (const file of formStep.images) {
              await uploadStepImage(recipe.id, recipe.steps[i].id, file)
            }
          }
        }
      }

      // Invalidate queries
      await queryClient.invalidateQueries({ queryKey: recipeQueries.all() })

      // Navigate to detail page
      navigate({ to: '/recipes/$recipeId', params: { recipeId: recipe.id } })
    } catch {
      // Error handling can be enhanced with toast later
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Progress indicator */}
      <div className="flex gap-2">
        {STEPS.map((stepLabel, idx) => {
          const isActive = idx === currentStep
          const isCompleted = idx < currentStep
          return (
            <div
              key={stepLabel}
              className={cn(
                'flex flex-1 items-center gap-2 rounded-lg border px-4 py-3 transition-colors',
                isActive
                  ? 'border-accent/50 bg-accent/10'
                  : isCompleted
                    ? 'border-white/10 bg-white/5'
                    : 'border-white/5 bg-white/[0.02]',
              )}
            >
              <div
                className={cn(
                  'flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-medium',
                  isActive
                    ? 'bg-accent text-white'
                    : isCompleted
                      ? 'bg-accent/30 text-accent-light'
                      : 'bg-white/10 text-white/40',
                )}
              >
                {isCompleted ? (
                  <Check className="h-3.5 w-3.5" />
                ) : (
                  idx + 1
                )}
              </div>
              <span
                className={cn(
                  'text-sm font-medium',
                  isActive
                    ? 'text-white'
                    : isCompleted
                      ? 'text-white/60'
                      : 'text-white/40',
                )}
              >
                {stepLabel}
              </span>
            </div>
          )
        })}
      </div>

      {/* Step content */}
      {currentStep === 0 && (
        <WizardStepBasics
          form={form}
          updateForm={updateForm}
          units={units}
          onNext={() => setCurrentStep(1)}
          isNextDisabled={!isStep1Valid}
        />
      )}
      {currentStep === 1 && (
        <WizardStepDetails
          form={form}
          updateForm={updateForm}
          onBack={() => setCurrentStep(0)}
          onSave={handleSave}
          isSaving={isSaving}
        />
      )}
    </div>
  )
}
