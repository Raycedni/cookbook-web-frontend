import { createFileRoute } from '@tanstack/react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { profileQueries } from '@/features/profile/api/profile-queries'
import {
  updateProfile,
  updatePreferences,
} from '@/features/profile/api/profile-api'
import { ProfileForm } from '@/features/profile/ui/ProfileForm'
import { AllergenPreferences } from '@/features/profile/ui/AllergenPreferences'
import { FavoriteIngredients } from '@/features/profile/ui/FavoriteIngredients'
import { TagVisibility } from '@/features/profile/ui/TagVisibility'
import { Skeleton } from '@/shared/ui/Skeleton'

export const Route = createFileRoute('/_authenticated/profile')({
  component: ProfilePage,
})

function ProfilePage() {
  const queryClient = useQueryClient()

  const { data: profile, isLoading: profileLoading } = useQuery(
    profileQueries.profile(),
  )
  const { data: preferences, isLoading: preferencesLoading } = useQuery(
    profileQueries.preferences(),
  )
  const { data: allergens, isLoading: allergensLoading } = useQuery(
    profileQueries.allergens(),
  )

  const updateProfileMutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] })
    },
  })

  const updatePreferencesMutation = useMutation({
    mutationFn: updatePreferences,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', 'preferences'] })
    },
  })

  function handleAllergenToggle(allergenId: number) {
    if (!preferences) return
    const current = preferences.allergenIds
    const newIds = current.includes(allergenId)
      ? current.filter((id) => id !== allergenId)
      : [...current, allergenId]
    updatePreferencesMutation.mutate({ allergenIds: newIds })
  }

  function handleFavoriteAdd(ingredientId: number) {
    if (!preferences) return
    const newIds = [...preferences.favoriteIngredientIds, ingredientId]
    updatePreferencesMutation.mutate({ favoriteIngredientIds: newIds })
  }

  function handleFavoriteRemove(ingredientId: number) {
    if (!preferences) return
    const newIds = preferences.favoriteIngredientIds.filter(
      (id) => id !== ingredientId,
    )
    updatePreferencesMutation.mutate({ favoriteIngredientIds: newIds })
  }

  function handleTagToggle(tagId: number) {
    if (!preferences) return
    const current = preferences.hiddenTagIds
    const newIds = current.includes(tagId)
      ? current.filter((id) => id !== tagId)
      : [...current, tagId]
    updatePreferencesMutation.mutate({ hiddenTagIds: newIds })
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">My Profile</h1>

      {/* Profile Section */}
      <section>
        {profileLoading ? (
          <Skeleton variant="rectangular" height={120} />
        ) : profile ? (
          <ProfileForm
            profile={profile}
            onSave={(data) => updateProfileMutation.mutate(data)}
            isSaving={updateProfileMutation.isPending}
          />
        ) : null}
      </section>

      {/* Allergen Preferences */}
      <section>
        <h2 className="mb-3 text-xl font-semibold text-white">
          Allergen Preferences
        </h2>
        <AllergenPreferences
          allergens={allergens ?? []}
          selectedIds={preferences?.allergenIds ?? []}
          onToggle={handleAllergenToggle}
          isLoading={allergensLoading || preferencesLoading}
        />
      </section>

      {/* Favorite Ingredients */}
      <section>
        <h2 className="mb-3 text-xl font-semibold text-white">
          Favorite Ingredients
        </h2>
        <FavoriteIngredients
          favoriteIds={preferences?.favoriteIngredientIds ?? []}
          onAdd={handleFavoriteAdd}
          onRemove={handleFavoriteRemove}
        />
      </section>

      {/* Tag Visibility */}
      <section>
        <h2 className="mb-3 text-xl font-semibold text-white">
          Tag Visibility
        </h2>
        <TagVisibility
          hiddenTagIds={preferences?.hiddenTagIds ?? []}
          onToggle={handleTagToggle}
        />
      </section>
    </div>
  )
}
