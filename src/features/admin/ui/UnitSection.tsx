import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Ruler } from 'lucide-react'
import { adminQueries } from '../api/admin-queries'
import { createUnit, updateUnit, deleteUnit } from '../api/admin-api'
import type { Unit } from '@/features/recipes/api/types'
import { AdminTable, type Column } from './AdminTable'

export function UnitSection() {
  const queryClient = useQueryClient()
  const { data: units = [], isLoading } = useQuery(adminQueries.units())

  function invalidateCaches() {
    void queryClient.invalidateQueries({ queryKey: adminQueries.units().queryKey })
    void queryClient.invalidateQueries({ queryKey: ['units'] })
  }

  const createMutation = useMutation({
    mutationFn: (data: { name: string; abbreviation: string; type: string }) =>
      createUnit(data),
    onSuccess: invalidateCaches,
  })

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      ...data
    }: {
      id: number
      name: string
      abbreviation: string
      type: string
    }) => updateUnit(id, data),
    onSuccess: invalidateCaches,
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteUnit(id),
    onSuccess: invalidateCaches,
  })

  const columns: Column<Unit>[] = [
    {
      key: 'name',
      header: 'Name',
      render: (item) => item.name,
    },
    {
      key: 'abbreviation',
      header: 'Abbreviation',
      render: (item) => item.abbreviation,
    },
    {
      key: 'type',
      header: 'Type',
      render: (item) => item.type,
    },
  ]

  return (
    <AdminTable<Unit>
      columns={columns}
      data={units}
      isLoading={isLoading}
      searchPlaceholder="Search units..."
      onSearch={() => {}}
      onSave={async (item) => {
        const { id, name, abbreviation, type } = item as {
          id: number
          name: string
          abbreviation: string
          type: string
        }
        await updateMutation.mutateAsync({ id, name, abbreviation, type })
      }}
      onDelete={async (item) => {
        await deleteMutation.mutateAsync(item.id)
      }}
      onCreate={async (item) => {
        const { name, abbreviation, type } = item as {
          name: string
          abbreviation: string
          type: string
        }
        await createMutation.mutateAsync({ name, abbreviation, type })
      }}
      getId={(item) => item.id}
      emptyDefaults={{ name: '', abbreviation: '', type: '' }}
      emptyIcon={Ruler}
      emptyTitle="No units yet"
    />
  )
}
