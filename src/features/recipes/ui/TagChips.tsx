import { X } from 'lucide-react'

interface TagChipsProps {
  tags: { id: number; name: string }[]
  onRemove: (tagId: number) => void
}

export function TagChips({ tags, onRemove }: TagChipsProps) {
  if (tags.length === 0) return null

  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((tag) => (
        <span
          key={tag.id}
          className="flex items-center gap-1 text-sm px-3 py-1 rounded-full bg-accent/20 text-accent-light"
        >
          {tag.name}
          <button
            type="button"
            onClick={() => onRemove(tag.id)}
            className="hover:text-white transition-colors"
          >
            <X className="h-3 w-3" />
          </button>
        </span>
      ))}
    </div>
  )
}
