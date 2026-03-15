import { useState } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, X, Search } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { useDebounce } from '@/shared/hooks/useDebounce'
import { ingredientQueries } from '@/features/ingredients/api/ingredient-queries'
import type { IngredientFormRow, Unit } from '@/features/recipes/api/types'

interface IngredientRowProps {
  row: IngredientFormRow
  units: Unit[]
  onUpdate: (localId: string, partial: Partial<IngredientFormRow>) => void
  onRemove: (localId: string) => void
}

export function IngredientRow({
  row,
  units,
  onUpdate,
  onRemove,
}: IngredientRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: row.localId })

  const [searchQuery, setSearchQuery] = useState('')
  const [showDropdown, setShowDropdown] = useState(false)
  const debouncedQuery = useDebounce(searchQuery, 300)

  const { data: searchResults } = useQuery({
    ...ingredientQueries.list(debouncedQuery),
    enabled: debouncedQuery.length >= 2,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const inputClass =
    'block w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-white/30 outline-none transition-colors focus:border-accent/50 focus:bg-white/[0.08]'

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-2"
    >
      <button
        type="button"
        className="shrink-0 cursor-grab touch-none text-white/40 hover:text-white/70 transition-colors"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-4 w-4" />
      </button>

      {/* Amount */}
      <input
        type="number"
        value={row.amount}
        onChange={(e) =>
          onUpdate(row.localId, { amount: e.target.value })
        }
        placeholder="Amt"
        className={`${inputClass} w-20`}
        min={0}
        step="any"
      />

      {/* Unit dropdown */}
      <select
        value={row.unitId ?? ''}
        onChange={(e) =>
          onUpdate(row.localId, {
            unitId: e.target.value ? Number(e.target.value) : null,
          })
        }
        className={`${inputClass} w-28`}
      >
        <option value="">Unit</option>
        {units.map((u) => (
          <option key={u.id} value={u.id}>
            {u.abbreviation || u.name}
          </option>
        ))}
      </select>

      {/* Ingredient search */}
      <div className="relative flex-1">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/30" />
          <input
            type="text"
            value={row.ingredientName || searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              if (row.ingredientId) {
                onUpdate(row.localId, {
                  ingredientId: null,
                  ingredientName: '',
                })
              }
              setShowDropdown(true)
            }}
            onFocus={() => {
              if (debouncedQuery.length >= 2) setShowDropdown(true)
            }}
            onBlur={() => {
              // Delay to allow click on dropdown item
              setTimeout(() => setShowDropdown(false), 200)
            }}
            placeholder="Search ingredient..."
            className={`${inputClass} pl-9`}
          />
        </div>

        {showDropdown &&
          debouncedQuery.length >= 2 &&
          searchResults &&
          searchResults.length > 0 && (
            <div className="absolute left-0 right-0 top-full z-10 mt-1 max-h-48 overflow-y-auto rounded-lg border border-white/10 bg-gray-900/95 backdrop-blur-md">
              {searchResults.map((ingredient) => (
                <button
                  key={ingredient.id}
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    onUpdate(row.localId, {
                      ingredientId: ingredient.id,
                      ingredientName: ingredient.name,
                    })
                    setSearchQuery('')
                    setShowDropdown(false)
                  }}
                  className="flex w-full items-center px-4 py-2 text-sm text-white/80 transition-colors hover:bg-white/10 text-left"
                >
                  {ingredient.name}
                </button>
              ))}
            </div>
          )}
      </div>

      {/* Remove */}
      <button
        type="button"
        onClick={() => onRemove(row.localId)}
        className="shrink-0 text-white/40 hover:text-red-400 transition-colors"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}
