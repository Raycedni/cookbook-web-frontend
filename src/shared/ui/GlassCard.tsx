import type { ReactNode, ElementType } from 'react'
import { cn } from '@/shared/lib/cn'
import { GlassPanel } from './GlassPanel'

interface GlassCardProps {
  children: ReactNode
  intensity?: 'light' | 'medium' | 'heavy'
  className?: string
  as?: ElementType
}

export function GlassCard({
  children,
  intensity = 'light',
  className,
  as,
}: GlassCardProps) {
  return (
    <GlassPanel
      intensity={intensity}
      className={cn(
        'p-6 transition-colors duration-200 hover:bg-white/[0.08] cursor-pointer',
        className,
      )}
      as={as}
    >
      {children}
    </GlassPanel>
  )
}
