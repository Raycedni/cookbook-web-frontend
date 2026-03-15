import { createFileRoute } from '@tanstack/react-router'

interface RecipeSearch {
  q?: string
  tags?: number[]
}

export const Route = createFileRoute('/_authenticated/recipes')({
  validateSearch: (search: Record<string, unknown>): RecipeSearch => ({
    q: typeof search.q === 'string' ? search.q : undefined,
    tags: Array.isArray(search.tags)
      ? search.tags.filter((t): t is number => typeof t === 'number')
      : undefined,
  }),
  component: RecipeBrowsePage,
})

function RecipeBrowsePage() {
  return (
    <div>
      <p className="text-white/60">Loading recipe browse page...</p>
    </div>
  )
}
