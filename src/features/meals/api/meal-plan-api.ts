import { apiClient } from '@/shared/api/client'
import type {
  AssignMealRequest,
  CreateMealPlanRequest,
  GenerateRequest,
  MealAssignment,
  MealPlan,
  MealSlotType,
  ShoppingList,
  UpdateMealPlanRequest,
} from './types'

export async function getMealPlans(): Promise<MealPlan[]> {
  return apiClient.get('meal-plans').json<MealPlan[]>()
}

export async function getMealPlan(id: string): Promise<MealPlan> {
  return apiClient.get(`meal-plans/${id}`).json<MealPlan>()
}

export async function createMealPlan(
  data: CreateMealPlanRequest,
): Promise<MealPlan> {
  return apiClient.post('meal-plans', { json: data }).json<MealPlan>()
}

export async function updateMealPlan(
  id: string,
  data: UpdateMealPlanRequest,
): Promise<MealPlan> {
  return apiClient.put(`meal-plans/${id}`, { json: data }).json<MealPlan>()
}

export async function deleteMealPlan(id: string): Promise<void> {
  await apiClient.delete(`meal-plans/${id}`)
}

export async function assignMeal(
  planId: string,
  data: AssignMealRequest,
): Promise<MealAssignment> {
  return apiClient
    .post(`meal-plans/${planId}/meals`, { json: data })
    .json<MealAssignment>()
}

export async function removeMeal(
  planId: string,
  mealId: string,
): Promise<void> {
  await apiClient.delete(`meal-plans/${planId}/meals/${mealId}`)
}

export async function generateMeals(
  planId: string,
  data: GenerateRequest,
): Promise<MealAssignment[]> {
  return apiClient
    .post(`meal-plans/${planId}/generate`, { json: data })
    .json<MealAssignment[]>()
}

export async function addMealSlot(
  planId: string,
  name: string,
): Promise<MealSlotType> {
  return apiClient
    .post(`meal-plans/${planId}/slots`, { json: { name } })
    .json<MealSlotType>()
}

export async function updateMealSlot(
  planId: string,
  slotId: string,
  name: string,
): Promise<MealSlotType> {
  return apiClient
    .put(`meal-plans/${planId}/slots/${slotId}`, { json: { name } })
    .json<MealSlotType>()
}

export async function removeMealSlot(
  planId: string,
  slotId: string,
): Promise<void> {
  await apiClient.delete(`meal-plans/${planId}/slots/${slotId}`)
}

export async function getShoppingList(
  planId: string,
): Promise<ShoppingList> {
  return apiClient
    .get(`meal-plans/${planId}/shopping-list`)
    .json<ShoppingList>()
}

export async function toggleShoppingItem(
  planId: string,
  itemId: string,
  checked: boolean,
): Promise<void> {
  await apiClient.patch(
    `meal-plans/${planId}/shopping-list/items/${itemId}`,
    { json: { checked } },
  )
}
