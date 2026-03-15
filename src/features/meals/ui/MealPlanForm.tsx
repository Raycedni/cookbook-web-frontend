import { useState } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { GlassPanel } from '@/shared/ui/GlassPanel'
import { mealPlanQueries } from '@/features/meals/api/meal-plan-queries'
import { createMealPlan, updateMealPlan } from '@/features/meals/api/meal-plan-api'
import type { MealPlan } from '@/features/meals/api/types'

interface MealPlanFormProps {
  initialData?: MealPlan
}

function toISODate(date: Date): string {
  return date.toISOString().split('T')[0]
}

function getDefaultDates(): { start: string; end: string } {
  const today = new Date()
  const end = new Date(today)
  end.setDate(today.getDate() + 6)
  return { start: toISODate(today), end: toISODate(end) }
}

export function MealPlanForm({ initialData }: MealPlanFormProps) {
  const isEdit = !!initialData
  const defaults = getDefaultDates()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [name, setName] = useState(initialData?.name ?? '')
  const [startDate, setStartDate] = useState(initialData?.startDate ?? defaults.start)
  const [endDate, setEndDate] = useState(initialData?.endDate ?? defaults.end)
  const [participants, setParticipants] = useState(initialData?.participants ?? 2)
  const [errors, setErrors] = useState<Record<string, string>>({})

  function validate(): boolean {
    const newErrors: Record<string, string> = {}
    if (!name.trim()) {
      newErrors.name = 'Name is required'
    }
    if (!startDate) {
      newErrors.startDate = 'Start date is required'
    }
    if (!endDate) {
      newErrors.endDate = 'End date is required'
    }
    if (startDate && endDate && endDate < startDate) {
      newErrors.endDate = 'End date must be on or after start date'
    }
    if (participants < 1) {
      newErrors.participants = 'At least 1 participant is required'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const createMutation = useMutation({
    mutationFn: createMealPlan,
    onSuccess: (newPlan) => {
      queryClient.invalidateQueries({ queryKey: mealPlanQueries.all() })
      navigate({ to: '/meal-plans/$planId', params: { planId: newPlan.id } })
    },
  })

  const updateMutation = useMutation({
    mutationFn: (data: Parameters<typeof updateMealPlan>[1]) =>
      updateMealPlan(initialData!.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: mealPlanQueries.all() })
    },
  })

  const isPending = createMutation.isPending || updateMutation.isPending
  const mutationError = createMutation.error || updateMutation.error

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return

    const data = {
      name: name.trim(),
      startDate,
      endDate,
      participants,
    }

    if (isEdit) {
      updateMutation.mutate(data)
    } else {
      createMutation.mutate(data)
    }
  }

  const inputClasses =
    'w-full rounded-xl border border-white/10 bg-white/10 px-4 py-2.5 text-white placeholder-white/30 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent transition-colors'

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <h1 className="text-2xl font-bold text-white">
        {isEdit ? 'Edit Meal Plan' : 'New Meal Plan'}
      </h1>

      <GlassPanel className="p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Name */}
          <div>
            <label htmlFor="plan-name" className="mb-1.5 block text-sm font-medium text-white/70">
              Plan Name
            </label>
            <input
              id="plan-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Week of March 16"
              className={inputClasses}
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-400">{errors.name}</p>
            )}
          </div>

          {/* Date range */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="start-date" className="mb-1.5 block text-sm font-medium text-white/70">
                Start Date
              </label>
              <input
                id="start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className={inputClasses}
              />
              {errors.startDate && (
                <p className="mt-1 text-sm text-red-400">{errors.startDate}</p>
              )}
            </div>
            <div>
              <label htmlFor="end-date" className="mb-1.5 block text-sm font-medium text-white/70">
                End Date
              </label>
              <input
                id="end-date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className={inputClasses}
              />
              {errors.endDate && (
                <p className="mt-1 text-sm text-red-400">{errors.endDate}</p>
              )}
            </div>
          </div>

          {/* Participants */}
          <div>
            <label htmlFor="participants" className="mb-1.5 block text-sm font-medium text-white/70">
              Participants
            </label>
            <input
              id="participants"
              type="number"
              min={1}
              value={participants}
              onChange={(e) => setParticipants(Math.max(1, parseInt(e.target.value, 10) || 1))}
              className={inputClasses}
            />
            {errors.participants && (
              <p className="mt-1 text-sm text-red-400">{errors.participants}</p>
            )}
          </div>

          {/* Mutation error */}
          {mutationError && (
            <p className="text-sm text-red-400">
              Something went wrong. Please try again.
            </p>
          )}

          {/* Actions */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={isPending}
              className="rounded-xl bg-accent px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent/80 disabled:opacity-50"
            >
              {isPending
                ? 'Saving...'
                : isEdit
                  ? 'Save Changes'
                  : 'Create Plan'}
            </button>
            <Link
              to="/meal-plans"
              className="rounded-xl border border-white/10 px-6 py-2.5 text-sm font-medium text-white/70 transition-colors hover:bg-white/5"
            >
              Cancel
            </Link>
          </div>
        </form>
      </GlassPanel>
    </div>
  )
}
