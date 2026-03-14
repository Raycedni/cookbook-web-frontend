import { queryOptions } from '@tanstack/react-query'
import { getIngredient, getIngredients } from './ingredient-api'

export const ingredientQueries = {
  list: (search?: string) =>
    queryOptions({
      queryKey: ['ingredients', 'list', search] as const,
      queryFn: () => getIngredients(search ? { search } : undefined),
    }),

  detail: (id: number) =>
    queryOptions({
      queryKey: ['ingredients', 'detail', id] as const,
      queryFn: () => getIngredient(id),
    }),
}
