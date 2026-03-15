import { useCallback, useEffect, useState } from 'react'
import { Link } from '@tanstack/react-router'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, ShoppingCart } from 'lucide-react'
import { GlassPanel } from '@/shared/ui/GlassPanel'
import { Skeleton } from '@/shared/ui/Skeleton'
import { EmptyState } from '@/shared/ui/EmptyState'
import { useDelayedLoading } from '@/shared/ui/useDelayedLoading'
import { mealPlanQueries } from '@/features/meals/api/meal-plan-queries'
import { toggleShoppingItem } from '@/features/meals/api/meal-plan-api'
import { ShoppingCategory } from './ShoppingCategory'
import type { ShoppingList } from '@/features/meals/api/types'

const currencyFormatter = new Intl.NumberFormat('de-DE', {
  style: 'currency',
  currency: 'EUR',
})

function getLocalCheckedState(planId: string): Record<string, boolean> {
  try {
    const raw = localStorage.getItem(`shopping-checked-${planId}`)
    return raw ? (JSON.parse(raw) as Record<string, boolean>) : {}
  } catch {
    return {}
  }
}

function saveLocalCheckedState(
  planId: string,
  state: Record<string, boolean>,
) {
  localStorage.setItem(`shopping-checked-${planId}`, JSON.stringify(state))
}

function useShoppingCheckOff(planId: string) {
  const queryClient = useQueryClient()
  const [localChecked, setLocalChecked] = useState<Record<string, boolean>>(
    () => getLocalCheckedState(planId),
  )

  useEffect(() => {
    setLocalChecked(getLocalCheckedState(planId))
  }, [planId])

  const mutation = useMutation({
    mutationFn: ({
      itemId,
      checked,
    }: {
      itemId: string
      checked: boolean
    }) => toggleShoppingItem(planId, itemId, checked),
    onMutate: async ({ itemId, checked }) => {
      await queryClient.cancelQueries(mealPlanQueries.shoppingList(planId))

      const previous = queryClient.getQueryData(
        mealPlanQueries.shoppingList(planId).queryKey,
      )

      queryClient.setQueryData(
        mealPlanQueries.shoppingList(planId).queryKey,
        (old: ShoppingList | undefined) => {
          if (!old) return old
          return {
            ...old,
            categories: old.categories.map((cat) => ({
              ...cat,
              items: cat.items.map((item) =>
                item.id === itemId ? { ...item, checked } : item,
              ),
            })),
          }
        },
      )

      return { previous }
    },
    onError: (_err, { itemId, checked }, context) => {
      // Restore optimistic update
      if (context?.previous) {
        queryClient.setQueryData(
          mealPlanQueries.shoppingList(planId).queryKey,
          context.previous,
        )
      }
      // Fallback to localStorage
      setLocalChecked((prev) => {
        const next = { ...prev, [itemId]: checked }
        saveLocalCheckedState(planId, next)
        return next
      })
      // Apply localStorage state to query cache
      queryClient.setQueryData(
        mealPlanQueries.shoppingList(planId).queryKey,
        (old: ShoppingList | undefined) => {
          if (!old) return old
          return {
            ...old,
            categories: old.categories.map((cat) => ({
              ...cat,
              items: cat.items.map((item) =>
                item.id === itemId ? { ...item, checked } : item,
              ),
            })),
          }
        },
      )
    },
    onSettled: () => {
      queryClient.invalidateQueries(mealPlanQueries.shoppingList(planId))
    },
  })

  const toggle = useCallback(
    (itemId: string, checked: boolean) => {
      mutation.mutate({ itemId, checked })
    },
    [mutation],
  )

  const mergeLocalState = useCallback(
    (list: ShoppingList): ShoppingList => {
      if (Object.keys(localChecked).length === 0) return list
      return {
        ...list,
        categories: list.categories.map((cat) => ({
          ...cat,
          items: cat.items.map((item) =>
            localChecked[item.id] !== undefined
              ? { ...item, checked: localChecked[item.id] }
              : item,
          ),
        })),
      }
    },
    [localChecked],
  )

  return { toggle, mergeLocalState }
}

interface ShoppingListPageProps {
  planId: string
}

export function ShoppingListPage({ planId }: ShoppingListPageProps) {
  const { data, isLoading } = useQuery(mealPlanQueries.shoppingList(planId))
  const showSkeleton = useDelayedLoading(isLoading)
  const { toggle, mergeLocalState } = useShoppingCheckOff(planId)

  const shoppingList = data ? mergeLocalState(data) : undefined

  if (showSkeleton) {
    return (
      <div className="space-y-4">
        <BackLink planId={planId} />
        <h1 className="text-xl font-semibold text-white">Shopping List</h1>
        {Array.from({ length: 3 }).map((_, i) => (
          <GlassPanel key={i} className="space-y-3 p-4">
            <Skeleton width="30%" />
            <Skeleton lines={4} />
          </GlassPanel>
        ))}
      </div>
    )
  }

  if (
    !shoppingList ||
    shoppingList.categories.length === 0 ||
    shoppingList.categories.every((c) => c.items.length === 0)
  ) {
    return (
      <div className="space-y-4">
        <BackLink planId={planId} />
        <EmptyState
          icon={ShoppingCart}
          title="No items in shopping list"
          description="Add recipes to your meal plan first."
        />
      </div>
    )
  }

  const allItems = shoppingList.categories.flatMap((c) => c.items)
  const totalCost = shoppingList.totalEstimatedCost
  const remainingCost = allItems
    .filter((i) => !i.checked)
    .reduce((sum, i) => sum + i.estimatedCost, 0)

  return (
    <div className="space-y-4">
      <BackLink planId={planId} />

      <h1 className="text-xl font-semibold text-white">Shopping List</h1>

      <div className="space-y-3">
        {shoppingList.categories.map((category) => (
          <ShoppingCategory
            key={category.name}
            category={category}
            onToggleItem={toggle}
          />
        ))}
      </div>

      <GlassPanel className="sticky bottom-4 flex items-center justify-between px-4 py-3">
        <div className="text-sm text-white/60">
          Total: {currencyFormatter.format(totalCost)}
        </div>
        <div className="text-sm font-medium text-white">
          Remaining: {currencyFormatter.format(remainingCost)}
        </div>
      </GlassPanel>
    </div>
  )
}

function BackLink({ planId }: { planId: string }) {
  return (
    <Link
      to="/meal-plans/$planId"
      params={{ planId }}
      className="inline-flex items-center gap-2 text-white/60 transition-colors hover:text-white"
    >
      <ArrowLeft className="h-4 w-4" />
      Back to Plan
    </Link>
  )
}
