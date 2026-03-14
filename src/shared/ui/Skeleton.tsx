import { cn } from '@/shared/lib/cn'

interface SkeletonProps {
  className?: string
  variant?: 'text' | 'circular' | 'rectangular'
  width?: string | number
  height?: string | number
  lines?: number
}

export function Skeleton({
  className,
  variant = 'text',
  width,
  height,
  lines = 1,
}: SkeletonProps) {
  const baseClasses =
    'animate-shimmer bg-gradient-to-r from-white/[0.06] via-white/[0.12] to-white/[0.06] bg-[length:200%_100%]'

  const variantClasses = {
    text: 'h-4 rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-lg',
  }

  if (lines > 1) {
    return (
      <div className={cn('space-y-2', className)}>
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={cn(baseClasses, variantClasses.text)}
            style={{
              width: i === lines - 1 ? '60%' : (width ?? '100%'),
              height,
            }}
          />
        ))}
      </div>
    )
  }

  return (
    <div
      className={cn(baseClasses, variantClasses[variant], className)}
      style={{ width: width ?? '100%', height }}
    />
  )
}
