import { createFileRoute } from '@tanstack/react-router'
import { AdminDashboard } from '@/features/admin/ui/AdminDashboard'

export const Route = createFileRoute('/_authenticated/admin/')({
  component: AdminDashboardPage,
})

function AdminDashboardPage() {
  return <AdminDashboard />
}
