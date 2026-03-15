import { createFileRoute } from '@tanstack/react-router'
import { Ruler } from 'lucide-react'
import { EmptyState } from '@/shared/ui/EmptyState'

export const Route = createFileRoute('/_authenticated/admin/units')({
  component: AdminUnits,
})

function AdminUnits() {
  return (
    <EmptyState
      icon={Ruler}
      title="Units"
      description="Measurement unit management coming soon."
    />
  )
}
