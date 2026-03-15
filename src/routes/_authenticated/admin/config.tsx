import { createFileRoute } from '@tanstack/react-router'
import { ConfigSection } from '@/features/admin/ui/ConfigSection'

export const Route = createFileRoute('/_authenticated/admin/config')({
  component: AdminConfigPage,
})

function AdminConfigPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">
        System Configuration
      </h1>
      <ConfigSection />
    </div>
  )
}
