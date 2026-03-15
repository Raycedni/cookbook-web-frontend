import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { ChefHat, Clock, Timer, Users } from 'lucide-react'
import { GlassPanel } from '@/shared/ui/GlassPanel'
import { Skeleton } from '@/shared/ui/Skeleton'
import { recipeQueries } from '@/features/recipes/api/recipe-queries'
import { ServingScaler } from '@/features/recipes/ui/ServingScaler'
import { IngredientList } from '@/features/recipes/ui/IngredientList'
import { StepList } from '@/features/recipes/ui/StepList'

export const Route = createFileRoute('/recipes/share/$token')({
  component: SharedRecipePage,
})

function SharedRecipePage() {
  const { token } = Route.useParams()
  const { data: recipe, isLoading } = useQuery(recipeQueries.shared(token))
  const [targetServings, setTargetServings] = useState<number | null>(null)

  if (isLoading) {
    return <SharedRecipeSkeleton />
  }

  if (!recipe) {
    return <p className="text-white/60">Recipe not found.</p>
  }

  const servings = targetServings ?? recipe.servings

  return (
    <div className="space-y-6">
      {/* Hero image */}
      <div className="relative rounded-lg overflow-hidden aspect-[16/9]">
        {recipe.imageUrl ? (
          <img
            src={recipe.imageUrl}
            alt={recipe.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-accent/20 to-accent/5">
            <ChefHat className="h-16 w-16 text-white/20" />
          </div>
        )}
      </div>

      {/* Title and metadata */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-white">{recipe.title}</h1>
        {recipe.description && (
          <p className="text-white/60">{recipe.description}</p>
        )}
        <div className="flex items-center gap-4 text-sm text-white/60">
          <span className="flex items-center gap-1.5">
            <Timer className="h-4 w-4" />
            {recipe.prepTimeMinutes} min prep
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="h-4 w-4" />
            {recipe.cookTimeMinutes} min cook
          </span>
          <span className="flex items-center gap-1.5">
            <Users className="h-4 w-4" />
            {recipe.servings} servings
          </span>
        </div>
      </div>

      {/* Two-column layout: ingredients + steps */}
      <div className="grid md:grid-cols-[1fr_2fr] gap-6">
        {/* Left column: Serving scaler + Ingredients */}
        <div className="space-y-4">
          <ServingScaler
            originalServings={recipe.servings}
            value={servings}
            onChange={setTargetServings}
          />
          <GlassPanel className="p-4">
            <h2 className="text-lg font-semibold text-white mb-3">
              Ingredients
            </h2>
            <IngredientList
              ingredients={recipe.ingredients}
              originalServings={recipe.servings}
              targetServings={servings}
            />
          </GlassPanel>
        </div>

        {/* Right column: Steps */}
        <GlassPanel className="p-4">
          <h2 className="text-lg font-semibold text-white mb-4">
            Instructions
          </h2>
          <StepList steps={recipe.steps} />
        </GlassPanel>
      </div>
    </div>
  )
}

function SharedRecipeSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton variant="rectangular" className="aspect-[16/9] rounded-lg" />
      <div className="space-y-2">
        <Skeleton variant="text" width="60%" height="36px" />
        <Skeleton variant="text" width="40%" />
      </div>
      <div className="grid md:grid-cols-[1fr_2fr] gap-6">
        <div className="space-y-4">
          <Skeleton variant="rectangular" height="48px" className="rounded-2xl" />
          <Skeleton variant="rectangular" height="200px" className="rounded-2xl" />
        </div>
        <Skeleton variant="rectangular" height="300px" className="rounded-2xl" />
      </div>
    </div>
  )
}
