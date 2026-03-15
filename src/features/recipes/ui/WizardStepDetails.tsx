import { useQuery } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'
import { GlassPanel } from '@/shared/ui/GlassPanel'
import { TagTree } from './TagTree'
import { TagChips } from './TagChips'
import { CookingStepList } from './CookingStepList'
import { recipeQueries } from '@/features/recipes/api/recipe-queries'
import { buildTagTree } from '@/features/recipes/api/types'
import type { StepFormRow, WizardState } from '@/features/recipes/api/types'

interface WizardStepDetailsProps {
  form: WizardState
  updateForm: (partial: Partial<WizardState>) => void
  onBack: () => void
  onSave: () => void
  isSaving: boolean
}

export function WizardStepDetails({
  form,
  updateForm,
  onBack,
  onSave,
  isSaving,
}: WizardStepDetailsProps) {
  const { data: assignableTags, isLoading: tagsLoading } = useQuery(
    recipeQueries.assignableTags(),
  )

  const tagTree = assignableTags ? buildTagTree(assignableTags) : []

  const selectedTagObjects = (assignableTags ?? []).filter((t) =>
    form.tagIds.includes(t.id),
  )

  function handleStepUpdate(localId: string, partial: Partial<StepFormRow>) {
    updateForm({
      steps: form.steps.map((s) =>
        s.localId === localId ? { ...s, ...partial } : s,
      ),
    })
  }

  function handleStepRemove(localId: string) {
    updateForm({
      steps: form.steps.filter((s) => s.localId !== localId),
    })
  }

  function handleStepAdd() {
    updateForm({
      steps: [
        ...form.steps,
        {
          localId: crypto.randomUUID(),
          text: '',
          images: [],
          existingImageUrls: [],
        },
      ],
    })
  }

  function handleStepReorder(steps: StepFormRow[]) {
    updateForm({ steps })
  }

  function handleTagToggle(tagId: number) {
    const newTagIds = form.tagIds.includes(tagId)
      ? form.tagIds.filter((id) => id !== tagId)
      : [...form.tagIds, tagId]
    updateForm({ tagIds: newTagIds })
  }

  function handleTagRemove(tagId: number) {
    updateForm({ tagIds: form.tagIds.filter((id) => id !== tagId) })
  }

  return (
    <div className="space-y-6">
      {/* Cooking Steps */}
      <GlassPanel className="p-6 space-y-3">
        <h3 className="text-sm font-medium text-white/80">Cooking Steps</h3>
        <CookingStepList
          steps={form.steps}
          onUpdate={handleStepUpdate}
          onRemove={handleStepRemove}
          onReorder={handleStepReorder}
          onAdd={handleStepAdd}
        />
      </GlassPanel>

      {/* Tags */}
      <GlassPanel className="p-6 space-y-4">
        <h3 className="text-sm font-medium text-white/80">Tags</h3>
        <TagChips tags={selectedTagObjects} onRemove={handleTagRemove} />
        <TagTree
          tags={tagTree}
          selectedIds={form.tagIds}
          onToggle={handleTagToggle}
          isLoading={tagsLoading}
        />
      </GlassPanel>

      {/* Buttons */}
      <div className="flex justify-between">
        <button
          type="button"
          onClick={onBack}
          className="rounded-lg border border-white/10 px-6 py-2 font-medium text-white/80 transition-colors hover:bg-white/5"
        >
          Back
        </button>
        <button
          type="button"
          onClick={onSave}
          disabled={isSaving}
          className="flex items-center gap-2 rounded-lg bg-accent px-6 py-2 font-medium text-white transition-colors hover:bg-accent/80 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
          {isSaving ? 'Saving...' : 'Save Recipe'}
        </button>
      </div>
    </div>
  )
}
