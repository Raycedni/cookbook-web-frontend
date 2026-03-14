export interface Ingredient {
  id: number
  name: string
  allergenIds: number[]
  nutritionalInfo?: string
}

export interface IngredientDetail extends Ingredient {
  description?: string
  allergenNames: string[]
}
