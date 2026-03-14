import { createFileRoute } from '@tanstack/react-router'
import { GlassPanel } from '@/shared/ui/GlassPanel'
import { ChefHat } from 'lucide-react'

export const Route = createFileRoute('/')({
  component: HomePage,
})

function HomePage() {
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-120px)]">
      <GlassPanel className="max-w-lg w-full p-8 text-center">
        <ChefHat className="h-16 w-16 text-accent mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-white mb-3">
          Welcome to Cookbook
        </h1>
        <p className="text-white/60 leading-relaxed">
          Your personal recipe collection with meal planning. Browse recipes,
          plan your week, and generate shopping lists -- all in one place.
        </p>
      </GlassPanel>
    </div>
  )
}
