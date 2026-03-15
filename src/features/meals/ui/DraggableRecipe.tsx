import { useDraggable } from '@dnd-kit/core'
import { Clock } from 'lucide-react'
import { StarRating } from '@/shared/ui/StarRating'
import type { RecipeSummary } from '@/features/recipes/api/types'

interface DraggableRecipeProps {
  recipe: RecipeSummary
}

export function DraggableRecipe({ recipe }: DraggableRecipeProps) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `recipe-${recipe.id}`,
    data: { type: 'recipe', recipe },
  })

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`flex items-center gap-2 rounded-lg p-2 hover:bg-white/[0.06] transition-colors cursor-grab ${
        isDragging ? 'opacity-30' : ''
      }`}
    >
      {recipe.imageUrl ? (
        <img
          src={recipe.imageUrl}
          alt={recipe.title}
          className="h-9 w-9 rounded object-cover shrink-0"
        />
      ) : (
        <div className="h-9 w-9 rounded bg-white/10 shrink-0" />
      )}
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium text-white/80 truncate">
          {recipe.title}
        </p>
        <div className="mt-0.5 flex items-center gap-2">
          <span className="flex items-center gap-0.5 text-[10px] text-white/40">
            <Clock className="h-2.5 w-2.5" />
            {recipe.cookTimeMinutes}m
          </span>
          <StarRating
            rating={recipe.averageRating}
            size="sm"
            className="scale-75 origin-left"
          />
        </div>
      </div>
    </div>
  )
}
