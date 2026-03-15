import { createFileRoute } from '@tanstack/react-router'
import { ShoppingCart } from 'lucide-react'
import { EmptyState } from '@/shared/ui/EmptyState'

export const Route = createFileRoute(
  '/_authenticated/meal-plans/$planId/shopping',
)({
  component: ShoppingListPage,
})

function ShoppingListPage() {
  const { planId } = Route.useParams()

  return (
    <div className="space-y-4">
      <EmptyState
        icon={ShoppingCart}
        title={`Shopping List for ${planId}`}
        description="Your aggregated shopping list will appear here."
      />
    </div>
  )
}
