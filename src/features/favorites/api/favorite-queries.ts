import { queryOptions, useMutation, useQueryClient } from '@tanstack/react-query'
import { getFavorites, toggleFavorite } from './favorite-api'
import type { RecipeSummary } from '@/features/recipes/api/types'

export const favoriteQueries = {
  list: () =>
    queryOptions({
      queryKey: ['favorites'] as const,
      queryFn: () => getFavorites(),
    }),
}

export function useToggleFavorite() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (recipeId: string) => toggleFavorite(recipeId),
    onMutate: async (recipeId) => {
      await queryClient.cancelQueries({ queryKey: ['favorites'] })
      await queryClient.cancelQueries({ queryKey: ['recipes'] })

      const previousFavorites = queryClient.getQueryData<RecipeSummary[]>([
        'favorites',
      ])

      queryClient.setQueryData<RecipeSummary[]>(['favorites'], (old) => {
        if (!old) return old
        const exists = old.some((r) => r.id === recipeId)
        if (exists) {
          return old.filter((r) => r.id !== recipeId)
        }
        return old
      })

      return { previousFavorites }
    },
    onError: (_err, _id, context) => {
      if (context?.previousFavorites) {
        queryClient.setQueryData(['favorites'], context.previousFavorites)
      }
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: ['favorites'] })
      await queryClient.invalidateQueries({ queryKey: ['recipes'] })
    },
  })
}
