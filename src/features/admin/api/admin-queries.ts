import { queryOptions } from '@tanstack/react-query'
import {
  getAdminStats,
  getAdminUsers,
  getBlockedIps,
  getSystemConfig,
  getAdminRatingCriteria,
  getAdminIngredients,
  getAdminTags,
  getAdminUnits,
} from './admin-api'

export const adminQueries = {
  all: () => ['admin'] as const,

  stats: () =>
    queryOptions({
      queryKey: [...adminQueries.all(), 'stats'] as const,
      queryFn: () => getAdminStats(),
    }),

  users: (search?: string, page?: number) =>
    queryOptions({
      queryKey: [...adminQueries.all(), 'users', { search, page }] as const,
      queryFn: () => getAdminUsers({ search, page }),
    }),

  blockedIps: () =>
    queryOptions({
      queryKey: [...adminQueries.all(), 'blocked-ips'] as const,
      queryFn: () => getBlockedIps(),
    }),

  config: () =>
    queryOptions({
      queryKey: [...adminQueries.all(), 'config'] as const,
      queryFn: () => getSystemConfig(),
    }),

  ratingCriteria: () =>
    queryOptions({
      queryKey: [...adminQueries.all(), 'rating-criteria'] as const,
      queryFn: () => getAdminRatingCriteria(),
    }),

  ingredients: (search?: string) =>
    queryOptions({
      queryKey: [...adminQueries.all(), 'ingredients', { search }] as const,
      queryFn: () => getAdminIngredients({ search }),
    }),

  tags: () =>
    queryOptions({
      queryKey: [...adminQueries.all(), 'tags'] as const,
      queryFn: () => getAdminTags(),
    }),

  units: () =>
    queryOptions({
      queryKey: [...adminQueries.all(), 'units'] as const,
      queryFn: () => getAdminUnits(),
    }),
}
