import { cn } from '@/shared/lib/cn'
import type { ShoppingItem as ShoppingItemType } from '@/features/meals/api/types'

const currencyFormatter = new Intl.NumberFormat('de-DE', {
  style: 'currency',
  currency: 'EUR',
})

interface ShoppingItemProps {
  item: ShoppingItemType
  onToggle: (itemId: string, checked: boolean) => void
}

export function ShoppingItem({ item, onToggle }: ShoppingItemProps) {
  return (
    <label className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 transition-colors hover:bg-white/[0.03]">
      <input
        type="checkbox"
        checked={item.checked}
        onChange={() => onToggle(item.id, !item.checked)}
        className="h-4 w-4 shrink-0 accent-purple-400"
      />

      <div className="flex min-w-0 flex-1 items-center justify-between gap-2">
        <div className="min-w-0">
          <span
            className={cn(
              'block text-sm transition-opacity duration-200',
              item.checked
                ? 'text-white/40 line-through'
                : 'text-white/90',
            )}
          >
            {item.ingredientName}
          </span>
          <span className="block text-xs text-white/40">
            {item.aggregatedAmount} {item.unit}
            {item.recipeNames.length > 0 && (
              <> &middot; {item.recipeNames.join(', ')}</>
            )}
          </span>
        </div>

        <span
          className={cn(
            'shrink-0 text-xs tabular-nums transition-opacity duration-200',
            item.checked ? 'text-white/30' : 'text-white/60',
          )}
        >
          {currencyFormatter.format(item.estimatedCost)}
        </span>
      </div>
    </label>
  )
}
