import { useState } from 'react'
import { Search, X, Loader2 } from 'lucide-react'
import { useInfiniteQuery } from '@tanstack/react-query'
import { GlassPanel } from '@/shared/ui/GlassPanel'
import { Skeleton } from '@/shared/ui/Skeleton'
import { useDebounce } from '@/shared/hooks/useDebounce'
import { recipeQueries } from '@/features/recipes/api/recipe-queries'
import { DraggableRecipe } from './DraggableRecipe'

interface RecipeDragPanelProps {
  isOpen: boolean
}

export function RecipeDragPanel({ isOpen }: RecipeDragPanelProps) {
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search, 300)

  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteQuery({
      ...recipeQueries.list({ q: debouncedSearch || undefined }),
      enabled: isOpen,
    })

  const recipes = data?.pages.flatMap((p) => p.content) ?? []

  if (!isOpen) return null

  return (
    <GlassPanel className="hidden w-[250px] shrink-0 flex-col overflow-hidden md:flex">
      {/* Search */}
      <div className="border-b border-white/10 p-2">
        <div className="flex items-center gap-2 rounded-lg bg-white/[0.06] px-2 py-1.5">
          <Search className="h-3.5 w-3.5 shrink-0 text-white/40" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search recipes..."
            className="flex-1 bg-transparent text-xs text-white placeholder-white/30 outline-none"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              className="text-white/40 hover:text-white transition-colors"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>

      {/* Recipe list */}
      <div className="flex-1 overflow-y-auto p-1">
        {isLoading ? (
          <div className="space-y-2 p-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-center gap-2 p-1">
                <Skeleton variant="rectangular" width={36} height={36} />
                <div className="flex-1">
                  <Skeleton width="80%" />
                  <Skeleton width="50%" className="mt-1" />
                </div>
              </div>
            ))}
          </div>
        ) : recipes.length === 0 ? (
          <p className="py-6 text-center text-xs text-white/40">
            No recipes found
          </p>
        ) : (
          <>
            {recipes.map((recipe) => (
              <DraggableRecipe key={recipe.id} recipe={recipe} />
            ))}

            {hasNextPage && (
              <div className="py-2 text-center">
                <button
                  type="button"
                  onClick={() => fetchNextPage()}
                  disabled={isFetchingNextPage}
                  className="rounded bg-white/10 px-3 py-1 text-[10px] text-white/60 hover:bg-white/15 disabled:opacity-50 transition-colors"
                >
                  {isFetchingNextPage ? (
                    <Loader2 className="inline h-3 w-3 animate-spin" />
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
  )
}
