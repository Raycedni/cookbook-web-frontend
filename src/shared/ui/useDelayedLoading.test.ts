import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useDelayedLoading } from './useDelayedLoading'

describe('useDelayedLoading', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('does not show skeleton immediately when loading starts', () => {
    const { result } = renderHook(() => useDelayedLoading(true))
    expect(result.current).toBe(false)
  })

  it('shows skeleton after delay period', () => {
    const { result } = renderHook(() =>
      useDelayedLoading(true, { delay: 250 }),
    )

    expect(result.current).toBe(false)

    act(() => {
      vi.advanceTimersByTime(250)
    })

    expect(result.current).toBe(true)
  })

  it('never shows skeleton if loading completes before delay', () => {
    const { result, rerender } = renderHook(
      ({ isLoading }) => useDelayedLoading(isLoading, { delay: 250 }),
      { initialProps: { isLoading: true } },
    )

    // Loading finishes before delay
    act(() => {
      vi.advanceTimersByTime(100)
    })

    rerender({ isLoading: false })

    act(() => {
      vi.advanceTimersByTime(500)
    })

    expect(result.current).toBe(false)
  })

  it('keeps skeleton visible for minimum display time', () => {
    const { result, rerender } = renderHook(
      ({ isLoading }) =>
        useDelayedLoading(isLoading, { delay: 250, minDisplay: 500 }),
      { initialProps: { isLoading: true } },
    )

    // Show skeleton after delay
    act(() => {
      vi.advanceTimersByTime(250)
    })
    expect(result.current).toBe(true)

    // Loading finishes shortly after showing
    act(() => {
      vi.advanceTimersByTime(100)
    })
    rerender({ isLoading: false })

    // Skeleton should still be visible (min display not elapsed)
    expect(result.current).toBe(true)

    // After remaining minimum display time
    act(() => {
      vi.advanceTimersByTime(400)
    })

    expect(result.current).toBe(false)
  })

  it('uses default delay of 250ms and minDisplay of 500ms', () => {
    const { result, rerender } = renderHook(
      ({ isLoading }) => useDelayedLoading(isLoading),
      { initialProps: { isLoading: true } },
    )

    // Not shown before 250ms
    act(() => {
      vi.advanceTimersByTime(200)
    })
    expect(result.current).toBe(false)

    // Shown at 250ms
    act(() => {
      vi.advanceTimersByTime(50)
    })
    expect(result.current).toBe(true)

    // Stop loading
    rerender({ isLoading: false })

    // Still shown (min display 500ms not elapsed)
    act(() => {
      vi.advanceTimersByTime(400)
    })
    expect(result.current).toBe(true)

    // Hidden after remaining time
    act(() => {
      vi.advanceTimersByTime(100)
    })
    expect(result.current).toBe(false)
  })
})
