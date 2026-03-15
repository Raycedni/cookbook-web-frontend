import type { RecipeIngredient } from '@/features/recipes/api/types'
import { scaleAmount, formatAmount } from './ServingScaler'

interface IngredientListProps {
  ingredients: RecipeIngredient[]
  originalServings: number
  targetServings: number
}

export function IngredientList({
  ingredients,
  originalServings,
  targetServings,
}: IngredientListProps) {
  if (ingredients.length === 0) {
    return <p className="text-white/40 text-sm">No ingredients listed</p>
  }

  return (
    <div>
      {ingredients.map((ingredient) => (
        <div
          key={ingredient.id}
          className="flex items-baseline gap-2 py-1.5 border-b border-white/10"
        >
          <span className="font-medium text-white min-w-[3ch] text-right">
            {formatAmount(
              scaleAmount(ingredient.amount, originalServings, targetServings),
            )}
          </span>
          <span className="text-white/60">{ingredient.unit}</span>
          <span className="text-white/80">{ingredient.ingredientName}</span>
        </div>
      ))}
    </div>
  )
}
