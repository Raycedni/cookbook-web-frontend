import { createFileRoute } from '@tanstack/react-router'
import { Star } from 'lucide-react'
import { EmptyState } from '@/shared/ui/EmptyState'

export const Route = createFileRoute('/_authenticated/admin/rating-criteria')({
  component: AdminRatingCriteria,
})

function AdminRatingCriteria() {
  return (
    <EmptyState
      icon={Star}
      title="Rating Criteria"
      description="Rating criteria management coming soon."
    />
  )
}
