import { createFileRoute } from '@tanstack/react-router'
import { GlassPanel } from '@/shared/ui/GlassPanel'

export const Route = createFileRoute('/_authenticated/dashboard')({
  component: DashboardPage,
})

function DashboardPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Dashboard</h1>
      <GlassPanel className="p-6">
        <p className="text-white/60">
          Welcome to your dashboard. This is a protected page that requires
          authentication.
        </p>
      </GlassPanel>
    </div>
  )
}
