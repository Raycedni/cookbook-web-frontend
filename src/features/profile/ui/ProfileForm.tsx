import { useState, useEffect, type FormEvent } from 'react'
import { GlassPanel } from '@/shared/ui/GlassPanel'
import type { UserProfile } from '../api/types'

interface ProfileFormProps {
  profile: UserProfile
  onSave: (data: { displayName: string }) => void
  isSaving: boolean
}

export function ProfileForm({ profile, onSave, isSaving }: ProfileFormProps) {
  const [displayName, setDisplayName] = useState(profile.displayName)
  const [showSaved, setShowSaved] = useState(false)
  const [wasSaving, setWasSaving] = useState(false)

  useEffect(() => {
    setDisplayName(profile.displayName)
  }, [profile.displayName])

  useEffect(() => {
    if (wasSaving && !isSaving) {
      setShowSaved(true)
      const timer = setTimeout(() => setShowSaved(false), 2000)
      return () => clearTimeout(timer)
    }
    setWasSaving(isSaving)
  }, [isSaving, wasSaving])

  const isDisabled =
    displayName.trim() === '' ||
    displayName === profile.displayName ||
    isSaving

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    onSave({ displayName: displayName.trim() })
  }

  return (
    <GlassPanel className="p-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block">
          <span className="text-sm font-medium text-white/70">
            Display Name
          </span>
          <input
            type="text"
            value={displayName}
            onInput={(e) =>
              setDisplayName((e.target as HTMLInputElement).value)
            }
            className="mt-1 block w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white placeholder-white/30 outline-none transition-colors focus:border-accent/50 focus:bg-white/[0.08]"
          />
        </label>
        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={isDisabled}
            className="rounded-lg bg-accent/20 px-4 py-2 text-accent-light transition-colors hover:bg-accent/30 disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : 'Save'}
          </button>
          {showSaved && (
            <span className="text-sm text-green-400 animate-pulse">
              Saved!
            </span>
          )}
        </div>
      </form>
    </GlassPanel>
  )
}
