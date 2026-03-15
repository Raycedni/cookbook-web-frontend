import { useState } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  CalendarDays,
  Pencil,
  Settings2,
  Sparkles,
  ShoppingCart,
  Users,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { Skeleton } from '@/shared/ui/Skeleton'
import { GlassPanel } from '@/shared/ui/GlassPanel'
import { mealPlanQueries } from '@/features/meals/api/meal-plan-queries'
import {
  assignMeal,
  removeMeal,
  updateMealPlan,
} from '@/features/meals/api/meal-plan-api'
import { WeeklyCalendar } from '@/features/meals/ui/WeeklyCalendar'
import { MealSlotManager } from '@/features/meals/ui/MealSlotManager'
import { RecipePickerModal } from '@/features/meals/ui/RecipePickerModal'
import type { RecipeSummary } from '@/features/recipes/api/types'
import type { UpdateMealPlanRequest } from '@/features/meals/api/types'

export const Route = createFileRoute('/_authenticated/meal-plans/$planId')({
  component: MealPlanDetailPage,
})

function formatDateRange(startDate: string, endDate: string): string {
  const start = new Date(startDate + 'T00:00:00')
  const end = new Date(endDate + 'T00:00:00')
  const opts: Intl.DateTimeFormatOptions = {
    month: 'short',
    day: 'numeric',
  }
  return `${start.toLocaleDateString('en-US', opts)} - ${end.toLocaleDateString('en-US', opts)}`
}

function MealPlanDetailPage() {
  const { planId } = Route.useParams()
  const queryClient = useQueryClient()
  const { data: plan, isLoading, isError } = useQuery(mealPlanQueries.detail(planId))

  const [pickerTarget, setPickerTarget] = useState<{
    dayIndex: number
    slotId: string
  } | null>(null)
  const [showSlotManager, setShowSlotManager] = useState(false)
  const [showEditForm, setShowEditForm] = useState(false)
  const [showDragPanel, setShowDragPanel] = useState(false)

  // Edit form state
  const [editName, setEditName] = useState('')
  const [editParticipants, setEditParticipants] = useState(1)

  const invalidateDetail = () =>
    queryClient.invalidateQueries(mealPlanQueries.detail(planId))

  const assignMutation = useMutation({
    mutationFn: (data: { dayIndex: number; mealSlotId: string; recipeId: string }) =>
      assignMeal(planId, data),
    onSuccess: invalidateDetail,
  })

  const removeMutation = useMutation({
    mutationFn: (mealId: string) => removeMeal(planId, mealId),
    onSuccess: invalidateDetail,
  })

  const updateMutation = useMutation({
    mutationFn: (data: UpdateMealPlanRequest) => updateMealPlan(planId, data),
    onSuccess: () => {
      invalidateDetail()
      setShowEditForm(false)
    },
  })

  const handleSelectRecipe = (recipe: RecipeSummary) => {
    if (!pickerTarget) return
    assignMutation.mutate({
      dayIndex: pickerTarget.dayIndex,
      mealSlotId: pickerTarget.slotId,
      recipeId: recipe.id,
    })
    setPickerTarget(null)
  }

  const handleAssignRecipe = (dayIndex: number, slotId: string, recipeId: string) => {
    assignMutation.mutate({
      dayIndex,
      mealSlotId: slotId,
      recipeId,
    })
  }

  const handleOpenEdit = () => {
    if (!plan) return
    setEditName(plan.name)
    setEditParticipants(plan.participants)
    setShowEditForm((prev) => !prev)
  }

  const handleSaveEdit = () => {
    updateMutation.mutate({
      name: editName,
      participants: editParticipants,
    })
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton variant="rectangular" height={48} />
        <div className="grid grid-cols-8 gap-2">
          {Array.from({ length: 24 }).map((_, i) => (
            <Skeleton key={i} variant="rectangular" height={80} />
          ))}
        </div>
      </div>
    )
  }

  if (isError || !plan) {
    return (
      <GlassPanel className="p-6 text-center">
        <CalendarDays className="mx-auto h-10 w-10 text-white/20 mb-2" />
        <p className="text-white/60">Failed to load meal plan.</p>
      </GlassPanel>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">{plan.name}</h1>
          <div className="mt-1 flex items-center gap-3 text-sm text-white/50">
            <span>{formatDateRange(plan.startDate, plan.endDate)}</span>
            <span className="flex items-center gap-1">
              <Users className="h-3.5 w-3.5" />
              {plan.participants}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleOpenEdit}
            className="inline-flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-1.5 text-sm text-white/70 hover:bg-white/15 transition-colors"
          >
            <Pencil className="h-3.5 w-3.5" />
            Edit
            {showEditForm ? (
              <ChevronUp className="h-3.5 w-3.5" />
            ) : (
              <ChevronDown className="h-3.5 w-3.5" />
            )}
          </button>
          <button
            type="button"
            onClick={() => setShowSlotManager((prev) => !prev)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-1.5 text-sm text-white/70 hover:bg-white/15 transition-colors"
          >
            <Settings2 className="h-3.5 w-3.5" />
            Manage Slots
          </button>
          <button
            type="button"
            onClick={() => setShowDragPanel((prev) => !prev)}
            className="hidden md:inline-flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-1.5 text-sm text-white/70 hover:bg-white/15 transition-colors"
          >
            {showDragPanel ? (
              <ChevronRight className="h-3.5 w-3.5" />
            ) : (
              <ChevronLeft className="h-3.5 w-3.5" />
            )}
            Recipe Panel
          </button>
          <button
            type="button"
            disabled
            className="inline-flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-1.5 text-sm text-white/40 cursor-not-allowed"
          >
            <Sparkles className="h-3.5 w-3.5" />
            Auto-fill
          </button>
          <Link
            to="/meal-plans/$planId/shopping"
            params={{ planId }}
            className="inline-flex items-center gap-1.5 rounded-lg bg-accent/20 px-3 py-1.5 text-sm font-medium text-accent hover:bg-accent/30 transition-colors"
          >
            <ShoppingCart className="h-3.5 w-3.5" />
            Shopping List
          </Link>
        </div>
      </div>

      {/* Edit form (collapsible) */}
      {showEditForm && (
        <GlassPanel className="p-4">
          <h3 className="mb-3 text-sm font-semibold text-white/70">
            Edit Plan
          </h3>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="flex-1">
              <label className="block text-xs text-white/40 mb-1">Name</label>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full rounded bg-white/10 px-3 py-1.5 text-sm text-white outline-none focus:ring-1 focus:ring-accent"
              />
            </div>
            <div className="w-24">
              <label className="block text-xs text-white/40 mb-1">
                Participants
              </label>
              <input
                type="number"
                min={1}
                value={editParticipants}
                onChange={(e) =>
                  setEditParticipants(Math.max(1, Number(e.target.value)))
                }
                className="w-full rounded bg-white/10 px-3 py-1.5 text-sm text-white outline-none focus:ring-1 focus:ring-accent"
              />
            </div>
            <button
              type="button"
              onClick={handleSaveEdit}
              disabled={updateMutation.isPending}
              className="rounded bg-accent/20 px-4 py-1.5 text-sm font-medium text-accent hover:bg-accent/30 disabled:opacity-50 transition-colors"
            >
              {updateMutation.isPending ? 'Saving...' : 'Save'}
            </button>
          </div>
        </GlassPanel>
      )}

      {/* Meal slot manager (collapsible) */}
      {showSlotManager && (
        <MealSlotManager planId={planId} slots={plan.mealSlots} />
      )}

      {/* Weekly calendar with drag panel */}
      <WeeklyCalendar
        plan={plan}
        onAddRecipe={(dayIndex, slotId) =>
          setPickerTarget({ dayIndex, slotId })
        }
        onRemoveMeal={(mealId) => removeMutation.mutate(mealId)}
        onAssignRecipe={handleAssignRecipe}
        showDragPanel={showDragPanel}
      />

      {/* Recipe picker modal */}
      <RecipePickerModal
        isOpen={pickerTarget !== null}
        onClose={() => setPickerTarget(null)}
        onSelect={handleSelectRecipe}
      />
    </div>
  )
}
