import { useMemo, useState } from 'react'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import { Clock } from 'lucide-react'
import { GlassPanel } from '@/shared/ui/GlassPanel'
import { StarRating } from '@/shared/ui/StarRating'
import { CalendarCell } from './CalendarCell'
import { RecipeDragPanel } from './RecipeDragPanel'
import type { MealAssignment, MealPlan } from '@/features/meals/api/types'
import type { RecipeSummary } from '@/features/recipes/api/types'

interface WeeklyCalendarProps {
  plan: MealPlan
  onAddRecipe: (dayIndex: number, slotId: string) => void
  onRemoveMeal: (mealId: string) => void
  onAssignRecipe: (dayIndex: number, slotId: string, recipeId: string) => void
  onRegenerate?: (slotId: string) => void
  generatingSlotIds?: string[]
  showDragPanel: boolean
}

function formatDayLabel(startDate: string, dayIndex: number): string {
  const date = new Date(startDate + 'T00:00:00')
  date.setDate(date.getDate() + dayIndex)
  const weekday = date.toLocaleDateString('en-US', { weekday: 'short' })
  const month = date.getMonth() + 1
  const day = date.getDate()
  return `${weekday} ${month}/${day}`
}

function DragOverlayContent({ recipe }: { recipe: RecipeSummary }) {
  return (
    <div className="flex items-center gap-2 rounded-lg bg-white/10 backdrop-blur-md border border-white/20 p-2 shadow-lg w-[200px]">
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
        <p className="text-xs font-medium text-white/90 truncate">
          {recipe.title}
        </p>
        <div className="mt-0.5 flex items-center gap-2">
          <span className="flex items-center gap-0.5 text-[10px] text-white/50">
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

export function WeeklyCalendar({
  plan,
  onAddRecipe,
  onRemoveMeal,
  onAssignRecipe,
  onRegenerate,
  generatingSlotIds,
  showDragPanel,
}: WeeklyCalendarProps) {
  const [activeDragItem, setActiveDragItem] = useState<RecipeSummary | null>(
    null,
  )

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
  )

  const daysOfWeek = useMemo(
    () =>
      Array.from({ length: 7 }, (_, i) =>
        formatDayLabel(plan.startDate, i),
      ),
    [plan.startDate],
  )

  const sortedSlots = useMemo(
    () => [...plan.mealSlots].sort((a, b) => a.orderIndex - b.orderIndex),
    [plan.mealSlots],
  )

  const getMeal = (dayIndex: number, slotId: string): MealAssignment | null =>
    plan.meals.find(
      (m) => m.dayIndex === dayIndex && m.mealSlotId === slotId,
    ) ?? null

  const handleDragStart = (event: DragStartEvent) => {
    const recipe = event.active.data.current?.recipe as
      | RecipeSummary
      | undefined
    if (recipe) setActiveDragItem(recipe)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveDragItem(null)
    const { active, over } = event
    if (!over) return

    const recipe = active.data.current?.recipe as RecipeSummary | undefined
    const dayIndex = over.data.current?.dayIndex as number | undefined
    const slotId = over.data.current?.slotId as string | undefined

    if (recipe && dayIndex !== undefined && slotId) {
      onAssignRecipe(dayIndex, slotId, recipe.id)
    }
  }

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4">
        <div className="flex-1 min-w-0">
          {/* Desktop: 7-column grid */}
          <div className="hidden md:block">
            <div
              className="grid gap-2"
              style={{
                gridTemplateColumns: 'auto repeat(7, 1fr)',
              }}
            >
              {/* Header row: empty corner + day labels */}
              <div />
              {daysOfWeek.map((label) => (
                <div
                  key={label}
                  className="text-center text-xs font-medium text-white/50 pb-2"
                >
                  {label}
                </div>
              ))}

              {/* Slot rows */}
              {sortedSlots.map((slot) => (
                <>
                  {/* Row label */}
                  <div
                    key={`label-${slot.id}`}
                    className="flex items-center pr-3 text-sm font-medium text-white/60"
                  >
                    {slot.name}
                  </div>
                  {/* 7 cells */}
                  {Array.from({ length: 7 }, (_, dayIndex) => (
                    <CalendarCell
                      key={`${slot.id}-${dayIndex}`}
                      dayIndex={dayIndex}
                      slotId={slot.id}
                      slotName={slot.name}
                      meal={getMeal(dayIndex, slot.id)}
                      onAddClick={() => onAddRecipe(dayIndex, slot.id)}
                      onRemove={() => {
                        const meal = getMeal(dayIndex, slot.id)
                        if (meal) onRemoveMeal(meal.id)
                      }}
                      onRegenerate={
                        onRegenerate
                          ? () => onRegenerate(slot.id)
                          : undefined
                      }
                      isGenerating={generatingSlotIds?.includes(slot.id)}
                    />
                  ))}
                </>
              ))}
            </div>
          </div>

          {/* Mobile: stacked days */}
          <div className="flex flex-col gap-3 md:hidden">
            {daysOfWeek.map((label, dayIndex) => (
              <GlassPanel key={label} className="p-3">
                <h3 className="mb-2 text-sm font-semibold text-white/70">
                  {label}
                </h3>
                <div className="flex flex-col gap-2">
                  {sortedSlots.map((slot) => (
                    <CalendarCell
                      key={`${slot.id}-${dayIndex}`}
                      dayIndex={dayIndex}
                      slotId={slot.id}
                      slotName={slot.name}
                      meal={getMeal(dayIndex, slot.id)}
                      onAddClick={() => onAddRecipe(dayIndex, slot.id)}
                      onRemove={() => {
                        const meal = getMeal(dayIndex, slot.id)
                        if (meal) onRemoveMeal(meal.id)
                      }}
                    />
                  ))}
                </div>
              </GlassPanel>
            ))}
          </div>
        </div>

        {/* Drag panel (desktop only) */}
        <RecipeDragPanel isOpen={showDragPanel} />
      </div>

      {/* Drag overlay */}
      <DragOverlay dropAnimation={null}>
        {activeDragItem ? (
          <DragOverlayContent recipe={activeDragItem} />
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}
