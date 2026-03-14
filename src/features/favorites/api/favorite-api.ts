import { apiClient } from '@/shared/api/client'
import type { RecipeSummary } from '@/features/recipes/api/types'

export async function getFavorites(): Promise<RecipeSummary[]> {
  return apiClient.get('users/me/favorites').json<RecipeSummary[]>()
}

export async function toggleFavorite(recipeId: string): Promise<void> {
  await apiClient.post(`users/me/favorites/${recipeId}`)
}

export async function removeFavorite(recipeId: string): Promise<void> {
  await apiClient.delete(`users/me/favorites/${recipeId}`)
}
