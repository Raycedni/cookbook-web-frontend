import { useQuery } from '@tanstack/react-query'
import { Eye, EyeOff } from 'lucide-react'
import { GlassPanel } from '@/shared/ui/GlassPanel'
import { Skeleton } from '@/shared/ui/Skeleton'
import { recipeQueries } from '@/features/recipes/api/recipe-queries'

interface TagVisibilityProps {
  hiddenTagIds: number[]
  onToggle: (tagId: number) => void
}

export function TagVisibility({ hiddenTagIds, onToggle }: TagVisibilityProps) {
  const { data: tags, isLoading } = useQuery(recipeQueries.tags())

  if (isLoading) {
    return (
      <GlassPanel className="p-6">
        <Skeleton lines={5} />
      </GlassPanel>
    )
  }

  if (!tags || tags.length === 0) {
    return (
      <GlassPanel className="p-6">
        <p className="text-sm text-white/40">No tags available</p>
      </GlassPanel>
    )
  }

  return (
    <GlassPanel className="divide-y divide-white/5 p-2">
      {tags.map((tag) => {
        const isHidden = hiddenTagIds.includes(tag.id)
        return (
          <div
            key={tag.id}
            className={`flex items-center justify-between px-4 py-3 ${
              isHidden ? 'opacity-50' : ''
            }`}
          >
            <span className="text-white/80">{tag.name}</span>
            <button
              type="button"
              onClick={() => onToggle(tag.id)}
              className="rounded-lg p-1.5 text-white/60 transition-colors hover:bg-white/10 hover:text-white"
              aria-label={isHidden ? `Show ${tag.name}` : `Hide ${tag.name}`}
            >
              {isHidden ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
        )
      })}
    </GlassPanel>
  )
}
