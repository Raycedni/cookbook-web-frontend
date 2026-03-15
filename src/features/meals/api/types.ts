import type { RecipeSummary } from '@/features/recipes/api/types'

export interface MealPlan {
  id: string
  name: string
  startDate: string // ISO date, e.g., "2026-03-16"
  endDate: string // ISO date, e.g., "2026-03-22"
  participants: number
  mealSlots: MealSlotType[]
  meals: MealAssignment[]
  generatePreferences?: GeneratePreferences
}

export interface MealSlotType {
  id: string
  name: string // e.g., "Breakfast", "Lunch", "Dinner"
  orderIndex: number
}

export interface MealAssignment {
  id: string
  dayIndex: number // 0-6 within the plan's date range
  mealSlotId: string
  recipe: RecipeSummary
  isGenerated: boolean // badge state for auto-generated meals
}

export interface GeneratePreferences {
  mealSlotIds: string[]
  tagIds: number[]
  favoritesOnly: boolean
  maxCookTimeMinutes: number | null
  fillMode: 'empty_only' | 'replace_all'
  maxRepeats: number
}

export interface GenerateRequest {
  preferences: GeneratePreferences
}

export interface ShoppingList {
  planId: string
  categories: ShoppingCategory[]
  totalEstimatedCost: number
}

export interface ShoppingCategory {
  name: string // "Dairy", "Produce", "Meat", "Pantry", etc.
  items: ShoppingItem[]
}

export interface ShoppingItem {
  id: string
  ingredientName: string
  aggregatedAmount: number
  unit: string
  recipeNames: string[] // which recipes need this ingredient
  estimatedCost: number
  checked: boolean
}

export interface CreateMealPlanRequest {
  name: string
  startDate: string
  endDate: string
  participants: number
}

export interface UpdateMealPlanRequest {
  name?: string
  startDate?: string
  endDate?: string
  participants?: number
}

export interface AssignMealRequest {
  dayIndex: number
  mealSlotId: string
  recipeId: string
}
