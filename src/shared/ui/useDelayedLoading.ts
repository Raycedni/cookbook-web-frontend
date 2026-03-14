import { useState, useEffect, useRef } from 'react'

export function useDelayedLoading(
  isLoading: boolean,
  { delay = 250, minDisplay = 500 }: { delay?: number; minDisplay?: number } = {},
): boolean {
  const [showSkeleton, setShowSkeleton] = useState(false)
  const showTimeRef = useRef<number>(0)

  useEffect(() => {
    if (isLoading) {
      const timer = setTimeout(() => {
        setShowSkeleton(true)
        showTimeRef.current = Date.now()
      }, delay)
      return () => clearTimeout(timer)
    } else if (showSkeleton) {
      const elapsed = Date.now() - showTimeRef.current
      const remaining = Math.max(0, minDisplay - elapsed)
      const timer = setTimeout(() => setShowSkeleton(false), remaining)
      return () => clearTimeout(timer)
    }
  }, [isLoading, delay, minDisplay, showSkeleton])

  return showSkeleton
}
