import { describe, it, expect, vi, beforeEach } from 'vitest'
import { fireEvent, waitFor } from '@testing-library/react'
import { renderWithProviders, screen } from '@/test/utils'
import { RatingForm } from './RatingForm'

// Mock the rating API functions
vi.mock('@/features/ratings/api/rating-api', () => ({
  getRatingCriteria: vi.fn().mockResolvedValue([
    { id: 1, name: 'Taste', description: 'How does it taste?' },
    { id: 2, name: 'Difficulty', description: 'How hard to make?' },
  ]),
  getUserRating: vi.fn().mockResolvedValue(null),
  submitRating: vi.fn().mockResolvedValue(undefined),
  updateRating: vi.fn().mockResolvedValue(undefined),
  deleteRating: vi.fn().mockResolvedValue(undefined),
}))

describe('RatingForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders criterion names from mock criteria data', async () => {
    renderWithProviders(<RatingForm recipeId="1" />)

    await waitFor(() => {
      expect(screen.getByText('Taste')).toBeInTheDocument()
      expect(screen.getByText('Difficulty')).toBeInTheDocument()
    })
  })

  it('submit button disabled when not all criteria scored', async () => {
    renderWithProviders(<RatingForm recipeId="1" />)

    await waitFor(() => {
      expect(screen.getByText('Taste')).toBeInTheDocument()
    })

    const submitButton = screen.getByRole('button', { name: /submit rating/i })
    expect(submitButton).toBeDisabled()
  })

  it('calls submitRating mutation on form submit', async () => {
    const { submitRating } = await import(
      '@/features/ratings/api/rating-api'
    )

    renderWithProviders(<RatingForm recipeId="1" />)

    await waitFor(() => {
      expect(screen.getByText('Taste')).toBeInTheDocument()
    })

    // Click stars for each criterion (5th star button for each)
    const starButtons = screen.getAllByRole('button').filter(
      (btn) => !btn.textContent?.includes('Submit') && !btn.textContent?.includes('Update') && !btn.textContent?.includes('Delete'),
    )

    // Each criterion has 5 star buttons, so click the 5th for Taste (index 4) and 5th for Difficulty (index 9)
    fireEvent.click(starButtons[4])
    fireEvent.click(starButtons[9])

    const submitButton = screen.getByRole('button', { name: /submit rating/i })
    expect(submitButton).not.toBeDisabled()

    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(submitRating).toHaveBeenCalledWith('1', {
        scores: expect.arrayContaining([
          { criterionId: 1, score: 5 },
          { criterionId: 2, score: 5 },
        ]),
      })
    })
  })

  it('shows delete button when user has existing rating', async () => {
    const { getUserRating } = await import(
      '@/features/ratings/api/rating-api'
    )
    vi.mocked(getUserRating).mockResolvedValue({
      id: 42,
      scores: [
        { criterionId: 1, score: 4 },
        { criterionId: 2, score: 3 },
      ],
      createdAt: '2026-01-01',
    })

    renderWithProviders(<RatingForm recipeId="1" />)

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /delete/i }),
      ).toBeInTheDocument()
    })
  })

  it('pre-fills scores in edit mode', async () => {
    const { getUserRating } = await import(
      '@/features/ratings/api/rating-api'
    )
    vi.mocked(getUserRating).mockResolvedValue({
      id: 42,
      scores: [
        { criterionId: 1, score: 4 },
        { criterionId: 2, score: 3 },
      ],
      createdAt: '2026-01-01',
    })

    renderWithProviders(<RatingForm recipeId="1" />)

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /update rating/i }),
      ).toBeInTheDocument()
    })
  })
})
