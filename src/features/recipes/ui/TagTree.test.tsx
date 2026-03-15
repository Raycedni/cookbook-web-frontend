import { describe, it, expect, vi } from 'vitest'
import { fireEvent } from '@testing-library/react'
import { renderWithProviders, screen } from '@/test/utils'
import { TagTree } from './TagTree'
import type { TagNode } from '@/features/recipes/api/types'

const mockTags: TagNode[] = [
  {
    id: 1,
    name: 'Italian',
    children: [
      { id: 3, name: 'Pasta', children: [] },
      { id: 4, name: 'Pizza', children: [] },
    ],
  },
  {
    id: 2,
    name: 'Asian',
    children: [],
  },
]

describe('TagTree', () => {
  it('renders tag names', async () => {
    await renderWithProviders(
      <TagTree tags={mockTags} selectedIds={[]} onToggle={() => {}} />,
    )

    expect(screen.getByText('Italian')).toBeInTheDocument()
    expect(screen.getByText('Asian')).toBeInTheDocument()
  })

  it('expands/collapses parent tags on chevron click', async () => {
    await renderWithProviders(
      <TagTree tags={mockTags} selectedIds={[]} onToggle={() => {}} />,
    )

    // Children should not be visible initially
    expect(screen.queryByText('Pasta')).not.toBeInTheDocument()

    // Click expand button for Italian
    const expandButton = screen.getByLabelText('Expand')
    fireEvent.click(expandButton)

    // Children should now be visible
    expect(screen.getByText('Pasta')).toBeInTheDocument()
    expect(screen.getByText('Pizza')).toBeInTheDocument()
  })

  it('calls onToggle when tag name clicked', async () => {
    const onToggle = vi.fn()
    await renderWithProviders(
      <TagTree tags={mockTags} selectedIds={[]} onToggle={onToggle} />,
    )

    fireEvent.click(screen.getByText('Asian'))
    expect(onToggle).toHaveBeenCalledWith(2)
  })

  it('highlights selected tags', async () => {
    await renderWithProviders(
      <TagTree tags={mockTags} selectedIds={[2]} onToggle={() => {}} />,
    )

    const asianButton = screen.getByText('Asian')
    expect(asianButton).toHaveClass('text-accent-light')
    expect(asianButton).toHaveClass('font-medium')
  })
})
