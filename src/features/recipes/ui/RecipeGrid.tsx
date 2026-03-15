import { SearchX } from 'lucide-react'
import { RecipeCard } from './RecipeCard'
import { RecipeCardSkeleton } from './RecipeCardSkeleton'
import { EmptyState } from '@/shared/ui/EmptyState'
import type { RecipeSummary } from '@/features/recipes/api/types'

interface RecipeGridProps {
  recipes: RecipeSummary[]
  isLoading: boolean
  hasNextPage: boolean
  isFetchingNextPage: boolean
  fetchNextPage: () => void
  totalElements: number
}

export function RecipeGrid({
  recipes,
  isLoading,
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
  totalElements,
}: RecipeGridProps) {
  // Initial loading state
  if (isLoading) {
    return (
      <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-4">
        {Array.from({ length: 6 }, (_, i) => (
          <RecipeCardSkeleton key={i} />
        ))}
      </div>
    )
  }

  // Empty state
  if (recipes.length === 0) {
    return (
      <EmptyState
        icon={SearchX}
        title="No recipes found"
        description="Try different keywords or remove some filters"
      />
    )
  }

  return (
    <div className="space-y-4">
      {/* Recipe grid */}
      <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-4">
        {recipes.map((recipe) => (
          <RecipeCard key={recipe.id} recipe={recipe} />
        ))}
        {isFetchingNextPage &&
          Array.from({ length: 3 }, (_, i) => (
            <RecipeCardSkeleton key={`loading-${i.toString()}`} />
          ))}
      </div>

      {/* Count indicator */}
      <p className="text-sm text-white/40 text-center">
        Showing {recipes.length} of {totalElements} recipes
      </p>

      {/* Load more button */}
      {hasNextPage && (
        <div className="flex justify-center">
          <button
            type="button"
            onClick={fetchNextPage}
            disabled={isFetchingNextPage}
            className="px-6 py-2 rounded-lg bg-accent/20 text-accent-light hover:bg-accent/30 transition-colors disabled:opacity-50"
          >
            {isFetchingNextPage ? 'Loading...' : 'Load more'}
          </button>
        </div>
      )}
    </div>
  )
}
