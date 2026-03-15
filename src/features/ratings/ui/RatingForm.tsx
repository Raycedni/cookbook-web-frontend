import { useState, useEffect } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Trash2 } from 'lucide-react'
import { GlassPanel } from '@/shared/ui/GlassPanel'
import { Skeleton } from '@/shared/ui/Skeleton'
import { StarRating } from '@/shared/ui/StarRating'
import { ratingQueries } from '@/features/ratings/api/rating-queries'
import {
  submitRating,
  updateRating,
  deleteRating,
} from '@/features/ratings/api/rating-api'

interface RatingFormProps {
  recipeId: string
}

export function RatingForm({ recipeId }: RatingFormProps) {
  const queryClient = useQueryClient()
  const { data: criteria, isLoading: criteriaLoading } = useQuery(
    ratingQueries.criteria(),
  )
  const { data: userRating, isLoading: ratingLoading } = useQuery(
    ratingQueries.userRating(recipeId),
  )

  const [scores, setScores] = useState<Record<number, number>>({})

  const isEditMode = !!userRating

  // Pre-fill scores when editing
  useEffect(() => {
    if (userRating) {
      const existing: Record<number, number> = {}
      for (const s of userRating.scores) {
        existing[s.criterionId] = s.score
      }
      setScores(existing)
    }
  }, [userRating])

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: ['ratings'] })
    queryClient.invalidateQueries({ queryKey: ['rating-criteria'] })
    queryClient.invalidateQueries({ queryKey: ['recipes'] })
  }

  const submitMutation = useMutation({
    mutationFn: (data: { criterionId: number; score: number }[]) =>
      submitRating(recipeId, { scores: data }),
    onSuccess: invalidateAll,
  })

  const updateMutation = useMutation({
    mutationFn: (data: { criterionId: number; score: number }[]) =>
      updateRating(recipeId, userRating!.id, { scores: data }),
    onSuccess: invalidateAll,
  })

  const deleteMutation = useMutation({
    mutationFn: () => deleteRating(recipeId, userRating!.id),
    onSuccess: () => {
      setScores({})
      invalidateAll()
    },
  })

  if (criteriaLoading || ratingLoading) {
    return (
      <GlassPanel className="p-4 space-y-3">
        <Skeleton variant="text" width="160px" height="24px" />
        <Skeleton variant="text" lines={3} />
      </GlassPanel>
    )
  }

  if (!criteria || criteria.length === 0) return null

  const allScored = criteria.every((c) => scores[c.id] != null && scores[c.id] > 0)
  const isPending =
    submitMutation.isPending ||
    updateMutation.isPending ||
    deleteMutation.isPending

  const handleSubmit = () => {
    const scoreArray = Object.entries(scores).map(([criterionId, score]) => ({
      criterionId: Number(criterionId),
      score,
    }))

    if (isEditMode) {
      updateMutation.mutate(scoreArray)
    } else {
      submitMutation.mutate(scoreArray)
    }
  }

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete your rating?')) {
      deleteMutation.mutate()
    }
  }

  return (
    <GlassPanel className="p-4 space-y-4">
      <h3 className="text-lg font-semibold text-white">
        {isEditMode ? 'Edit your rating' : 'Rate this recipe'}
      </h3>

      <div className="space-y-3">
        {criteria.map((criterion) => (
          <div
            key={criterion.id}
            className="flex items-center justify-between py-1"
          >
            <span className="text-white/80">{criterion.name}</span>
            <StarRating
              rating={scores[criterion.id] ?? 0}
              interactive
              onChange={(score) =>
                setScores((prev) => ({ ...prev, [criterion.id]: score }))
              }
            />
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          disabled={!allScored || isPending}
          className="px-4 py-2 rounded-lg bg-accent/20 text-accent-light hover:bg-accent/30 transition-colors disabled:opacity-50"
          onClick={handleSubmit}
        >
          {isPending
            ? 'Saving...'
            : isEditMode
              ? 'Update rating'
              : 'Submit rating'}
        </button>

        {isEditMode && (
          <button
            type="button"
            disabled={isPending}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-red-400 hover:bg-red-400/10 transition-colors disabled:opacity-50"
            onClick={handleDelete}
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </button>
        )}
      </div>
    </GlassPanel>
  )
}
