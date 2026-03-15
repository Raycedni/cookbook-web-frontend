import { createFileRoute } from '@tanstack/react-router'
import { IngredientSection } from '@/features/admin/ui/IngredientSection'

export const Route = createFileRoute('/_authenticated/admin/ingredients')({
  component: AdminIngredients,
})

function AdminIngredients() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Ingredients</h1>
      <IngredientSection />
    </div>
  )
}
