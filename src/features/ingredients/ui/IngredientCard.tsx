import { GlassCard } from '@/shared/ui/GlassCard'
import type { Ingredient, IngredientDetail } from '../api/types'

interface IngredientCardProps {
  ingredient: Ingredient
  onSelect: (id: number) => void
  isExpanded: boolean
  detail?: IngredientDetail
}

export function IngredientCard({
  ingredient,
  onSelect,
  isExpanded,
  detail,
}: IngredientCardProps) {
  return (
    <GlassCard
      className="p-4"
      as="button"
    >
      <div
        className="w-full text-left"
        onClick={() => onSelect(ingredient.id)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            onSelect(ingredient.id)
          }
        }}
      >
        <div className="flex items-center justify-between">
          <span className="font-medium text-white">{ingredient.name}</span>
          {ingredient.allergenIds.length > 0 && (
            <span className="rounded-full bg-red-500/20 px-2 py-0.5 text-xs text-red-300">
              {ingredient.allergenIds.length} allergen
              {ingredient.allergenIds.length > 1 ? 's' : ''}
            </span>
          )}
        </div>

        {isExpanded && detail && (
          <div className="mt-3 space-y-2">
            {/* Allergen badges */}
            {detail.allergenNames.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {detail.allergenNames.map((name) => (
                  <span
                    key={name}
                    className="rounded-full bg-red-500/20 px-2 py-0.5 text-xs text-red-300"
                  >
                    {name}
                  </span>
                ))}
              </div>
            )}

            {/* Nutritional info */}
            {detail.nutritionalInfo && (
              <p className="text-sm text-white/60">{detail.nutritionalInfo}</p>
            )}

            {/* Description */}
            {detail.description && (
              <p className="mt-2 text-sm text-white/60">
                {detail.description}
              </p>
            )}
          </div>
        )}
      </div>
    </GlassCard>
  )
}
