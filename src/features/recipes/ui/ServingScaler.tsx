import { Minus, Plus } from 'lucide-react'
import { GlassPanel } from '@/shared/ui/GlassPanel'

interface ServingScalerProps {
  originalServings: number
  value: number
  onChange: (servings: number) => void
}

export function scaleAmount(
  originalAmount: number,
  originalServings: number,
  targetServings: number,
): number {
  return (
    Math.round(((originalAmount / originalServings) * targetServings) * 100) /
    100
  )
}

export function formatAmount(amount: number): string {
  return String(parseFloat(amount.toFixed(2)))
}

export function ServingScaler({
  originalServings: _originalServings,
  value,
  onChange,
}: ServingScalerProps) {
  return (
    <GlassPanel className="flex items-center gap-3 p-3">
      <span className="text-sm font-medium text-white/60">Servings</span>
      <button
        type="button"
        disabled={value <= 1}
        className="rounded-full bg-white/10 p-1.5 hover:bg-white/20 transition-colors disabled:opacity-30"
        onClick={() => onChange(value - 1)}
      >
        <Minus className="h-4 w-4 text-white" />
      </button>
      <span className="text-lg font-bold text-white min-w-[3ch] text-center">
        {value}
      </span>
      <button
        type="button"
        className="rounded-full bg-white/10 p-1.5 hover:bg-white/20 transition-colors disabled:opacity-30"
        onClick={() => onChange(value + 1)}
      >
        <Plus className="h-4 w-4 text-white" />
      </button>
    </GlassPanel>
  )
}
