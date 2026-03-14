import { apiClient } from '@/shared/api/client'
import type { RecipeDetail, RecipeFilters, RecipeSummary, SpringPage, Tag } from './types'

export async function getRecipes(
  params: RecipeFilters & { page: number; size?: number },
): Promise<SpringPage<RecipeSummary>> {
  return apiClient
    .get('recipes', {
      searchParams: {
        page: params.page,
        size: params.size ?? 12,
        ...(params.q && { search: params.q }),
        ...(params.tagIds?.length && { tagIds: params.tagIds.join(',') }),
      },
    })
    .json<SpringPage<RecipeSummary>>()
}

export async function getRecipe(id: string): Promise<RecipeDetail> {
  return apiClient.get(`recipes/${id}`).json<RecipeDetail>()
}

export async function getTags(): Promise<Tag[]> {
  return apiClient.get('tags').json<Tag[]>()
}
