import { createFileRoute } from '@tanstack/react-router'
import { Salad } from 'lucide-react'
import { EmptyState } from '@/shared/ui/EmptyState'

export const Route = createFileRoute('/_authenticated/admin/ingredients')({
  component: AdminIngredients,
})

function AdminIngredients() {
  return (
    <EmptyState
      icon={Salad}
      title="Ingredients"
      description="Ingredient management coming soon."
    />
  )
}
