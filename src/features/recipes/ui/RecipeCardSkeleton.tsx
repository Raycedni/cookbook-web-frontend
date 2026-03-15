import { GlassCard } from '@/shared/ui/GlassCard'
import { Skeleton } from '@/shared/ui/Skeleton'

export function RecipeCardSkeleton() {
  return (
    <GlassCard className="p-0 overflow-hidden cursor-default">
      {/* Image skeleton */}
      <Skeleton variant="rectangular" className="aspect-[4/3] rounded-none" />

      {/* Content skeleton */}
      <div className="p-4 space-y-2">
        <Skeleton variant="text" width="75%" />
        <div className="flex items-center gap-3">
          <Skeleton variant="text" width="60px" />
          <Skeleton variant="text" width="80px" />
        </div>
        <div className="flex gap-1.5">
          <Skeleton variant="text" width="50px" height="20px" className="rounded-full" />
          <Skeleton variant="text" width="60px" height="20px" className="rounded-full" />
        </div>
      </div>
    </GlassCard>
  )
}
