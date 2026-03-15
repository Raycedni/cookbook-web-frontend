import { Heart } from 'lucide-react'
import { cn } from '@/shared/lib/cn'
import { useToggleFavorite } from '@/features/favorites/api/favorite-queries'

interface FavoriteButtonProps {
  recipeId: string
  isFavorite: boolean
  className?: string
}

export function FavoriteButton({
  recipeId,
  isFavorite,
  className,
}: FavoriteButtonProps) {
  const mutation = useToggleFavorite()

  return (
    <button
      type="button"
      disabled={mutation.isPending}
      className={cn(
        'rounded-full p-1.5 transition-colors',
        isFavorite
          ? 'text-red-400'
          : 'text-white/60 hover:text-red-400',
        className,
      )}
      onClick={(e) => {
        e.stopPropagation()
        e.preventDefault()
        mutation.mutate(recipeId)
      }}
    >
      <Heart
        className={cn('h-5 w-5', isFavorite && 'fill-current')}
      />
    </button>
  )
}
