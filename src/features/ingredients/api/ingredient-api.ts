import { apiClient } from '@/shared/api/client'
import type { Ingredient, IngredientDetail } from './types'

export async function getIngredients(params?: {
  search?: string
}): Promise<Ingredient[]> {
  return apiClient
    .get('ingredients', {
      searchParams: {
        ...(params?.search && { search: params.search }),
      },
    })
    .json<Ingredient[]>()
}

export async function getIngredient(id: number): Promise<IngredientDetail> {
  return apiClient.get(`ingredients/${id}`).json<IngredientDetail>()
}
