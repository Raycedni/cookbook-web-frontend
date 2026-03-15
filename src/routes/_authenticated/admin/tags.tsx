import { createFileRoute } from '@tanstack/react-router'
import { Tags } from 'lucide-react'
import { EmptyState } from '@/shared/ui/EmptyState'

export const Route = createFileRoute('/_authenticated/admin/tags')({
  component: AdminTags,
})

function AdminTags() {
  return (
    <EmptyState
      icon={Tags}
      title="Tags"
      description="Tag tree management coming soon."
    />
  )
}
