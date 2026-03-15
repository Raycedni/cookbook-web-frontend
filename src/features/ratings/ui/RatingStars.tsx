import { StarRating } from '@/shared/ui/StarRating'

interface RatingStarsProps {
  rating: number
  size?: 'sm' | 'md' | 'lg'
  showValue?: boolean
}

export function RatingStars({ rating, size = 'md', showValue }: RatingStarsProps) {
  return (
    <span className="inline-flex items-center">
      <StarRating rating={rating} size={size} />
      {showValue && (
        <span className="text-sm text-white/60 ml-1">{rating.toFixed(1)}</span>
      )}
    </span>
  )
}
