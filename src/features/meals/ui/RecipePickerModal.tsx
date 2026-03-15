import { useState, useEffect, useCallback } from 'react'
import { Search, X, Clock, Loader2 } from 'lucide-react'
import { useInfiniteQuery } from '@tanstack/react-query'
import { GlassPanel } from '@/shared/ui/GlassPanel'
import { Skeleton } from '@/shared/ui/Skeleton'
import { StarRating } from '@/shared/ui/StarRating'
import { useDebounce } from '@/shared/hooks/useDebounce'
import { recipeQueries } from '@/features/recipes/api/recipe-queries'
import type { RecipeSummary } from '@/features/recipes/api/types'

interface RecipePickerModalProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (recipe: RecipeSummary) => void
}

export function RecipePickerModal({
  isOpen,
  onClose,
  onSelect,
}: RecipePickerModalProps) {
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search, 300)

  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteQuery({
      ...recipeQueries.list({ q: debouncedSearch || undefined }),
      enabled: isOpen,
    })

  const recipes = data?.pages.flatMap((p) => p.content) ?? []

  // Close on Escape
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    },
    [onClose],
  )

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      return () => document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, handleKeyDown])

  // Reset search on open
  useEffect(() => {
    if (isOpen) setSearch('')
  }, [isOpen])

  if (!isOpen) return null

  const handleSelect = (recipe: RecipeSummary) => {
    onSelect(recipe)
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <GlassPanel
        intensity="heavy"
        className="mx-4 flex max-h-[80vh] w-full max-w-lg flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 p-4">
          <h2 className="text-lg font-semibold text-white/90">
            Choose a Recipe
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-white/40 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Search */}
        <div className="border-b border-white/10 p-3">
          <div className="flex items-center gap-2 rounded-lg bg-white/[0.06] px-3 py-2">
            <Search className="h-4 w-4 shrink-0 text-white/40" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search recipes..."
              className="flex-1 bg-transparent text-sm text-white placeholder-white/30 outline-none"
              autoFocus
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="text-white/40 hover:text-white transition-colors"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Recipe list */}
        <div className="flex-1 overflow-y-auto p-2">
          {isLoading ? (
            <div className="space-y-2 p-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-2">
                  <Skeleton variant="rectangular" width={40} height={40} />
                  <div className="flex-1">
                    <Skeleton width="70%" />
                    <Skeleton width="40%" className="mt-1" />
                  </div>
                </div>
              ))}
            </div>
          ) : recipes.length === 0 ? (
            <p className="py-8 text-center text-sm text-white/40">
              No recipes found
            </p>
          ) : (
            <>
              {recipes.map((recipe) => (
                <button
                  key={recipe.id}
                  type="button"
                  onClick={() => handleSelect(recipe)}
                  className="flex w-full items-center gap-3 rounded-lg p-2 text-left hover:bg-white/[0.06] transition-colors"
                >
                  {recipe.imageUrl ? (
                    <img
                      src={recipe.imageUrl}
                      alt={recipe.title}
                      className="h-10 w-10 rounded object-cover shrink-0"
                    />
                  ) : (
                    <div className="h-10 w-10 rounded bg-white/10 shrink-0" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-white/80 truncate">
                      {recipe.title}
                    </p>
                    <div className="mt-0.5 flex items-center gap-2">
                      <div className="flex items-center gap-1 text-xs text-white/40">
                        <Clock className="h-3 w-3" />
                        <span>{recipe.cookTimeMinutes}min</span>
                      </div>
                      <StarRating
                        rating={recipe.averageRating}
                        size="sm"
                        className="scale-90 origin-left"
                      />
                    </div>
                  </div>
                </button>
              ))}

              {hasNextPage && (
                <div className="py-2 text-center">
                  <button
                    type="button"
                    onClick={() => fetchNextPage()}
                    disabled={isFetchingNextPage}
                    className="rounded bg-white/10 px-4 py-1.5 text-xs text-white/60 hover:bg-white/15 disabled:opacity-50 transition-colors"
                  >
                    {isFetchingNextPage ? (
                      <Loader2 className="inline h-3.5 w-3.5 animate-spin" />
                    ) : (
                      'Load more'
                    )}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </GlassPanel>
    </div>
  )
}
