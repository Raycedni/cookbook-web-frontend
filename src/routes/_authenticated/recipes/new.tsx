import { createFileRoute } from '@tanstack/react-router'
import { RecipeWizard } from '@/features/recipes/ui/RecipeWizard'

export const Route = createFileRoute('/_authenticated/recipes/new')({
  component: CreateRecipePage,
})

function CreateRecipePage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-white">Create Recipe</h1>
      <RecipeWizard mode="create" />
    </div>
  )
}
