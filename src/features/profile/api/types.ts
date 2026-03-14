export interface UserProfile {
  id: string
  displayName: string
  email: string
}

export interface UserPreferences {
  allergenIds: number[]
  favoriteIngredientIds: number[]
  hiddenTagIds: number[]
}

export interface Allergen {
  id: number
  name: string
}
