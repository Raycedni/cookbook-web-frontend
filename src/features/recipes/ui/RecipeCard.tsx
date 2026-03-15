import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { ChefHat, Clock } from 'lucide-react'
import { GlassCard } from '@/shared/ui/GlassCard'
import { StarRating } from '@/shared/ui/StarRating'
import { FavoriteButton } from '@/features/favorites/ui/FavoriteButton'
import type { RecipeSummary } from '@/features/recipes/api/types'

interface RecipeCardProps {
  recipe: RecipeSummary
}

export function RecipeCard({ recipe }: RecipeCardProps) {
  const [imgError, setImgError] = useState(false)
  const showFallback = !recipe.imageUrl || imgError

  return (
    <Link
      to="/recipes/$recipeId"
      params={{ recipeId: recipe.id }}
      className="block"
    >
      <GlassCard className="p-0 overflow-hidden">
        {/* Hero image */}
        <div className="relative aspect-[4/3]">
          {showFallback ? (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-accent/20 to-accent/5">
              <ChefHat className="h-12 w-12 text-white/20" />
            </div>
          ) : (
            <img
              src={recipe.imageUrl!}
              alt={recipe.title}
              className="h-full w-full object-cover"
              onError={() => setImgError(true)}
            />
          )}
          {/* Favorite button overlay */}
          <FavoriteButton
            recipeId={recipe.id}
            isFavorite={recipe.isFavorite}
            className="absolute top-2 right-2"
          />
        </div>

        {/* Card content */}
        <div className="p-4 space-y-2">
          <h3 className="font-semibold text-white truncate">
            {recipe.title}
          </h3>

          {/* Metadata row */}
          <div className="flex items-center gap-3 text-sm text-white/60">
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {recipe.cookTimeMinutes} min
            </span>
            <span className="flex items-center gap-1">
              <StarRating rating={recipe.averageRating} size="sm" />
              {recipe.averageRating.toFixed(1)}
            </span>
          </div>

          {/* Tag chips (first 2) */}
          {recipe.tags.length > 0 && (
            <div className="flex gap-1.5 flex-wrap">
              {recipe.tags.slice(0, 2).map((tag) => (
                <span
                  key={tag.id}
                  className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-white/60"
                >
                  {tag.name}
                </span>
              ))}
            </div>
          )}
        </div>
      </GlassCard>
    </Link>
  )
}
