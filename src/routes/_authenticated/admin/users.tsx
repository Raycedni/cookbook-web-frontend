import { createFileRoute } from '@tanstack/react-router'
import { Users } from 'lucide-react'
import { EmptyState } from '@/shared/ui/EmptyState'

export const Route = createFileRoute('/_authenticated/admin/users')({
  component: AdminUsers,
})

function AdminUsers() {
  return (
    <EmptyState
      icon={Users}
      title="User Management"
      description="User listing and role management coming soon."
    />
  )
}
