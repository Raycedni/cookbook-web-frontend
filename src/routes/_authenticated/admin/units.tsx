import { createFileRoute } from '@tanstack/react-router'
import { UnitSection } from '@/features/admin/ui/UnitSection'

export const Route = createFileRoute('/_authenticated/admin/units')({
  component: AdminUnits,
})

function AdminUnits() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Units</h1>
      <UnitSection />
    </div>
  )
}
