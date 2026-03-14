import { queryOptions } from '@tanstack/react-query'
import { getRatingCriteria, getRecipeRatings, getUserRating } from './rating-api'

export const ratingQueries = {
  criteria: () =>
    queryOptions({
      queryKey: ['rating-criteria'] as const,
      queryFn: () => getRatingCriteria(),
    }),

  summary: (recipeId: string) =>
    queryOptions({
      queryKey: ['recipes', recipeId, 'ratings'] as const,
      queryFn: () => getRecipeRatings(recipeId),
    }),

  userRating: (recipeId: string) =>
    queryOptions({
      queryKey: ['recipes', recipeId, 'ratings', 'me'] as const,
      queryFn: () => getUserRating(recipeId),
    }),
}
