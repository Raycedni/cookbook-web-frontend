import { createFileRoute } from '@tanstack/react-router'
import { MealPlanListPage } from '@/features/meals/ui/MealPlanListPage'

export const Route = createFileRoute('/_authenticated/meal-plans')({
  component: MealPlanListPage,
})
