import { createFileRoute } from '@tanstack/react-router'
import { CriteriaSection } from '@/features/admin/ui/CriteriaSection'

export const Route = createFileRoute('/_authenticated/admin/rating-criteria')({
  component: AdminRatingCriteria,
})

function AdminRatingCriteria() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Rating Criteria</h1>
      <CriteriaSection />
    </div>
  )
}
