import { queryOptions } from '@tanstack/react-query'
import { getMealPlan, getMealPlans, getShoppingList } from './meal-plan-api'

export const mealPlanQueries = {
  all: () => ['meal-plans'] as const,

  list: () =>
    queryOptions({
      queryKey: [...mealPlanQueries.all(), 'list'] as const,
      queryFn: () => getMealPlans(),
    }),

  detail: (planId: string) =>
    queryOptions({
      queryKey: [...mealPlanQueries.all(), 'detail', planId] as const,
      queryFn: () => getMealPlan(planId),
    }),

  shoppingList: (planId: string) =>
    queryOptions({
      queryKey: [...mealPlanQueries.all(), 'shopping', planId] as const,
      queryFn: () => getShoppingList(planId),
    }),
}
