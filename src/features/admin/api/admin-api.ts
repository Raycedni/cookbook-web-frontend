import { apiClient } from '@/shared/api/client'
import type {
  AdminStats,
  AdminUser,
  BlockedIp,
  SystemConfig,
  AdminRatingCriterion,
  SpringPage,
} from './types'
import type { Ingredient } from '@/features/ingredients/api/types'
import type { Tag, Unit } from '@/features/recipes/api/types'

// --- Stats ---

export async function getAdminStats(): Promise<AdminStats> {
  return apiClient.get('admin/stats').json<AdminStats>()
}

// --- Users ---

export async function getAdminUsers(params: {
  search?: string
  page?: number
  size?: number
}): Promise<SpringPage<AdminUser>> {
  return apiClient
    .get('admin/users', {
      searchParams: {
        page: params.page ?? 0,
        size: params.size ?? 20,
        ...(params.search && { search: params.search }),
      },
    })
    .json<SpringPage<AdminUser>>()
}

export async function updateUserRole(
  userId: string,
  role: string,
): Promise<AdminUser> {
  return apiClient
    .put(`admin/users/${userId}/role`, { json: { role } })
    .json<AdminUser>()
}

export async function deleteUser(userId: string): Promise<void> {
  await apiClient.delete(`admin/users/${userId}`)
}

// --- Blocked IPs ---

export async function getBlockedIps(): Promise<BlockedIp[]> {
  return apiClient.get('admin/blocked-ips').json<BlockedIp[]>()
}

export async function addBlockedIp(data: {
  ipAddress: string
  reason?: string
}): Promise<BlockedIp> {
  return apiClient.post('admin/blocked-ips', { json: data }).json<BlockedIp>()
}

export async function removeBlockedIp(id: number): Promise<void> {
  await apiClient.delete(`admin/blocked-ips/${id}`)
}

// --- System Config ---

export async function getSystemConfig(): Promise<SystemConfig[]> {
  return apiClient.get('admin/config').json<SystemConfig[]>()
}

export async function createConfig(data: {
  key: string
  value: string
}): Promise<SystemConfig> {
  return apiClient.post('admin/config', { json: data }).json<SystemConfig>()
}

export async function updateConfig(
  id: number,
  data: { value: string },
): Promise<SystemConfig> {
  return apiClient
    .put(`admin/config/${id}`, { json: data })
    .json<SystemConfig>()
}

export async function deleteConfig(id: number): Promise<void> {
  await apiClient.delete(`admin/config/${id}`)
}

// --- Rating Criteria ---

export async function getAdminRatingCriteria(): Promise<
  AdminRatingCriterion[]
> {
  return apiClient
    .get('admin/rating-criteria')
    .json<AdminRatingCriterion[]>()
}

export async function createRatingCriterion(data: {
  name: string
  description: string
}): Promise<AdminRatingCriterion> {
  return apiClient
    .post('admin/rating-criteria', { json: data })
    .json<AdminRatingCriterion>()
}

export async function updateRatingCriterion(
  id: number,
  data: { name: string; description: string },
): Promise<AdminRatingCriterion> {
  return apiClient
    .put(`admin/rating-criteria/${id}`, { json: data })
    .json<AdminRatingCriterion>()
}

export async function toggleRatingCriterion(
  id: number,
): Promise<AdminRatingCriterion> {
  return apiClient
    .patch(`admin/rating-criteria/${id}/toggle`)
    .json<AdminRatingCriterion>()
}

export async function deleteRatingCriterion(id: number): Promise<void> {
  await apiClient.delete(`admin/rating-criteria/${id}`)
}

// --- Ingredients ---

export async function getAdminIngredients(params: {
  search?: string
}): Promise<Ingredient[]> {
  return apiClient
    .get('admin/ingredients', {
      searchParams: {
        ...(params.search && { search: params.search }),
      },
    })
    .json<Ingredient[]>()
}

export async function createIngredient(data: {
  name: string
  allergenIds?: number[]
}): Promise<Ingredient> {
  return apiClient
    .post('admin/ingredients', { json: data })
    .json<Ingredient>()
}

export async function updateIngredient(
  id: number,
  data: { name: string; allergenIds?: number[] },
): Promise<Ingredient> {
  return apiClient
    .put(`admin/ingredients/${id}`, { json: data })
    .json<Ingredient>()
}

export async function deleteIngredient(id: number): Promise<void> {
  await apiClient.delete(`admin/ingredients/${id}`)
}

// --- Tags ---

export async function getAdminTags(): Promise<Tag[]> {
  return apiClient.get('admin/tags').json<Tag[]>()
}

export async function createTag(data: {
  name: string
  parentId?: number
}): Promise<Tag> {
  return apiClient.post('admin/tags', { json: data }).json<Tag>()
}

export async function updateTag(
  id: number,
  data: { name?: string; parentId?: number },
): Promise<Tag> {
  return apiClient.put(`admin/tags/${id}`, { json: data }).json<Tag>()
}

export async function mergeTag(
  sourceId: number,
  targetId: number,
): Promise<void> {
  await apiClient.post(`admin/tags/${sourceId}/merge`, {
    json: { targetId },
  })
}

export async function deleteTag(id: number): Promise<void> {
  await apiClient.delete(`admin/tags/${id}`)
}

// --- Units ---

export async function getAdminUnits(): Promise<Unit[]> {
  return apiClient.get('admin/units').json<Unit[]>()
}

export async function createUnit(data: {
  name: string
  abbreviation: string
  type: string
}): Promise<Unit> {
  return apiClient.post('admin/units', { json: data }).json<Unit>()
}

export async function updateUnit(
  id: number,
  data: { name: string; abbreviation: string; type: string },
): Promise<Unit> {
  return apiClient.put(`admin/units/${id}`, { json: data }).json<Unit>()
}

export async function deleteUnit(id: number): Promise<void> {
  await apiClient.delete(`admin/units/${id}`)
}
