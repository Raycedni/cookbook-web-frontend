import { apiClient } from '@/shared/api/client'
import type { Allergen, UserPreferences, UserProfile } from './types'

export async function getProfile(): Promise<UserProfile> {
  return apiClient.get('users/me').json<UserProfile>()
}

export async function updateProfile(data: {
  displayName: string
}): Promise<UserProfile> {
  return apiClient.put('users/me', { json: data }).json<UserProfile>()
}

export async function getPreferences(): Promise<UserPreferences> {
  return apiClient.get('users/me/preferences').json<UserPreferences>()
}

export async function updatePreferences(
  data: Partial<UserPreferences>,
): Promise<UserPreferences> {
  return apiClient
    .put('users/me/preferences', { json: data })
    .json<UserPreferences>()
}

export async function getAllergens(): Promise<Allergen[]> {
  return apiClient.get('allergens').json<Allergen[]>()
}
