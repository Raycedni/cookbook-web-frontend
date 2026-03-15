import { createFileRoute } from '@tanstack/react-router'
import { CalendarDays } from 'lucide-react'
import { EmptyState } from '@/shared/ui/EmptyState'

export const Route = createFileRoute('/_authenticated/meal-plans/$planId')({
  component: MealPlanDetailPage,
})

function MealPlanDetailPage() {
  const { planId } = Route.useParams()

  return (
    <div className="space-y-4">
      <EmptyState
        icon={CalendarDays}
        title={`Meal Plan: ${planId}`}
        description="The weekly calendar view will be built in an upcoming update."
      />
    </div>
  )
}
