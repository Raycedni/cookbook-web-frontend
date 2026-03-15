import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Salad } from 'lucide-react'
import { adminQueries } from '../api/admin-queries'
import {
  createIngredient,
  updateIngredient,
  deleteIngredient,
} from '../api/admin-api'
import type { Ingredient } from '@/features/ingredients/api/types'
import { AdminTable, type Column } from './AdminTable'
import { useDebounce } from '@/shared/hooks/useDebounce'

export function IngredientSection() {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search)
  const { data: ingredients = [], isLoading } = useQuery(
    adminQueries.ingredients(debouncedSearch || undefined),
  )

  function invalidateCaches() {
    void queryClient.invalidateQueries({ queryKey: ['admin', 'ingredients'] })
    void queryClient.invalidateQueries({ queryKey: ['ingredients'] })
  }

  const createMutation = useMutation({
    mutationFn: (data: { name: string; allergenIds?: number[] }) =>
      createIngredient(data),
    onSuccess: invalidateCaches,
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, ...data }: { id: number; name: string; allergenIds?: number[] }) =>
      updateIngredient(id, data),
    onSuccess: invalidateCaches,
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteIngredient(id),
    onSuccess: invalidateCaches,
  })

  function parseAllergenIds(value: unknown): number[] {
    if (typeof value === 'string') {
      if (!value.trim()) return []
      return value
        .split(',')
        .map((s) => Number(s.trim()))
        .filter((n) => !Number.isNaN(n) && n > 0)
    }
    if (Array.isArray(value)) return value as number[]
    return []
  }

  const columns: Column<Ingredient>[] = [
    {
      key: 'name',
      header: 'Name',
      render: (item) => item.name,
    },
    {
      key: 'allergenIds',
      header: 'Allergen IDs',
      render: (item) =>
        item.allergenIds.length > 0 ? item.allergenIds.join(', ') : 'None',
      editRender: (value, onChange) => (
        <input
          type="text"
          value={Array.isArray(value) ? (value as number[]).join(', ') : String(value ?? '')}
          onChange={(e) => onChange(e.target.value)}
          placeholder="e.g. 1, 3, 5"
          className="w-full rounded bg-white/5 px-2 py-1 text-sm text-white/90 outline-none focus:ring-1 focus:ring-accent/50"
        />
      ),
    },
  ]

  return (
    <AdminTable<Ingredient>
      columns={columns}
      data={ingredients}
      isLoading={isLoading}
      searchPlaceholder="Search ingredients..."
      onSearch={setSearch}
      onSave={async (item) => {
        const { id, name, allergenIds } = item as {
          id: number
          name: string
          allergenIds: unknown
        }
        await updateMutation.mutateAsync({
          id,
          name,
          allergenIds: parseAllergenIds(allergenIds),
        })
      }}
      onDelete={async (item) => {
        await deleteMutation.mutateAsync(item.id)
      }}
      onCreate={async (item) => {
        const { name, allergenIds } = item as { name: string; allergenIds: unknown }
        await createMutation.mutateAsync({
          name,
          allergenIds: parseAllergenIds(allergenIds),
        })
      }}
      getId={(item) => item.id}
      emptyDefaults={{ name: '', allergenIds: [] }}
      emptyIcon={Salad}
      emptyTitle="No ingredients yet"
    />
  )
}
