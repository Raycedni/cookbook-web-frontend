import { infiniteQueryOptions, queryOptions } from '@tanstack/react-query'
import {
  getAssignableTags,
  getRecipe,
  getRecipes,
  getSharedRecipe,
  getTags,
  getUnits,
} from './recipe-api'
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

  units: () =>
    queryOptions({
      queryKey: ['units'] as const,
      queryFn: () => getUnits(),
      staleTime: 10 * 60 * 1000, // units rarely change
    }),

  assignableTags: () =>
    queryOptions({
      queryKey: ['tags', 'assignable'] as const,
      queryFn: () => getAssignableTags(),
    }),

  shared: (token: string) =>
    queryOptions({
      queryKey: [...recipeQueries.all(), 'shared', token] as const,
      queryFn: () => getSharedRecipe(token),
    }),
}
