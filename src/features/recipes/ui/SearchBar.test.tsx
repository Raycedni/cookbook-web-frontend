import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { fireEvent, act } from '@testing-library/react'
import { renderWithProviders, screen } from '@/test/utils'
import { SearchBar } from './SearchBar'

describe('SearchBar', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders input with placeholder "Search recipes..."', async () => {
    await renderWithProviders(<SearchBar value="" onChange={() => {}} />)

    expect(
      screen.getByPlaceholderText('Search recipes...'),
    ).toBeInTheDocument()
  })

  it('calls onChange after debounce delay', async () => {
    const onChange = vi.fn()
    await renderWithProviders(<SearchBar value="" onChange={onChange} />)

    const input = screen.getByPlaceholderText('Search recipes...')

    await act(async () => {
      fireEvent.change(input, { target: { value: 'pasta' } })
    })

    // Should not call onChange immediately
    expect(onChange).not.toHaveBeenCalled()

    // Advance timers past debounce delay
    await act(async () => {
      vi.advanceTimersByTime(300)
    })

    expect(onChange).toHaveBeenCalledWith('pasta')
  })

  it('shows clear button when input is non-empty', async () => {
    await renderWithProviders(<SearchBar value="test" onChange={() => {}} />)

    // There should be an X button to clear
    const clearButton = screen.getByRole('button')
    expect(clearButton).toBeInTheDocument()
  })
})
