import { apiClient } from '@/shared/api/client'
import type { RatingCriterion, RatingSubmission, RatingSummary, UserRating } from './types'

export async function getRatingCriteria(): Promise<RatingCriterion[]> {
  return apiClient.get('rating-criteria').json<RatingCriterion[]>()
}

export async function getRecipeRatings(recipeId: string): Promise<RatingSummary> {
  return apiClient.get(`recipes/${recipeId}/ratings`).json<RatingSummary>()
}

export async function getUserRating(recipeId: string): Promise<UserRating | null> {
  return apiClient.get(`recipes/${recipeId}/ratings/me`).json<UserRating | null>()
}

export async function submitRating(
  recipeId: string,
  data: RatingSubmission,
): Promise<void> {
  await apiClient.post(`recipes/${recipeId}/ratings`, { json: data })
}

export async function updateRating(
  recipeId: string,
  ratingId: number,
  data: RatingSubmission,
): Promise<void> {
  await apiClient.put(`recipes/${recipeId}/ratings/${ratingId}`, { json: data })
}

export async function deleteRating(
  recipeId: string,
  ratingId: number,
): Promise<void> {
  await apiClient.delete(`recipes/${recipeId}/ratings/${ratingId}`)
}
