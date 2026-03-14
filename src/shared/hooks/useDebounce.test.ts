import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useDebounce } from './useDebounce'

describe('useDebounce', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('hello', 300))
    expect(result.current).toBe('hello')
  })

  it('updates value after delay', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'hello', delay: 300 } },
    )

    rerender({ value: 'world', delay: 300 })
    expect(result.current).toBe('hello')

    act(() => {
      vi.advanceTimersByTime(300)
    })
    expect(result.current).toBe('world')
  })

  it('resets timer on rapid value changes (only final value emitted)', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 300),
      { initialProps: { value: 'a' } },
    )

    rerender({ value: 'ab' })
    act(() => {
      vi.advanceTimersByTime(100)
    })

    rerender({ value: 'abc' })
    act(() => {
      vi.advanceTimersByTime(100)
    })

    rerender({ value: 'abcd' })

    // Not yet debounced
    expect(result.current).toBe('a')

    act(() => {
      vi.advanceTimersByTime(300)
    })

    // Only the final value should be emitted
    expect(result.current).toBe('abcd')
  })

  it('cleans up timeout on unmount', () => {
    const clearTimeoutSpy = vi.spyOn(globalThis, 'clearTimeout')
    const { unmount } = renderHook(() => useDebounce('test', 300))

    unmount()
    expect(clearTimeoutSpy).toHaveBeenCalled()
    clearTimeoutSpy.mockRestore()
  })
})
