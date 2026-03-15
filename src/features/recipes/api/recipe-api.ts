import { apiClient } from '@/shared/api/client'
import type {
  CreateRecipeRequest,
  MediaFileResponse,
  RecipeDetail,
  RecipeFilters,
  RecipeSummary,
  ShareResponse,
  SpringPage,
  Tag,
  Unit,
  UpdateRecipeRequest,
} from './types'

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

export async function createRecipe(
  data: CreateRecipeRequest,
): Promise<RecipeDetail> {
  return apiClient.post('recipes', { json: data }).json<RecipeDetail>()
}

export async function updateRecipe(
  id: string,
  data: UpdateRecipeRequest,
): Promise<RecipeDetail> {
  return apiClient.put(`recipes/${id}`, { json: data }).json<RecipeDetail>()
}

export async function deleteRecipe(id: string): Promise<void> {
  await apiClient.delete(`recipes/${id}`)
}

export async function shareRecipe(id: string): Promise<ShareResponse> {
  return apiClient.post(`recipes/${id}/share`).json<ShareResponse>()
}

export async function getSharedRecipe(token: string): Promise<RecipeDetail> {
  return apiClient.get(`recipes/share/${token}`).json<RecipeDetail>()
}

export async function uploadRecipeImage(
  recipeId: string,
  file: File,
  isPrimary: boolean,
): Promise<MediaFileResponse> {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('isPrimary', String(isPrimary))
  // Do NOT set Content-Type header — ky auto-sets multipart boundary
  return apiClient
    .post(`media/recipes/${recipeId}`, { body: formData })
    .json<MediaFileResponse>()
}

export async function uploadStepImage(
  recipeId: string,
  stepId: number,
  file: File,
): Promise<MediaFileResponse> {
  const formData = new FormData()
  formData.append('file', file)
  return apiClient
    .post(`media/recipes/${recipeId}/steps/${stepId}`, { body: formData })
    .json<MediaFileResponse>()
}

export async function getUnits(): Promise<Unit[]> {
  return apiClient.get('units').json<Unit[]>()
}

export async function getAssignableTags(): Promise<Tag[]> {
  return apiClient.get('tags/assignable').json<Tag[]>()
}
