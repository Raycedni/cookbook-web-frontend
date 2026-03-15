import { createFileRoute } from '@tanstack/react-router'
import { ShieldBan } from 'lucide-react'
import { EmptyState } from '@/shared/ui/EmptyState'

export const Route = createFileRoute('/_authenticated/admin/ips')({
  component: AdminBlockedIps,
})

function AdminBlockedIps() {
  return (
    <EmptyState
      icon={ShieldBan}
      title="Blocked IPs"
      description="IP blocking management coming soon."
    />
  )
}
