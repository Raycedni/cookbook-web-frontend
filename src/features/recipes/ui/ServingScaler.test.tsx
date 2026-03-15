import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent, screen } from '@testing-library/react'
import { scaleAmount, formatAmount, ServingScaler } from './ServingScaler'

describe('scaleAmount', () => {
  it('doubles amount when doubling servings', () => {
    expect(scaleAmount(2, 4, 8)).toBe(4)
  })

  it('halves amount when halving servings', () => {
    expect(scaleAmount(1, 4, 2)).toBe(0.5)
  })

  it('rounds to 2 decimal places', () => {
    expect(scaleAmount(0.33, 1, 3)).toBe(0.99)
  })

  it('handles zero amount', () => {
    expect(scaleAmount(0, 4, 8)).toBe(0)
  })
})

describe('formatAmount', () => {
  it('removes trailing zeros from whole numbers', () => {
    expect(formatAmount(1.0)).toBe('1')
  })

  it('keeps single decimal', () => {
    expect(formatAmount(0.5)).toBe('0.5')
  })

  it('keeps two decimals when needed', () => {
    expect(formatAmount(1.25)).toBe('1.25')
  })
})

describe('ServingScaler', () => {
  it('renders and increments/decrements', () => {
    const onChange = vi.fn()
    render(
      <ServingScaler originalServings={4} value={4} onChange={onChange} />,
    )

    expect(screen.getByText('4')).toBeInTheDocument()

    const buttons = screen.getAllByRole('button')
    const minusButton = buttons[0]
    const plusButton = buttons[1]

    fireEvent.click(plusButton)
    expect(onChange).toHaveBeenCalledWith(5)

    fireEvent.click(minusButton)
    expect(onChange).toHaveBeenCalledWith(3)
  })

  it('disables minus button at minimum value', () => {
    const onChange = vi.fn()
    render(
      <ServingScaler originalServings={4} value={1} onChange={onChange} />,
    )

    const buttons = screen.getAllByRole('button')
    const minusButton = buttons[0]
    expect(minusButton).toBeDisabled()
  })
})
