import type { ReactNode, ElementType, ComponentPropsWithoutRef } from 'react'
import { cn } from '@/shared/lib/cn'

interface GlassPanelProps extends Omit<ComponentPropsWithoutRef<'div'>, 'children'> {
  children: ReactNode
  intensity?: 'light' | 'medium' | 'heavy'
  className?: string
  as?: ElementType
}

const intensityClasses = {
  light: 'backdrop-blur-sm bg-white/[0.03] border-white/[0.06]',
  medium: 'backdrop-blur-md bg-white/[0.05] border-white/[0.10]',
  heavy: 'backdrop-blur-lg bg-white/[0.08] border-white/[0.15]',
} as const

export function GlassPanel({
  children,
  intensity = 'medium',
  className,
  as: Component = 'div',
  ...rest
}: GlassPanelProps) {
  return (
    <Component
      className={cn(
        'rounded-2xl border shadow-lg shadow-black/40',
        intensityClasses[intensity],
        className,
      )}
      {...rest}
    >
      {children}
    </Component>
  )
}
