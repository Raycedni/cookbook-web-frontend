import { useCallback, useEffect, useMemo, useState } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import { Filter, X } from 'lucide-react'
import { recipeQueries } from '@/features/recipes/api/recipe-queries'
import { buildTagTree } from '@/features/recipes/api/types'
import { RecipeGrid } from '@/features/recipes/ui/RecipeGrid'
import { SearchBar } from '@/features/recipes/ui/SearchBar'
import { TagTree } from '@/features/recipes/ui/TagTree'
import { TagChips } from '@/features/recipes/ui/TagChips'
import { GlassPanel } from '@/shared/ui/GlassPanel'
import { useSidebarStore } from '@/shared/ui/Sidebar'

interface RecipeSearch {
  q?: string
  tags?: number[]
}

export const Route = createFileRoute('/_authenticated/recipes')({
  validateSearch: (search: Record<string, unknown>): RecipeSearch => ({
    q: typeof search.q === 'string' ? search.q : undefined,
    tags: Array.isArray(search.tags)
      ? search.tags.filter((t): t is number => typeof t === 'number')
      : undefined,
  }),
  component: RecipeBrowsePage,
})

function RecipeBrowsePage() {
  const { q, tags } = Route.useSearch()
  const navigate = useNavigate({ from: Route.fullPath })
  const [showMobileTags, setShowMobileTags] = useState(false)

  // Set sidebar content on mount
  const setContent = useSidebarStore((s) => s.setContent)
  const { data: tagsData, isLoading: tagsLoading } = useQuery(
    recipeQueries.tags(),
  )

  const tagTree = useMemo(
    () => (tagsData ? buildTagTree(tagsData) : []),
    [tagsData],
  )

  const selectedTagIds = tags ?? []

  const toggleTag = useCallback(
    (tagId: number) => {
      void navigate({
        search: (prev: RecipeSearch) => {
          const current = prev.tags ?? []
          const exists = current.includes(tagId)
          const next = exists
            ? current.filter((id) => id !== tagId)
            : [...current, tagId]
          return { ...prev, tags: next.length > 0 ? next : undefined }
        },
      })
    },
    [navigate],
  )

  // Set sidebar content with TagTree
  useEffect(() => {
    setContent(
      <TagTree
        tags={tagTree}
        selectedIds={selectedTagIds}
        onToggle={toggleTag}
        isLoading={tagsLoading}
      />,
    )
    return () => setContent(null)
  }, [tagTree, selectedTagIds, toggleTag, tagsLoading, setContent])

  const setSearch = useCallback(
    (query: string) => {
      void navigate({
        search: (prev: RecipeSearch) => ({
          ...prev,
          q: query || undefined,
        }),
      })
    },
    [navigate],
  )

  const removeTag = useCallback(
    (tagId: number) => {
      toggleTag(tagId)
    },
    [toggleTag],
  )

  // Fetch recipes with filters
  const {
    data,
    isLoading,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useInfiniteQuery(recipeQueries.list({ q, tagIds: tags }))

  const recipes = data?.pages.flatMap((p) => p.content) ?? []
  const totalElements = data?.pages[0]?.totalElements ?? 0

  // Resolve tag names for TagChips
  const selectedTags = useMemo(() => {
    if (!tagsData || !tags) return []
    return tags
      .map((id) => {
        const tag = tagsData.find((t) => t.id === id)
        return tag ? { id: tag.id, name: tag.name } : null
      })
      .filter((t): t is { id: number; name: string } => t !== null)
  }, [tagsData, tags])

  return (
    <div className="space-y-4">
      {/* Search bar */}
      <SearchBar value={q ?? ''} onChange={setSearch} />

      {/* Mobile filter button */}
      <button
        type="button"
        onClick={() => setShowMobileTags(true)}
        className="md:hidden flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors"
      >
        <Filter className="h-4 w-4" />
        Filter by tags
        {selectedTagIds.length > 0 && (
          <span className="rounded-full bg-accent/20 px-2 py-0.5 text-xs text-accent-light">
            {selectedTagIds.length}
          </span>
        )}
      </button>

      {/* Tag chips */}
      <TagChips tags={selectedTags} onRemove={removeTag} />

      {/* Recipe grid */}
      <RecipeGrid
        recipes={recipes}
        isLoading={isLoading}
        hasNextPage={hasNextPage ?? false}
        isFetchingNextPage={isFetchingNextPage}
        fetchNextPage={() => void fetchNextPage()}
        totalElements={totalElements}
      />

      {/* Mobile tag overlay */}
      {showMobileTags && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setShowMobileTags(false)}
          />
          <div className="absolute bottom-0 left-0 right-0 max-h-[70vh] overflow-y-auto">
            <GlassPanel className="rounded-b-none p-4" intensity="heavy">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">
                  Filter by Tags
                </h3>
                <button
                  type="button"
                  onClick={() => setShowMobileTags(false)}
                  className="text-white/60 hover:text-white transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <TagTree
                tags={tagTree}
                selectedIds={selectedTagIds}
                onToggle={(tagId) => {
                  toggleTag(tagId)
                }}
                isLoading={tagsLoading}
              />
            </GlassPanel>
          </div>
        </div>
      )}
    </div>
  )
}
