import { createFileRoute } from '@tanstack/react-router'
import { CalendarDays } from 'lucide-react'
import { EmptyState } from '@/shared/ui/EmptyState'

export const Route = createFileRoute('/_authenticated/meal-plans/new')({
  component: NewMealPlanPage,
})

function NewMealPlanPage() {
  return (
    <div className="space-y-4">
      <EmptyState
        icon={CalendarDays}
        title="Create Meal Plan"
        description="Set up a new meal plan with name, date range, and participants."
      />
    </div>
  )
}
