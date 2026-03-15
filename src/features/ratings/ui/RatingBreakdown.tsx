import { useQuery } from '@tanstack/react-query'
import { GlassPanel } from '@/shared/ui/GlassPanel'
import { Skeleton } from '@/shared/ui/Skeleton'
import { StarRating } from '@/shared/ui/StarRating'
import { ratingQueries } from '@/features/ratings/api/rating-queries'

interface RatingBreakdownProps {
  recipeId: string
}

export function RatingBreakdown({ recipeId }: RatingBreakdownProps) {
  const { data: summary, isLoading } = useQuery(ratingQueries.summary(recipeId))

  if (isLoading) {
    return (
      <GlassPanel className="p-4 space-y-3">
        <Skeleton variant="text" width="120px" height="24px" />
        <Skeleton variant="text" width="180px" />
        <Skeleton variant="text" lines={3} />
      </GlassPanel>
    )
  }

  if (!summary) return null

  return (
    <GlassPanel className="p-4 space-y-4">
      <div className="space-y-1">
        <h3 className="text-lg font-semibold text-white">Ratings</h3>
        <div className="flex items-center gap-2">
          <StarRating rating={summary.overallAverage} size="lg" />
          <span className="text-sm text-white/60">
            {summary.totalRatings} {summary.totalRatings === 1 ? 'rating' : 'ratings'}
          </span>
        </div>
      </div>

      {summary.totalRatings === 0 ? (
        <p className="text-white/40 text-sm">
          No ratings yet. Be the first to rate this recipe.
        </p>
      ) : (
        <div className="space-y-1">
          {summary.criteriaAverages.map((criteria) => (
            <div
              key={criteria.criterionId}
              className="flex items-center justify-between py-2"
            >
              <span className="text-white/80">{criteria.criterionName}</span>
              <span className="flex items-center gap-1.5">
                <StarRating rating={criteria.average} size="sm" />
                <span className="text-sm text-white/60">
                  {criteria.average.toFixed(1)}
                </span>
              </span>
            </div>
          ))}
        </div>
      )}
    </GlassPanel>
  )
}
