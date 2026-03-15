import { Plus, X } from 'lucide-react'
import { cn } from '@/shared/lib/cn'
import type { MealAssignment } from '@/features/meals/api/types'

interface CalendarCellProps {
  dayIndex: number
  slotId: string
  slotName: string
  meal: MealAssignment | null
  onAddClick: () => void
  onRemove: () => void
}

export function CalendarCell({
  slotName,
  meal,
  onAddClick,
  onRemove,
}: CalendarCellProps) {
  if (!meal) {
    return (
      <div className="min-h-[80px] rounded-lg border border-white/10 p-2 flex flex-col items-center justify-center hover:bg-white/[0.04] transition-colors">
        <span className="text-xs text-white/30 md:hidden mb-1">
          {slotName}
        </span>
        <button
          type="button"
          onClick={onAddClick}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-dashed border-white/20 text-white/40 hover:border-white/40 hover:text-white/60 transition-colors"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-[80px] rounded-lg border border-white/10 p-2 hover:bg-white/[0.04] transition-colors relative group">
      <span className="text-xs text-white/30 md:hidden mb-1 block">
        {slotName}
      </span>
      <button
        type="button"
        onClick={onRemove}
        className="absolute top-1 right-1 h-5 w-5 flex items-center justify-center rounded-full bg-white/10 text-white/40 hover:bg-red-500/30 hover:text-red-300 opacity-0 group-hover:opacity-100 transition-all"
      >
        <X className="h-3 w-3" />
      </button>
      <div className="flex items-start gap-2">
        {meal.recipe.imageUrl ? (
          <img
            src={meal.recipe.imageUrl}
            alt={meal.recipe.title}
            className="h-10 w-10 rounded object-cover shrink-0"
          />
        ) : (
          <div className="h-10 w-10 rounded bg-white/10 shrink-0" />
        )}
        <div className="min-w-0 flex-1">
          <p className="text-sm text-white/80 truncate">{meal.recipe.title}</p>
          {meal.isGenerated && (
            <span className="mt-0.5 inline-block rounded bg-accent/20 px-1.5 py-0.5 text-[10px] font-medium text-accent">
              Generated
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
