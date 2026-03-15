import { memo, useState, useCallback } from 'react'
import { ChevronRight, ChevronDown } from 'lucide-react'
import { Skeleton } from '@/shared/ui/Skeleton'
import { cn } from '@/shared/lib/cn'
import type { TagNode } from '@/features/recipes/api/types'

interface TagTreeProps {
  tags: TagNode[]
  selectedIds: number[]
  onToggle: (tagId: number) => void
  isLoading?: boolean
}

interface TagTreeNodeProps {
  tag: TagNode
  selectedIds: number[]
  onToggle: (tagId: number) => void
}

const TagTreeNode = memo(function TagTreeNode({
  tag,
  selectedIds,
  onToggle,
}: TagTreeNodeProps) {
  const [expanded, setExpanded] = useState(false)
  const hasChildren = tag.children.length > 0
  const isSelected = selectedIds.includes(tag.id)

  const handleToggleExpand = useCallback(() => {
    setExpanded((prev) => !prev)
  }, [])

  return (
    <li>
      <div className="flex items-center gap-1">
        {hasChildren ? (
          <button
            type="button"
            onClick={handleToggleExpand}
            className="shrink-0 p-0.5 text-white/40 hover:text-white/70 transition-colors"
            aria-label={expanded ? 'Collapse' : 'Expand'}
          >
            {expanded ? (
              <ChevronDown className="h-3.5 w-3.5" />
            ) : (
              <ChevronRight className="h-3.5 w-3.5" />
            )}
          </button>
        ) : (
          <span className="w-[18px] shrink-0" />
        )}
        <button
          type="button"
          onClick={() => onToggle(tag.id)}
          className={cn(
            'text-sm truncate transition-colors text-left',
            isSelected
              ? 'text-accent-light font-medium'
              : 'text-white/60 hover:text-white/80',
          )}
        >
          {tag.name}
        </button>
      </div>
      {hasChildren && expanded && (
        <ul className="ml-4">
          {tag.children.map((child) => (
            <TagTreeNode
              key={child.id}
              tag={child}
              selectedIds={selectedIds}
              onToggle={onToggle}
            />
          ))}
        </ul>
      )}
    </li>
  )
})

export function TagTree({
  tags,
  selectedIds,
  onToggle,
  isLoading,
}: TagTreeProps) {
  if (isLoading) {
    return <Skeleton lines={5} />
  }

  return (
    <ul className="space-y-1">
      {tags.map((tag) => (
        <TagTreeNode
          key={tag.id}
          tag={tag}
          selectedIds={selectedIds}
          onToggle={onToggle}
        />
      ))}
    </ul>
  )
}
