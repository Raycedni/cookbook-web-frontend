import { useMemo } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, Trash2 } from 'lucide-react'
import { GlassPanel } from '@/shared/ui/GlassPanel'
import { ImageDropZone } from './ImageDropZone'
import type { StepFormRow } from '@/features/recipes/api/types'

interface CookingStepCardProps {
  step: StepFormRow
  index: number
  onUpdate: (localId: string, partial: Partial<StepFormRow>) => void
  onRemove: (localId: string) => void
}

export function CookingStepCard({
  step,
  index,
  onUpdate,
  onRemove,
}: CookingStepCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: step.localId })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const previews = useMemo(() => {
    const existing = step.existingImageUrls ?? []
    const newPreviews = step.images.map((f) => URL.createObjectURL(f))
    return [...existing, ...newPreviews]
  }, [step.existingImageUrls, step.images])

  return (
    <div ref={setNodeRef} style={style}>
      <GlassPanel className="p-4 space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-white/80">
            Step {index + 1}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="cursor-grab touch-none text-white/40 hover:text-white/70 transition-colors"
              {...attributes}
              {...listeners}
            >
              <GripVertical className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => onRemove(step.localId)}
              className="text-white/40 hover:text-red-400 transition-colors"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Text */}
        <textarea
          value={step.text}
          onChange={(e) => onUpdate(step.localId, { text: e.target.value })}
          placeholder="Describe this step..."
          rows={3}
          className="block w-full resize-none rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-white placeholder-white/30 outline-none transition-colors focus:border-accent/50 focus:bg-white/[0.08]"
        />

        {/* Step images */}
        <ImageDropZone
          multiple
          label="Drop step images here"
          previews={previews}
          onFilesSelected={(files) =>
            onUpdate(step.localId, {
              images: [...step.images, ...files],
            })
          }
        />
      </GlassPanel>
    </div>
  )
}
