import { useState, useEffect } from 'react'
import { Search, X } from 'lucide-react'
import { GlassPanel } from '@/shared/ui/GlassPanel'
import { useDebounce } from '@/shared/hooks/useDebounce'

interface SearchBarProps {
  value: string
  onChange: (v: string) => void
}

export function SearchBar({ value, onChange }: SearchBarProps) {
  const [input, setInput] = useState(value)
  const debouncedInput = useDebounce(input, 300)

  // Sync external value changes into local state
  useEffect(() => {
    setInput(value)
  }, [value])

  // Call onChange when debounced value changes
  useEffect(() => {
    if (debouncedInput !== value) {
      onChange(debouncedInput)
    }
  }, [debouncedInput, onChange, value])

  return (
    <GlassPanel className="flex items-center gap-3 px-4 py-3">
      <Search className="h-5 w-5 shrink-0 text-white/40" />
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Search recipes..."
        className="bg-transparent text-white placeholder-white/30 outline-none flex-1"
      />
      {input && (
        <button
          type="button"
          onClick={() => setInput('')}
          className="shrink-0 text-white/40 hover:text-white transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </GlassPanel>
  )
}
