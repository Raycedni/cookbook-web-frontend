import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { Skeleton } from '@/shared/ui/Skeleton'
import { recipeQueries } from '@/features/recipes/api/recipe-queries'
import { RecipeWizard } from '@/features/recipes/ui/RecipeWizard'
import type { WizardState } from '@/features/recipes/api/types'

export const Route = createFileRoute('/_authenticated/recipes/$recipeId/edit')({
  component: EditRecipePage,
})

function EditRecipePage() {
  const { recipeId } = Route.useParams()
  const { data: recipe, isLoading } = useQuery(recipeQueries.detail(recipeId))

  if (isLoading) {
    return <EditRecipeSkeleton />
  }

  if (!recipe) {
    return <p className="text-white/60">Recipe not found.</p>
  }

  const initialData: WizardState = {
    name: recipe.title,
    description: recipe.description,
    servings: recipe.servings,
    prepTimeMinutes: recipe.prepTimeMinutes,
    cookTimeMinutes: recipe.cookTimeMinutes,
    heroImage: null,
    heroImagePreview: null,
    existingHeroImageUrl: recipe.imageUrl,
    ingredients: recipe.ingredients.map((ing) => ({
      localId: crypto.randomUUID(),
      ingredientId: ing.ingredientId,
      ingredientName: ing.ingredientName,
      amount: ing.amount,
      unitId: null, // RecipeIngredient has unit string, not unitId -- re-selection needed
    })),
    steps: recipe.steps.map((step) => ({
      localId: crypto.randomUUID(),
      text: step.instruction,
      images: [],
      existingImageUrls: [],
    })),
    tagIds: recipe.tags.map((t) => t.id),
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white">Edit Recipe</h1>
      <RecipeWizard initialData={initialData} recipeId={recipeId} mode="edit" />
    </div>
  )
}

function EditRecipeSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton variant="text" width="200px" height="36px" />
      <Skeleton variant="rectangular" height="400px" className="rounded-2xl" />
    </div>
  )
}
