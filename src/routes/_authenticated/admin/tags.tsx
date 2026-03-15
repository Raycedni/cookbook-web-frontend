import { createFileRoute } from '@tanstack/react-router'
import { AdminTagTree } from '@/features/admin/ui/AdminTagTree'

export const Route = createFileRoute('/_authenticated/admin/tags')({
  component: AdminTags,
})

function AdminTags() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Tag Management</h1>
      <AdminTagTree />
    </div>
  )
}
