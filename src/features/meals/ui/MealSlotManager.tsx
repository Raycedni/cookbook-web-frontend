import { useState } from 'react'
import { Trash2, Check, Pencil } from 'lucide-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { GlassPanel } from '@/shared/ui/GlassPanel'
import {
  addMealSlot,
  removeMealSlot,
  updateMealSlot,
} from '@/features/meals/api/meal-plan-api'
import { mealPlanQueries } from '@/features/meals/api/meal-plan-queries'
import type { MealSlotType } from '@/features/meals/api/types'

interface MealSlotManagerProps {
  planId: string
  slots: MealSlotType[]
}

export function MealSlotManager({ planId, slots }: MealSlotManagerProps) {
  const queryClient = useQueryClient()
  const [newSlotName, setNewSlotName] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')

  const invalidateDetail = () =>
    queryClient.invalidateQueries(mealPlanQueries.detail(planId))

  const addMutation = useMutation({
    mutationFn: (name: string) => addMealSlot(planId, name),
    onSuccess: () => {
      invalidateDetail()
      setNewSlotName('')
    },
  })

  const renameMutation = useMutation({
    mutationFn: ({ slotId, name }: { slotId: string; name: string }) =>
      updateMealSlot(planId, slotId, name),
    onSuccess: () => {
      invalidateDetail()
      setEditingId(null)
    },
  })

  const removeMutation = useMutation({
    mutationFn: (slotId: string) => removeMealSlot(planId, slotId),
    onSuccess: invalidateDetail,
  })

  const startEdit = (slot: MealSlotType) => {
    setEditingId(slot.id)
    setEditName(slot.name)
  }

  const commitRename = (slotId: string) => {
    const trimmed = editName.trim()
    if (trimmed && trimmed !== slots.find((s) => s.id === slotId)?.name) {
      renameMutation.mutate({ slotId, name: trimmed })
    } else {
      setEditingId(null)
    }
  }

  const handleRemove = (slotId: string) => {
    if (window.confirm('Remove this meal slot? Meals assigned to it will be unlinked.')) {
      removeMutation.mutate(slotId)
    }
  }

  const handleAdd = () => {
    const trimmed = newSlotName.trim()
    if (trimmed) {
      addMutation.mutate(trimmed)
    }
  }

  const sortedSlots = [...slots].sort((a, b) => a.orderIndex - b.orderIndex)

  return (
    <GlassPanel className="p-4">
      <h3 className="mb-3 text-sm font-semibold text-white/70">Meal Slots</h3>

      <ul className="space-y-2 mb-3">
        {sortedSlots.map((slot) => (
          <li key={slot.id} className="flex items-center gap-2">
            {editingId === slot.id ? (
              <>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onBlur={() => commitRename(slot.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') commitRename(slot.id)
                    if (e.key === 'Escape') setEditingId(null)
                  }}
                  className="flex-1 rounded bg-white/10 px-2 py-1 text-sm text-white outline-none focus:ring-1 focus:ring-accent"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => commitRename(slot.id)}
                  className="shrink-0 text-accent hover:text-accent/80 transition-colors"
                >
                  <Check className="h-4 w-4" />
                </button>
              </>
            ) : (
              <>
                <span className="flex-1 text-sm text-white/80">
                  {slot.name}
                </span>
                <button
                  type="button"
                  onClick={() => startEdit(slot)}
                  className="shrink-0 text-white/30 hover:text-white/60 transition-colors"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleRemove(slot.id)}
                  className="shrink-0 text-white/30 hover:text-red-400 transition-colors"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </>
            )}
          </li>
        ))}
      </ul>

      <div className="flex gap-2">
        <input
          type="text"
          value={newSlotName}
          onChange={(e) => setNewSlotName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleAdd()
          }}
          placeholder="New slot name..."
          className="flex-1 rounded bg-white/10 px-2 py-1.5 text-sm text-white placeholder-white/30 outline-none focus:ring-1 focus:ring-accent"
        />
        <button
          type="button"
          onClick={handleAdd}
          disabled={!newSlotName.trim() || addMutation.isPending}
          className="rounded bg-accent/20 px-3 py-1.5 text-sm font-medium text-accent hover:bg-accent/30 disabled:opacity-40 transition-colors"
        >
          Add
        </button>
      </div>
    </GlassPanel>
  )
}
