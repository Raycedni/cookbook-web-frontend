import { createFileRoute } from '@tanstack/react-router'
import { MealPlanForm } from '@/features/meals/ui/MealPlanForm'

export const Route = createFileRoute('/_authenticated/meal-plans/new')({
  component: NewMealPlanPage,
})

function NewMealPlanPage() {
  return <MealPlanForm />
}
