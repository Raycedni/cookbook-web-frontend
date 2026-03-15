import { describe, it, expect } from 'vitest'
import { renderWithProviders, screen } from '@/test/utils'
import { RecipeGrid } from './RecipeGrid'
import type { RecipeSummary } from '@/features/recipes/api/types'

const mockRecipes: RecipeSummary[] = [
  {
    id: '1',
    title: 'Pasta Carbonara',
    imageUrl: 'https://example.com/pasta.jpg',
    cookTimeMinutes: 30,
    averageRating: 4.2,
    tags: [{ id: 1, name: 'Italian', parentId: null }],
    isFavorite: false,
  },
  {
    id: '2',
    title: 'Caesar Salad',
    imageUrl: null,
    cookTimeMinutes: 15,
    averageRating: 3.8,
    tags: [{ id: 2, name: 'Salad', parentId: null }],
    isFavorite: true,
  },
]

describe('RecipeGrid', () => {
  it('renders recipe cards with title, cook time, rating', async () => {
    await renderWithProviders(
      <RecipeGrid
        recipes={mockRecipes}
        isLoading={false}
        hasNextPage={false}
        isFetchingNextPage={false}
        fetchNextPage={() => {}}
        totalElements={2}
      />,
    )

    expect(screen.getByText('Pasta Carbonara')).toBeInTheDocument()
    expect(screen.getByText('Caesar Salad')).toBeInTheDocument()
    expect(screen.getByText('30 min')).toBeInTheDocument()
    expect(screen.getByText('15 min')).toBeInTheDocument()
    expect(screen.getByText('4.2')).toBeInTheDocument()
    expect(screen.getByText('3.8')).toBeInTheDocument()
  })

  it('shows skeleton loading state when isLoading=true', async () => {
    const { container } = await renderWithProviders(
      <RecipeGrid
        recipes={[]}
        isLoading={true}
        hasNextPage={false}
        isFetchingNextPage={false}
        fetchNextPage={() => {}}
        totalElements={0}
      />,
    )

    // Should render skeleton cards (6 of them)
    const skeletonCards = container.querySelectorAll('.animate-shimmer')
    expect(skeletonCards.length).toBeGreaterThan(0)
  })

  it('shows empty state when no recipes', async () => {
    await renderWithProviders(
      <RecipeGrid
        recipes={[]}
        isLoading={false}
        hasNextPage={false}
        isFetchingNextPage={false}
        fetchNextPage={() => {}}
        totalElements={0}
      />,
    )

    expect(screen.getByText('No recipes found')).toBeInTheDocument()
    expect(
      screen.getByText('Try different keywords or remove some filters'),
    ).toBeInTheDocument()
  })

  it('shows "Load more" button when hasNextPage=true', async () => {
    await renderWithProviders(
      <RecipeGrid
        recipes={mockRecipes}
        isLoading={false}
        hasNextPage={true}
        isFetchingNextPage={false}
        fetchNextPage={() => {}}
        totalElements={10}
      />,
    )

    expect(screen.getByText('Load more')).toBeInTheDocument()
  })

  it('shows count indicator "Showing X of Y recipes"', async () => {
    await renderWithProviders(
      <RecipeGrid
        recipes={mockRecipes}
        isLoading={false}
        hasNextPage={true}
        isFetchingNextPage={false}
        fetchNextPage={() => {}}
        totalElements={10}
      />,
    )

    expect(screen.getByText('Showing 2 of 10 recipes')).toBeInTheDocument()
  })
})
