import { GlassPanel } from '@/shared/ui/GlassPanel'
import { Skeleton } from '@/shared/ui/Skeleton'
import type { Allergen } from '../api/types'

interface AllergenPreferencesProps {
  allergens: Allergen[]
  selectedIds: number[]
  onToggle: (allergenId: number) => void
  isLoading: boolean
}

export function AllergenPreferences({
  allergens,
  selectedIds,
  onToggle,
  isLoading,
}: AllergenPreferencesProps) {
  if (isLoading) {
    return (
      <GlassPanel className="p-6">
        <Skeleton lines={4} />
      </GlassPanel>
    )
  }

  return (
    <GlassPanel className="divide-y divide-white/5 p-2">
      {allergens.map((allergen) => {
        const isActive = selectedIds.includes(allergen.id)
        return (
          <div
            key={allergen.id}
            className="flex items-center justify-between px-4 py-3"
          >
            <span className="text-white/80">{allergen.name}</span>
            <button
              type="button"
              role="switch"
              aria-checked={isActive}
              onClick={() => onToggle(allergen.id)}
              className={`relative h-6 w-11 rounded-full transition-colors ${
                isActive ? 'bg-accent' : 'bg-white/20'
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
                  isActive ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        )
      })}
    </GlassPanel>
  )
}
