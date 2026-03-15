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
import { CookingStepCard } from './CookingStepCard'
import type { StepFormRow } from '@/features/recipes/api/types'

interface CookingStepListProps {
  steps: StepFormRow[]
  onUpdate: (localId: string, partial: Partial<StepFormRow>) => void
  onRemove: (localId: string) => void
  onReorder: (steps: StepFormRow[]) => void
  onAdd: () => void
}

export function CookingStepList({
  steps,
  onUpdate,
  onRemove,
  onReorder,
  onAdd,
}: CookingStepListProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = steps.findIndex((s) => s.localId === active.id)
    const newIndex = steps.findIndex((s) => s.localId === over.id)
    onReorder(arrayMove(steps, oldIndex, newIndex))
  }

  return (
    <div className="space-y-3">
      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        <SortableContext
          items={steps.map((s) => s.localId)}
          strategy={verticalListSortingStrategy}
        >
          {steps.map((step, index) => (
            <CookingStepCard
              key={step.localId}
              step={step}
              index={index}
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
        Add Step
      </button>
    </div>
  )
}
