import { queryOptions } from '@tanstack/react-query'
import { getAllergens, getPreferences, getProfile } from './profile-api'

export const profileQueries = {
  profile: () =>
    queryOptions({
      queryKey: ['profile'] as const,
      queryFn: () => getProfile(),
    }),

  preferences: () =>
    queryOptions({
      queryKey: ['profile', 'preferences'] as const,
      queryFn: () => getPreferences(),
    }),

  allergens: () =>
    queryOptions({
      queryKey: ['allergens'] as const,
      queryFn: () => getAllergens(),
    }),
}
