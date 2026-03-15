import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { X, Plus } from 'lucide-react'
import { GlassPanel } from '@/shared/ui/GlassPanel'
import { useDebounce } from '@/shared/hooks/useDebounce'
import { ingredientQueries } from '@/features/ingredients/api/ingredient-queries'

interface FavoriteIngredientsProps {
  favoriteIds: number[]
  onAdd: (ingredientId: number) => void
  onRemove: (ingredientId: number) => void
}

export function FavoriteIngredients({
  favoriteIds,
  onAdd,
  onRemove,
}: FavoriteIngredientsProps) {
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search, 300)

  const { data: ingredients } = useQuery(ingredientQueries.list())
  const { data: searchResults } = useQuery({
    ...ingredientQueries.list(debouncedSearch),
    enabled: debouncedSearch.length > 0,
  })

  const favoriteIngredients = (ingredients ?? []).filter((i) =>
    favoriteIds.includes(i.id),
  )

  const filteredResults = (searchResults ?? []).filter(
    (i) => !favoriteIds.includes(i.id),
  )

  return (
    <GlassPanel className="p-6 space-y-4">
      {/* Current favorites as chips */}
      <div className="flex flex-wrap gap-2">
        {favoriteIngredients.length === 0 && (
          <p className="text-sm text-white/40">No favorite ingredients yet</p>
        )}
        {favoriteIngredients.map((ingredient) => (
          <span
            key={ingredient.id}
            className="inline-flex items-center gap-1 rounded-full bg-accent/20 px-3 py-1 text-sm text-accent-light"
          >
            {ingredient.name}
            <button
              type="button"
              onClick={() => onRemove(ingredient.id)}
              className="ml-1 rounded-full p-0.5 transition-colors hover:bg-white/10"
              aria-label={`Remove ${ingredient.name}`}
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
      </div>

      {/* Search to add */}
      <div className="relative">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search to add ingredients..."
          className="block w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-white placeholder-white/30 outline-none transition-colors focus:border-accent/50 focus:bg-white/[0.08]"
        />
        {debouncedSearch && filteredResults.length > 0 && (
          <div className="absolute left-0 right-0 top-full z-10 mt-1 max-h-48 overflow-y-auto rounded-lg border border-white/10 bg-gray-900/95 backdrop-blur-md">
            {filteredResults.map((ingredient) => (
              <button
                key={ingredient.id}
                type="button"
                onClick={() => {
                  onAdd(ingredient.id)
                  setSearch('')
                }}
                className="flex w-full items-center justify-between px-4 py-2 text-sm text-white/80 transition-colors hover:bg-white/10"
              >
                {ingredient.name}
                <Plus className="h-4 w-4 text-accent-light" />
              </button>
            ))}
          </div>
        )}
      </div>
    </GlassPanel>
  )
}
