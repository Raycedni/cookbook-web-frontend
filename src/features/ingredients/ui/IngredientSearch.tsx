import { useState, useEffect } from 'react'
import { Search, X } from 'lucide-react'
import { GlassPanel } from '@/shared/ui/GlassPanel'
import { useDebounce } from '@/shared/hooks/useDebounce'

interface IngredientSearchProps {
  value: string
  onChange: (v: string) => void
}

export function IngredientSearch({ value, onChange }: IngredientSearchProps) {
  const [localValue, setLocalValue] = useState(value)
  const debouncedValue = useDebounce(localValue, 300)

  useEffect(() => {
    setLocalValue(value)
  }, [value])

  useEffect(() => {
    if (debouncedValue !== value) {
      onChange(debouncedValue)
    }
  }, [debouncedValue, onChange, value])

  return (
    <GlassPanel className="flex items-center gap-3 px-4 py-3">
      <Search className="h-5 w-5 shrink-0 text-white/40" />
      <input
        type="text"
        value={localValue}
        onInput={(e) => setLocalValue((e.target as HTMLInputElement).value)}
        placeholder="Search ingredients..."
        className="min-w-0 flex-1 bg-transparent text-white placeholder-white/30 outline-none"
      />
      {localValue && (
        <button
          type="button"
          onClick={() => {
            setLocalValue('')
            onChange('')
          }}
          className="rounded-full p-1 text-white/40 transition-colors hover:bg-white/10 hover:text-white"
          aria-label="Clear search"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </GlassPanel>
  )
}
