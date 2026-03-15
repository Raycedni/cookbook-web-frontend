export { type SpringPage } from '@/features/recipes/api/types'
export { type Tag, type TagNode, type Unit } from '@/features/recipes/api/types'
export { type Ingredient } from '@/features/ingredients/api/types'

export interface AdminStats {
  users: number
  recipes: number
  mealPlans: number
  ratings: number
  tags: number
  units: number
  ingredients: number
}

export interface AdminUser {
  id: string
  username: string
  email: string
  role: string
  createdAt: string
}

export interface BlockedIp {
  id: number
  ipAddress: string
  reason?: string
  createdAt: string
}

export interface SystemConfig {
  id: number
  key: string
  value: string
}

export interface AdminRatingCriterion {
  id: number
  name: string
  description: string
  active: boolean
}
