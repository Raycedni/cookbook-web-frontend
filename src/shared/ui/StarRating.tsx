import { useState } from 'react'
import { Star } from 'lucide-react'
import { cn } from '@/shared/lib/cn'

interface StarRatingProps {
  rating: number
  maxStars?: number
  size?: 'sm' | 'md' | 'lg'
  interactive?: boolean
  onChange?: (score: number) => void
  className?: string
}

const sizeClasses = {
  sm: 'h-3.5 w-3.5',
  md: 'h-5 w-5',
  lg: 'h-6 w-6',
} as const

export function StarRating({
  rating,
  maxStars = 5,
  size = 'md',
  interactive = false,
  onChange,
  className,
}: StarRatingProps) {
  const [hoverScore, setHoverScore] = useState(0)

  const displayRating = interactive && hoverScore > 0 ? hoverScore : rating
  const starSize = sizeClasses[size]

  return (
    <div
      className={cn('inline-flex items-center gap-0.5', className)}
      onMouseLeave={interactive ? () => setHoverScore(0) : undefined}
    >
      {Array.from({ length: maxStars }, (_, i) => {
        const starIndex = i + 1
        const fillPercent = Math.min(
          100,
          Math.max(0, (displayRating - i) * 100),
        )

        return (
          <button
            key={starIndex}
            type="button"
            disabled={!interactive}
            className={cn(
              'relative shrink-0 disabled:cursor-default',
              interactive && 'cursor-pointer',
            )}
            onClick={
              interactive
                ? () => onChange?.(starIndex)
                : undefined
            }
            onMouseEnter={
              interactive ? () => setHoverScore(starIndex) : undefined
            }
          >
            {/* Empty star (background) */}
            <Star className={cn(starSize, 'text-white/20')} />
            {/* Filled star (foreground with clip) */}
            {fillPercent > 0 && (
              <div
                className="absolute inset-0 overflow-hidden"
                style={{ width: `${fillPercent}%` }}
              >
                <Star
                  className={cn(starSize, 'text-accent fill-accent')}
                />
              </div>
            )}
          </button>
        )
      })}
    </div>
  )
}
