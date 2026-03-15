import { createFileRoute } from '@tanstack/react-router'
import { ShoppingListPage } from '@/features/meals/ui/ShoppingListPage'

export const Route = createFileRoute(
  '/_authenticated/meal-plans/$planId/shopping',
)({
  component: ShoppingListRoute,
})

function ShoppingListRoute() {
  const { planId } = Route.useParams()
  return <ShoppingListPage planId={planId} />
}
