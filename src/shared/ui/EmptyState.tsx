import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import { GlassPanel } from '@/shared/ui/GlassPanel'
import { cn } from '@/shared/lib/cn'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description?: string
  action?: ReactNode
  className?: string
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <GlassPanel
      className={cn(
        'flex flex-col items-center justify-center gap-4 px-8 py-12',
        className,
      )}
    >
      <Icon className="h-12 w-12 text-white/20" />
      <h3 className="text-lg font-medium text-white/80">{title}</h3>
      {description && (
        <p className="max-w-sm text-center text-sm text-white/40">
          {description}
        </p>
      )}
      {action && <div className="mt-2">{action}</div>}
    </GlassPanel>
  )
}
