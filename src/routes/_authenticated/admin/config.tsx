import { createFileRoute } from '@tanstack/react-router'
import { Settings } from 'lucide-react'
import { EmptyState } from '@/shared/ui/EmptyState'

export const Route = createFileRoute('/_authenticated/admin/config')({
  component: AdminConfig,
})

function AdminConfig() {
  return (
    <EmptyState
      icon={Settings}
      title="System Configuration"
      description="Key-value configuration management coming soon."
    />
  )
}
