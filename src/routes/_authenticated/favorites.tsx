import { createFileRoute, Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { Heart } from 'lucide-react'
import { EmptyState } from '@/shared/ui/EmptyState'
import { favoriteQueries } from '@/features/favorites/api/favorite-queries'
import { RecipeCard } from '@/features/recipes/ui/RecipeCard'
import { RecipeCardSkeleton } from '@/features/recipes/ui/RecipeCardSkeleton'

export const Route = createFileRoute('/_authenticated/favorites')({
  component: FavoritesPage,
})

function FavoritesPage() {
  const { data: favorites, isLoading } = useQuery(favoriteQueries.list())

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">My Favorites</h1>

      {isLoading ? (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <RecipeCardSkeleton key={i} />
          ))}
        </div>
      ) : !favorites || favorites.length === 0 ? (
        <EmptyState
          icon={Heart}
          title="No favorites yet"
          description="Heart a recipe to save it here"
          action={
            <Link
              to="/recipes"
              className="px-4 py-2 rounded-lg bg-accent/20 text-accent-light hover:bg-accent/30 transition-colors"
            >
              Browse recipes
            </Link>
          }
        />
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-4">
          {favorites.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))}
        </div>
      )}
    </div>
  )
}
