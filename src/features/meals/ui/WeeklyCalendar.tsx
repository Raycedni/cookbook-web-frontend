import { useMemo } from 'react'
import { GlassPanel } from '@/shared/ui/GlassPanel'
import { CalendarCell } from './CalendarCell'
import type { MealAssignment, MealPlan } from '@/features/meals/api/types'

interface WeeklyCalendarProps {
  plan: MealPlan
  onAddRecipe: (dayIndex: number, slotId: string) => void
  onRemoveMeal: (mealId: string) => void
}

function formatDayLabel(startDate: string, dayIndex: number): string {
  const date = new Date(startDate + 'T00:00:00')
  date.setDate(date.getDate() + dayIndex)
  const weekday = date.toLocaleDateString('en-US', { weekday: 'short' })
  const month = date.getMonth() + 1
  const day = date.getDate()
  return `${weekday} ${month}/${day}`
}

export function WeeklyCalendar({
  plan,
  onAddRecipe,
  onRemoveMeal,
}: WeeklyCalendarProps) {
  const daysOfWeek = useMemo(
    () => Array.from({ length: 7 }, (_, i) => formatDayLabel(plan.startDate, i)),
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

  return (
    <>
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
    </>
  )
}
