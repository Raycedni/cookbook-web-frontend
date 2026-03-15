import {
  DndContext,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable'
import { Plus } from 'lucide-react'
import { IngredientRow } from './IngredientRow'
import type { IngredientFormRow, Unit } from '@/features/recipes/api/types'

interface IngredientRowListProps {
  ingredients: IngredientFormRow[]
  units: Unit[]
  onUpdate: (localId: string, partial: Partial<IngredientFormRow>) => void
  onRemove: (localId: string) => void
  onReorder: (ingredients: IngredientFormRow[]) => void
  onAdd: () => void
}

export function IngredientRowList({
  ingredients,
  units,
  onUpdate,
  onRemove,
  onReorder,
  onAdd,
}: IngredientRowListProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = ingredients.findIndex((i) => i.localId === active.id)
    const newIndex = ingredients.findIndex((i) => i.localId === over.id)
    onReorder(arrayMove(ingredients, oldIndex, newIndex))
  }

  return (
    <div className="space-y-2">
      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        <SortableContext
          items={ingredients.map((i) => i.localId)}
          strategy={verticalListSortingStrategy}
        >
          {ingredients.map((row) => (
            <IngredientRow
              key={row.localId}
              row={row}
              units={units}
              onUpdate={onUpdate}
              onRemove={onRemove}
            />
          ))}
        </SortableContext>
      </DndContext>

      <button
        type="button"
        onClick={onAdd}
        className="flex items-center gap-2 text-sm text-accent-light hover:text-white transition-colors"
      >
        <Plus className="h-4 w-4" />
        Add Ingredient
      </button>
    </div>
  )
}
