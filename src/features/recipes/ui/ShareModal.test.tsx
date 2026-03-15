import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ShareModal } from './ShareModal'

vi.mock('@/features/recipes/api/recipe-api', () => ({
  shareRecipe: vi.fn(),
}))

import { shareRecipe } from '@/features/recipes/api/recipe-api'

const mockShareRecipe = vi.mocked(shareRecipe)

function renderShareModal(props?: Partial<{ recipeId: string; onClose: () => void }>) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  const defaultProps = {
    recipeId: '123',
    onClose: vi.fn(),
    ...props,
  }
  return {
    ...render(
      <QueryClientProvider client={queryClient}>
        <ShareModal {...defaultProps} />
      </QueryClientProvider>,
    ),
    onClose: defaultProps.onClose,
  }
}

describe('ShareModal', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the Share Recipe title', () => {
    mockShareRecipe.mockResolvedValue({ shareToken: 'abc123' })
    renderShareModal()
    expect(screen.getByText('Share Recipe')).toBeInTheDocument()
  })

  it('calls shareRecipe API on mount and displays the URL', async () => {
    mockShareRecipe.mockResolvedValue({ shareToken: 'abc123' })
    renderShareModal()

    await waitFor(() => {
      expect(screen.getByDisplayValue(/\/recipes\/share\/abc123/)).toBeInTheDocument()
    })
    expect(mockShareRecipe).toHaveBeenCalledWith('123')
  })

  it('copies URL to clipboard on copy button click', async () => {
    mockShareRecipe.mockResolvedValue({ shareToken: 'abc123' })
    Object.assign(navigator, {
      clipboard: { writeText: vi.fn().mockResolvedValue(undefined) },
    })

    renderShareModal()

    await waitFor(() => {
      expect(screen.getByDisplayValue(/\/recipes\/share\/abc123/)).toBeInTheDocument()
    })

    const copyButton = screen.getByRole('button', { name: /copy/i })
    await act(async () => {
      fireEvent.click(copyButton)
    })

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
      expect.stringContaining('/recipes/share/abc123'),
    )
  })

  it('shows Copied! feedback after copy', async () => {
    mockShareRecipe.mockResolvedValue({ shareToken: 'abc123' })
    Object.assign(navigator, {
      clipboard: { writeText: vi.fn().mockResolvedValue(undefined) },
    })

    renderShareModal()

    await waitFor(() => {
      expect(screen.getByDisplayValue(/\/recipes\/share\/abc123/)).toBeInTheDocument()
    })

    const copyButton = screen.getByRole('button', { name: /copy/i })
    await act(async () => {
      fireEvent.click(copyButton)
    })

    expect(screen.getByText('Copied!')).toBeInTheDocument()
  })

  it('calls onClose when clicking the backdrop', async () => {
    mockShareRecipe.mockResolvedValue({ shareToken: 'abc123' })
    const { onClose } = renderShareModal()

    const backdrop = screen.getByTestId('share-modal-backdrop')
    fireEvent.click(backdrop)

    expect(onClose).toHaveBeenCalled()
  })

  it('shows loading state before share URL is ready', () => {
    mockShareRecipe.mockReturnValue(new Promise(() => {})) // never resolves
    renderShareModal()

    expect(screen.getByText(/generating/i)).toBeInTheDocument()
  })
})
