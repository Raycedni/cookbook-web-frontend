import { createFileRoute } from '@tanstack/react-router'
import { LayoutDashboard } from 'lucide-react'
import { EmptyState } from '@/shared/ui/EmptyState'

export const Route = createFileRoute('/_authenticated/admin/')({
  component: AdminDashboard,
})

function AdminDashboard() {
  return (
    <EmptyState
      icon={LayoutDashboard}
      title="Admin Dashboard"
      description="Statistics and overview coming soon."
    />
  )
}
