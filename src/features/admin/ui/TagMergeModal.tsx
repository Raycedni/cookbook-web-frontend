import { useState, useMemo, useEffect } from 'react'
import { X } from 'lucide-react'
import { GlassPanel } from '@/shared/ui/GlassPanel'
import { useDebounce } from '@/shared/hooks/useDebounce'
import { cn } from '@/shared/lib/cn'
import { apiClient } from '@/shared/api/client'
import type { Tag, TagNode } from '@/features/recipes/api/types'

function getDescendantIds(roots: TagNode[], sourceId: number): Set<number> {
  const ids = new Set<number>()

  function findNode(nodes: TagNode[]): TagNode | null {
    for (const node of nodes) {
      if (node.id === sourceId) return node
      const found = findNode(node.children)
      if (found) return found
    }
    return null
  }

  function collectDescendants(node: TagNode) {
    for (const child of node.children) {
      ids.add(child.id)
      collectDescendants(child)
    }
  }

  const sourceNode = findNode(roots)
  if (sourceNode) collectDescendants(sourceNode)
  return ids
}

interface TagMergeModalProps {
  sourceTag: Tag
  allTags: Tag[]
  tree: TagNode[]
  onConfirm: (targetId: number) => void
  onClose: () => void
}

export function TagMergeModal({
  sourceTag,
  allTags,
  tree,
  onConfirm,
  onClose,
}: TagMergeModalProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTargetId, setSelectedTargetId] = useState<number | null>(null)
  const debouncedSearch = useDebounce(searchQuery)

  // Exclude source tag and its descendants from targets
  const descendantIds = useMemo(
    () => getDescendantIds(tree, sourceTag.id),
    [tree, sourceTag.id],
  )

  const filteredTags = useMemo(() => {
    return allTags.filter((tag) => {
      if (tag.id === sourceTag.id) return false
      if (descendantIds.has(tag.id)) return false
      if (debouncedSearch) {
        return tag.name.toLowerCase().includes(debouncedSearch.toLowerCase())
      }
      return true
    })
  }, [allTags, sourceTag.id, descendantIds, debouncedSearch])

  const selectedTarget = allTags.find((t) => t.id === selectedTargetId)

  // Attempt to fetch affected recipe count (graceful fallback if endpoint doesn't exist)
  const [recipeCount, setRecipeCount] = useState<number | null>(null)
  const [loadingCount, setLoadingCount] = useState(false)

  useEffect(() => {
    if (selectedTargetId === null) {
      setRecipeCount(null)
      return
    }
    let cancelled = false
    setLoadingCount(true)
    apiClient
      .get(
        `admin/tags/${sourceTag.id}/merge-preview?targetId=${selectedTargetId}`,
      )
      .json<{ recipeCount: number }>()
      .then((data) => {
        if (!cancelled) setRecipeCount(data.recipeCount)
      })
      .catch(() => {
        // Endpoint may not exist (404) -- graceful fallback, no count shown
        if (!cancelled) setRecipeCount(null)
      })
      .finally(() => {
        if (!cancelled) setLoadingCount(false)
      })
    return () => {
      cancelled = true
    }
  }, [sourceTag.id, selectedTargetId])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <GlassPanel
        intensity="heavy"
        className="relative z-10 w-full max-w-md mx-4 p-6"
      >
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded p-1 text-white/40 hover:text-white hover:bg-white/10"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Title */}
        <h2 className="text-lg font-semibold text-white mb-4">Merge Tag</h2>

        {/* Source display */}
        <p className="text-sm text-white/60 mb-4">
          Merge &ldquo;{sourceTag.name}&rdquo; into...
        </p>

        {/* Search input */}
        <input
          type="text"
          placeholder="Search tags..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded-lg bg-white/5 px-3 py-2 text-sm text-white/90 placeholder:text-white/30 outline-none focus:ring-1 focus:ring-accent/50 mb-3"
          autoFocus
        />

        {/* Tag list */}
        <div className="max-h-48 overflow-y-auto space-y-1 mb-4">
          {filteredTags.length === 0 ? (
            <p className="text-xs text-white/30 text-center py-4">
              No matching tags found.
            </p>
          ) : (
            filteredTags.map((tag) => (
              <button
                key={tag.id}
                type="button"
                onClick={() => setSelectedTargetId(tag.id)}
                className={cn(
                  'w-full text-left rounded-lg px-3 py-2 text-sm transition-colors',
                  selectedTargetId === tag.id
                    ? 'bg-accent/20 text-accent-light ring-1 ring-accent/30'
                    : 'text-white/70 hover:bg-white/5',
                )}
              >
                {tag.name}
              </button>
            ))
          )}
        </div>

        {/* Confirmation text */}
        {selectedTarget && (
          <p className="text-sm text-white/50 mb-4">
            This will move all recipes tagged &ldquo;{sourceTag.name}&rdquo; to
            &ldquo;{selectedTarget.name}&rdquo; and delete &ldquo;
            {sourceTag.name}&rdquo;.
            {loadingCount && ' Loading affected recipes...'}
            {recipeCount !== null &&
              !loadingCount &&
              ` Affects ${recipeCount} recipe${recipeCount !== 1 ? 's' : ''}.`}
          </p>
        )}

        {/* Action buttons */}
        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-sm text-white/60 hover:text-white hover:bg-white/5 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              if (selectedTargetId !== null) onConfirm(selectedTargetId)
            }}
            disabled={selectedTargetId === null}
            className={cn(
              'rounded-lg px-4 py-2 text-sm font-medium transition-colors',
              selectedTargetId !== null
                ? 'bg-accent/20 text-accent-light hover:bg-accent/30'
                : 'bg-white/5 text-white/20 cursor-not-allowed',
            )}
          >
            Merge
          </button>
        </div>
      </GlassPanel>
    </div>
  )
}
