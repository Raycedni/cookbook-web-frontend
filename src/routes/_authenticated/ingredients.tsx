import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { Wheat } from 'lucide-react'
import { ingredientQueries } from '@/features/ingredients/api/ingredient-queries'
import { IngredientSearch } from '@/features/ingredients/ui/IngredientSearch'
import { IngredientCard } from '@/features/ingredients/ui/IngredientCard'
import { Skeleton } from '@/shared/ui/Skeleton'
import { EmptyState } from '@/shared/ui/EmptyState'
import { useDebounce } from '@/shared/hooks/useDebounce'

export const Route = createFileRoute('/_authenticated/ingredients')({
  component: IngredientsPage,
})

function IngredientsPage() {
  const [search, setSearch] = useState('')
  const [expandedId, setExpandedId] = useState<number | null>(null)
  const debouncedSearch = useDebounce(search, 300)

  const { data: ingredients, isLoading } = useQuery(
    ingredientQueries.list(debouncedSearch || undefined),
  )

  const { data: detail } = useQuery({
    ...ingredientQueries.detail(expandedId!),
    enabled: expandedId !== null,
  })

  function handleSelect(id: number) {
    setExpandedId((prev) => (prev === id ? null : id))
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Ingredients</h1>

      <IngredientSearch value={search} onChange={setSearch} />

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} variant="rectangular" height={60} />
          ))}
        </div>
      ) : !ingredients || ingredients.length === 0 ? (
        <EmptyState
          icon={Wheat}
          title="No ingredients found"
          description="Try a different search term"
        />
      ) : (
        <div className="space-y-3">
          {ingredients.map((ingredient) => (
            <IngredientCard
              key={ingredient.id}
              ingredient={ingredient}
              onSelect={handleSelect}
              isExpanded={expandedId === ingredient.id}
              detail={
                expandedId === ingredient.id ? detail : undefined
              }
            />
          ))}
        </div>
      )}
    </div>
  )
}
