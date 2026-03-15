import { Link } from '@tanstack/react-router'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { CalendarDays, Plus, Trash2, Users } from 'lucide-react'
import { GlassCard } from '@/shared/ui/GlassCard'
import { EmptyState } from '@/shared/ui/EmptyState'
import { Skeleton } from '@/shared/ui/Skeleton'
import { useDelayedLoading } from '@/shared/ui/useDelayedLoading'
import { mealPlanQueries } from '@/features/meals/api/meal-plan-queries'
import { deleteMealPlan } from '@/features/meals/api/meal-plan-api'
import type { MealPlan } from '@/features/meals/api/types'

function formatDateRange(startDate: string, endDate: string): string {
  const start = new Date(startDate + 'T00:00:00')
  const end = new Date(endDate + 'T00:00:00')
  const opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' }
  return `${start.toLocaleDateString('en-US', opts)} - ${end.toLocaleDateString('en-US', opts)}`
}

function MealPlanCard({ plan }: { plan: MealPlan }) {
  const queryClient = useQueryClient()

  const removeMutation = useMutation({
    mutationFn: () => deleteMealPlan(plan.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: mealPlanQueries.all() })
    },
  })

  function handleDelete(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    if (window.confirm(`Delete "${plan.name}"? This cannot be undone.`)) {
      removeMutation.mutate()
    }
  }

  return (
    <Link
      to="/meal-plans/$planId"
      params={{ planId: plan.id }}
      className="block"
    >
      <GlassCard className="relative p-5">
        <button
          type="button"
          onClick={handleDelete}
          disabled={removeMutation.isPending}
          className="absolute top-3 right-3 p-1.5 rounded-lg text-white/40 hover:text-red-400 hover:bg-white/10 transition-colors"
          aria-label={`Delete ${plan.name}`}
        >
          <Trash2 className="h-4 w-4" />
        </button>

        <h3 className="font-semibold text-white truncate pr-8">{plan.name}</h3>

        <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-white/60">
          <span className="flex items-center gap-1">
            <CalendarDays className="h-3.5 w-3.5" />
            {formatDateRange(plan.startDate, plan.endDate)}
          </span>
          <span className="flex items-center gap-1">
            <Users className="h-3.5 w-3.5" />
            {plan.participants}
          </span>
        </div>

        {plan.meals.length > 0 && (
          <p className="mt-1.5 text-xs text-white/40">
            {plan.meals.length} meal{plan.meals.length !== 1 ? 's' : ''} planned
          </p>
        )}
      </GlassCard>
    </Link>
  )
}

function ListSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-5">
          <Skeleton width="60%" height={20} variant="rectangular" />
          <div className="mt-3">
            <Skeleton width="80%" height={16} variant="rectangular" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function MealPlanListPage() {
  const { data: plans, isLoading } = useQuery(mealPlanQueries.list())
  const showSkeleton = useDelayedLoading(isLoading)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Meal Plans</h1>
        <Link
          to="/meal-plans/new"
          className="flex items-center gap-2 rounded-xl bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent/80"
        >
          <Plus className="h-4 w-4" />
          New Plan
        </Link>
      </div>

      {showSkeleton && <ListSkeleton />}

      {!isLoading && plans?.length === 0 && (
        <EmptyState
          icon={CalendarDays}
          title="No meal plans yet"
          description="Create your first meal plan to start organizing your weekly meals."
          action={
            <Link
              to="/meal-plans/new"
              className="flex items-center gap-2 rounded-xl bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent/80"
            >
              <Plus className="h-4 w-4" />
              Create Plan
            </Link>
          }
        />
      )}

      {!isLoading && plans && plans.length > 0 && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {plans.map((plan) => (
            <MealPlanCard key={plan.id} plan={plan} />
          ))}
        </div>
      )}
    </div>
  )
}
