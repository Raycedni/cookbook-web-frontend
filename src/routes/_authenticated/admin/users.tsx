import { createFileRoute } from '@tanstack/react-router'
import { UserManagement } from '@/features/admin/ui/UserManagement'

export const Route = createFileRoute('/_authenticated/admin/users')({
  component: AdminUsersPage,
})

function AdminUsersPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">User Management</h1>
      <UserManagement />
    </div>
  )
}
