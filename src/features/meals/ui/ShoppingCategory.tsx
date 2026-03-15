import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { GlassPanel } from '@/shared/ui/GlassPanel'
import { cn } from '@/shared/lib/cn'
import { ShoppingItem } from './ShoppingItem'
import type { ShoppingCategory as ShoppingCategoryType } from '@/features/meals/api/types'

const currencyFormatter = new Intl.NumberFormat('de-DE', {
  style: 'currency',
  currency: 'EUR',
})

interface ShoppingCategoryProps {
  category: ShoppingCategoryType
  onToggleItem: (itemId: string, checked: boolean) => void
}

export function ShoppingCategory({
  category,
  onToggleItem,
}: ShoppingCategoryProps) {
  const [expanded, setExpanded] = useState(true)

  const checkedCount = category.items.filter((i) => i.checked).length
  const totalCount = category.items.length
  const subtotal = category.items.reduce((sum, i) => sum + i.estimatedCost, 0)

  return (
    <GlassPanel className="overflow-hidden">
      <button
        type="button"
        onClick={() => setExpanded((prev) => !prev)}
        className="flex w-full items-center justify-between px-4 py-3"
      >
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-white">{category.name}</span>
          <span className="text-xs text-white/40">
            {checkedCount}/{totalCount}
          </span>
        </div>
        <ChevronDown
          className={cn(
            'h-4 w-4 text-white/40 transition-transform duration-200',
            expanded && 'rotate-180',
          )}
        />
      </button>

      {expanded && (
        <div className="space-y-1 px-1 pb-2">
          {category.items.map((item) => (
            <ShoppingItem
              key={item.id}
              item={item}
              onToggle={onToggleItem}
            />
          ))}
          <div className="px-3 pt-1 text-right text-xs text-white/30">
            Subtotal: {currencyFormatter.format(subtotal)}
          </div>
        </div>
      )}
    </GlassPanel>
  )
}
