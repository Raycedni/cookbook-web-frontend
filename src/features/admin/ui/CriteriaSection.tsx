import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Star } from 'lucide-react'
import { adminQueries } from '../api/admin-queries'
import {
  createRatingCriterion,
  updateRatingCriterion,
  toggleRatingCriterion,
  deleteRatingCriterion,
} from '../api/admin-api'
import type { AdminRatingCriterion } from '../api/types'
import { AdminTable, type Column } from './AdminTable'
import { ToggleSwitch } from './ToggleSwitch'

export function CriteriaSection() {
  const queryClient = useQueryClient()
  const { data: criteria = [], isLoading } = useQuery(adminQueries.ratingCriteria())

  function invalidateCaches() {
    void queryClient.invalidateQueries({ queryKey: adminQueries.ratingCriteria().queryKey })
    void queryClient.invalidateQueries({ queryKey: ['rating-criteria'] })
  }

  const toggleMutation = useMutation({
    mutationFn: (id: number) => toggleRatingCriterion(id),
    onSuccess: invalidateCaches,
  })

  const createMutation = useMutation({
    mutationFn: (data: { name: string; description: string }) =>
      createRatingCriterion(data),
    onSuccess: invalidateCaches,
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, ...data }: { id: number; name: string; description: string }) =>
      updateRatingCriterion(id, data),
    onSuccess: invalidateCaches,
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteRatingCriterion(id),
    onSuccess: invalidateCaches,
  })

  const columns: Column<AdminRatingCriterion>[] = [
    {
      key: 'name',
      header: 'Name',
      render: (item) => item.name,
    },
    {
      key: 'description',
      header: 'Description',
      render: (item) => item.description,
    },
    {
      key: 'active',
      header: 'Active',
      width: '100px',
      render: (item) => (
        <ToggleSwitch
          checked={item.active}
          onChange={() => toggleMutation.mutate(item.id)}
          disabled={toggleMutation.isPending}
        />
      ),
    },
  ]

  return (
    <AdminTable<AdminRatingCriterion>
      columns={columns}
      data={criteria}
      isLoading={isLoading}
      searchPlaceholder="Search criteria..."
      onSearch={() => {}}
      onSave={async (item) => {
        const { id, name, description } = item as { id: number; name: string; description: string }
        await updateMutation.mutateAsync({ id, name, description })
      }}
      onDelete={async (item) => {
        await deleteMutation.mutateAsync(item.id)
      }}
      onCreate={async (item) => {
        const { name, description } = item as { name: string; description: string }
        await createMutation.mutateAsync({ name, description })
      }}
      getId={(item) => item.id}
      emptyDefaults={{ name: '', description: '', active: true }}
      emptyIcon={Star}
      emptyTitle="No rating criteria yet"
    />
  )
}
