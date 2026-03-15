import { useState, useEffect } from 'react'
import { useMutation } from '@tanstack/react-query'
import { Share2, Copy, Check, X } from 'lucide-react'
import { GlassPanel } from '@/shared/ui/GlassPanel'
import { shareRecipe } from '@/features/recipes/api/recipe-api'

interface ShareModalProps {
  recipeId: string
  onClose: () => void
}

export function ShareModal({ recipeId, onClose }: ShareModalProps) {
  const [shareUrl, setShareUrl] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const shareMutation = useMutation({
    mutationFn: () => shareRecipe(recipeId),
    onSuccess: (data) => {
      const url = `${window.location.origin}/recipes/share/${data.shareToken}`
      setShareUrl(url)
    },
  })

  useEffect(() => {
    shareMutation.mutate()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleCopy = async () => {
    if (!shareUrl) return
    await navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div
      data-testid="share-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <GlassPanel
        intensity="heavy"
        className="max-w-md w-full mx-4 p-6"
        onClick={(e: React.MouseEvent) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Share2 className="h-5 w-5 text-accent" />
            <h2 className="text-lg font-semibold text-white">Share Recipe</h2>
          </div>
          <button
            onClick={onClose}
            className="text-white/40 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {shareUrl ? (
          <div className="space-y-3">
            <p className="text-sm text-white/60">
              Anyone with this link can view this recipe:
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value={shareUrl}
                className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none"
              />
              <button
                onClick={handleCopy}
                aria-label="Copy"
                className="flex items-center gap-1.5 rounded-lg bg-accent/20 px-3 py-2 text-sm text-accent hover:bg-accent/30 transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    Copy
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          <p className="text-sm text-white/60">Generating share link...</p>
        )}
      </GlassPanel>
    </div>
  )
}
