import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderWithProviders, screen, act } from '@/test/utils'
import { IngredientSearch } from './IngredientSearch'

describe('IngredientSearch', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders input with placeholder "Search ingredients..."', async () => {
    await renderWithProviders(
      <IngredientSearch value="" onChange={vi.fn()} />,
    )
    expect(
      screen.getByPlaceholderText('Search ingredients...'),
    ).toBeDefined()
  })

  it('shows clear button when input non-empty', async () => {
    await renderWithProviders(
      <IngredientSearch value="test" onChange={vi.fn()} />,
    )
    expect(screen.getByRole('button', { name: /clear/i })).toBeDefined()
  })

  it('does not show clear button when input is empty', async () => {
    await renderWithProviders(
      <IngredientSearch value="" onChange={vi.fn()} />,
    )
    expect(screen.queryByRole('button', { name: /clear/i })).toBeNull()
  })

  it('calls onChange after debounce', async () => {
    const onChange = vi.fn()
    await renderWithProviders(
      <IngredientSearch value="" onChange={onChange} />,
    )
    const input = screen.getByPlaceholderText('Search ingredients...')
    await act(async () => {
      const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
        window.HTMLInputElement.prototype,
        'value',
      )?.set
      nativeInputValueSetter?.call(input, 'tomato')
      input.dispatchEvent(new Event('input', { bubbles: true }))
    })
    // Before debounce
    expect(onChange).not.toHaveBeenCalled()
    // After debounce (300ms)
    await act(async () => {
      vi.advanceTimersByTime(300)
    })
    expect(onChange).toHaveBeenCalledWith('tomato')
  })
})
