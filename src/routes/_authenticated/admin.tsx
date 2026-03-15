import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import { AdminSidebar } from '@/features/admin/ui/AdminSidebar'

export const Route = createFileRoute('/_authenticated/admin')({
  beforeLoad: ({ context }) => {
    const claims = context.auth.user?.profile as
      | { realm_access?: { roles?: string[] } }
      | undefined
    const roles = claims?.realm_access?.roles ?? []
    if (!roles.includes('ADMIN')) {
      throw redirect({ to: '/' })
    }
  },
  component: AdminLayout,
})

function AdminLayout() {
  return (
    <div className="flex">
      <AdminSidebar />
      <div className="flex-1 min-w-0 p-6">
        <Outlet />
      </div>
    </div>
  )
}
