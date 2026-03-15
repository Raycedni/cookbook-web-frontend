import { useState, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Settings } from 'lucide-react'
import { adminQueries } from '@/features/admin/api/admin-queries'
import {
  createConfig,
  updateConfig,
  deleteConfig,
} from '@/features/admin/api/admin-api'
import type { SystemConfig } from '@/features/admin/api/types'
import { AdminTable, type Column } from './AdminTable'

export function ConfigSection() {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')

  const { data, isLoading } = useQuery(adminQueries.config())

  const createMutation = useMutation({
    mutationFn: (data: { key: string; value: string }) => createConfig(data),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: adminQueries.config().queryKey,
      })
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, value }: { id: number; value: string }) =>
      updateConfig(id, { value }),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: adminQueries.config().queryKey,
      })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteConfig(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: adminQueries.config().queryKey,
      })
    },
  })

  const handleSearch = useCallback((q: string) => {
    setSearch(q)
  }, [])

  // Client-side filter
  const filtered = (data ?? []).filter(
    (c) =>
      !search ||
      c.key.toLowerCase().includes(search.toLowerCase()) ||
      c.value.toLowerCase().includes(search.toLowerCase()),
  )

  const columns: Column<SystemConfig>[] = [
    {
      key: 'key',
      header: 'Key',
      render: (c) => (
        <span className="font-mono text-white/90">{c.key}</span>
      ),
      // Key is editable only during creation; for existing rows, render read-only
      // The editRender is used for both create and edit rows, so we render a
      // read-only display for existing rows by not providing editRender here.
      // Instead we handle it via a custom editRender that checks context.
    },
    {
      key: 'value',
      header: 'Value',
      render: (c) => c.value,
    },
  ]

  return (
    <AdminTable<SystemConfig>
      columns={columns}
      data={filtered}
      isLoading={isLoading}
      searchPlaceholder="Search config..."
      onSearch={handleSearch}
      onCreate={async (item) => {
        const partial = item as Partial<SystemConfig>
        await createMutation.mutateAsync({
          key: String(partial.key ?? '').trim(),
          value: String(partial.value ?? '').trim(),
        })
      }}
      onSave={async (item) => {
        const partial = item as Partial<SystemConfig> & { id?: number }
        if (partial.id != null) {
          await updateMutation.mutateAsync({
            id: partial.id,
            value: String(partial.value ?? '').trim(),
          })
        }
      }}
      onDelete={async (c) => {
        await deleteMutation.mutateAsync(c.id)
      }}
      getId={(c) => c.id}
      emptyDefaults={{ key: '', value: '' } as Partial<SystemConfig>}
      emptyIcon={Settings}
      emptyTitle="No configuration entries"
    />
  )
}
