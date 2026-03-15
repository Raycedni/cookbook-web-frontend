import type { LucideIcon } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { GlassCard } from '@/shared/ui/GlassCard'

interface StatCardProps {
  title: string
  count: number
  icon: LucideIcon
  to: string
}

export function StatCard({ title, count, icon: Icon, to }: StatCardProps) {
  return (
    <GlassCard>
      <Link to={to} className="block">
        <Icon className="h-8 w-8 text-accent mb-3" />
        <p className="text-3xl font-bold text-white">{count}</p>
        <p className="text-sm text-white/60">{title}</p>
      </Link>
    </GlassCard>
  )
}
