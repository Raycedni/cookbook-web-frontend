import { infiniteQueryOptions, queryOptions } from '@tanstack/react-query'
import { getRecipe, getRecipes, getTags } from './recipe-api'
import type { RecipeFilters } from './types'

export const recipeQueries = {
  all: () => ['recipes'] as const,

  list: (filters: RecipeFilters) =>
    infiniteQueryOptions({
      queryKey: [...recipeQueries.all(), 'list', filters] as const,
      queryFn: ({ pageParam }) => getRecipes({ ...filters, page: pageParam }),
      initialPageParam: 0,
      getNextPageParam: (lastPage) =>
        lastPage.last ? undefined : lastPage.number + 1,
    }),

  detail: (id: string) =>
    queryOptions({
      queryKey: [...recipeQueries.all(), 'detail', id] as const,
      queryFn: () => getRecipe(id),
    }),

  tags: () =>
    queryOptions({
      queryKey: ['tags'] as const,
      queryFn: () => getTags(),
    }),
}
