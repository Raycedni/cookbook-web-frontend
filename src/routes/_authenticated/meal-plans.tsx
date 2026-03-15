import { createFileRoute } from '@tanstack/react-router'
import { CalendarDays } from 'lucide-react'
import { EmptyState } from '@/shared/ui/EmptyState'

export const Route = createFileRoute('/_authenticated/meal-plans')({
  component: MealPlansPage,
})

function MealPlansPage() {
  return (
    <div className="space-y-4">
      <EmptyState
        icon={CalendarDays}
        title="Meal Plans"
        description="Plan your meals for the week ahead. This page will be built in an upcoming update."
      />
    </div>
  )
}
