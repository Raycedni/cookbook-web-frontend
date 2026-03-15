import type { UserProfile } from '../api/types'

interface ProfileFormProps {
  profile: UserProfile
  onSave: (data: { displayName: string }) => void
  isSaving: boolean
}

export function ProfileForm(_props: ProfileFormProps) {
  return <div>TODO</div>
}
