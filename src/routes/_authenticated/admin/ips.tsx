import { createFileRoute } from '@tanstack/react-router'
import { BlockedIpSection } from '@/features/admin/ui/BlockedIpSection'

export const Route = createFileRoute('/_authenticated/admin/ips')({
  component: AdminBlockedIpsPage,
})

function AdminBlockedIpsPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Blocked IPs</h1>
      <BlockedIpSection />
    </div>
  )
}
