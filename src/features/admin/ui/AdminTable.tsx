import { type ReactNode, useState } from 'react'
import type { LucideIcon } from 'lucide-react'
import { Plus, Pencil, Trash2, Check, X, Search } from 'lucide-react'
import { GlassPanel } from '@/shared/ui/GlassPanel'
import { Skeleton } from '@/shared/ui/Skeleton'
import { EmptyState } from '@/shared/ui/EmptyState'
import { useDebounce } from '@/shared/hooks/useDebounce'
import { cn } from '@/shared/lib/cn'

export interface Column<T> {
  key: string
  header: string
  render: (item: T) => ReactNode
  editRender?: (
    value: unknown,
    onChange: (v: unknown) => void,
  ) => ReactNode
  width?: string
}

interface AdminTableProps<T> {
  columns: Column<T>[]
  data: T[]
  isLoading: boolean
  searchPlaceholder: string
  onSearch: (query: string) => void
  onSave: (item: Partial<T>) => Promise<void>
  onDelete: (item: T) => Promise<void>
  onCreate: (item: Partial<T>) => Promise<void>
  getId: (item: T) => string | number
  emptyDefaults: Partial<T>
  emptyIcon: LucideIcon
  emptyTitle: string
}

export function AdminTable<T>({
  columns,
  data,
  isLoading,
  searchPlaceholder,
  onSearch,
  onSave,
  onDelete,
  onCreate,
  getId,
  emptyDefaults,
  emptyIcon,
  emptyTitle,
}: AdminTableProps<T>) {
  const [editingId, setEditingId] = useState<string | number | null>(null)
  const [editValues, setEditValues] = useState<Record<string, unknown>>({})
  const [creatingNew, setCreatingNew] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const debouncedSearch = useDebounce(searchQuery)

  // Propagate debounced search to parent
  useState(() => {
    onSearch(debouncedSearch)
  })

  function handleSearchChange(value: string) {
    setSearchQuery(value)
    // We need a useEffect-like behavior, so we call onSearch directly
    // The debounced value will be used by the parent via onSearch
  }

  function handleStartEdit(item: T) {
    const values: Record<string, unknown> = {}
    for (const col of columns) {
      values[col.key] = (item as Record<string, unknown>)[col.key]
    }
    setEditingId(getId(item))
    setEditValues(values)
    setCreatingNew(false)
  }

  function handleStartCreate() {
    const values: Record<string, unknown> = {}
    for (const col of columns) {
      values[col.key] =
        (emptyDefaults as Record<string, unknown>)[col.key] ?? ''
    }
    setEditingId(null)
    setEditValues(values)
    setCreatingNew(true)
  }

  async function handleSave() {
    if (creatingNew) {
      await onCreate(editValues as Partial<T>)
    } else {
      await onSave({ ...editValues, id: editingId } as Partial<T>)
    }
    setEditingId(null)
    setCreatingNew(false)
    setEditValues({})
  }

  function handleCancel() {
    setEditingId(null)
    setCreatingNew(false)
    setEditValues({})
  }

  async function handleDelete(item: T) {
    if (window.confirm('Delete this item?')) {
      await onDelete(item)
    }
  }

  function handleEditValueChange(key: string, value: unknown) {
    setEditValues((prev) => ({ ...prev, [key]: value }))
  }

  // Skeleton loading rows
  if (isLoading) {
    return (
      <GlassPanel className="p-4">
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} height={40} variant="rectangular" />
          ))}
        </div>
      </GlassPanel>
    )
  }

  return (
    <GlassPanel className="p-4">
      {/* Search + Add bar */}
      <div className="mb-4 flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={searchQuery}
            onChange={(e) => {
              handleSearchChange(e.target.value)
              onSearch(e.target.value)
            }}
            className="w-full rounded-lg bg-white/5 py-2 pl-10 pr-4 text-sm text-white/90 placeholder:text-white/30 outline-none focus:ring-1 focus:ring-accent/50"
          />
        </div>
        <button
          type="button"
          onClick={handleStartCreate}
          className="flex items-center gap-1.5 rounded-lg bg-accent/20 px-3 py-2 text-sm text-accent-light hover:bg-accent/30 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add
        </button>
      </div>

      {/* Table */}
      {data.length === 0 && !creatingNew ? (
        <EmptyState icon={emptyIcon} title={emptyTitle} />
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-[600px] w-full">
            <thead>
              <tr className="border-b border-white/10">
                {columns.map((col) => (
                  <th
                    key={col.key}
                    className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider text-white/40"
                    style={col.width ? { width: col.width } : undefined}
                  >
                    {col.header}
                  </th>
                ))}
                <th className="w-24 px-3 py-2 text-right text-xs font-medium uppercase tracking-wider text-white/40">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {/* New row (creating) */}
              {creatingNew && (
                <tr className="border-b border-white/5 bg-accent/5">
                  {columns.map((col) => (
                    <td key={col.key} className="px-3 py-2">
                      {col.editRender ? (
                        col.editRender(editValues[col.key], (v) =>
                          handleEditValueChange(col.key, v),
                        )
                      ) : (
                        <input
                          type="text"
                          value={String(editValues[col.key] ?? '')}
                          onChange={(e) =>
                            handleEditValueChange(col.key, e.target.value)
                          }
                          className="w-full rounded bg-white/5 px-2 py-1 text-sm text-white/90 outline-none focus:ring-1 focus:ring-accent/50"
                        />
                      )}
                    </td>
                  ))}
                  <td className="px-3 py-2 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => void handleSave()}
                        className="rounded p-1 text-green-400 hover:bg-green-400/10"
                      >
                        <Check className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={handleCancel}
                        className="rounded p-1 text-red-400 hover:bg-red-400/10"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              )}

              {/* Data rows */}
              {data.map((item) => {
                const id = getId(item)
                const isEditing = editingId === id

                return (
                  <tr
                    key={id}
                    className={cn(
                      'border-b border-white/5 transition-colors',
                      isEditing ? 'bg-accent/5' : 'hover:bg-white/5',
                    )}
                  >
                    {columns.map((col) => (
                      <td key={col.key} className="px-3 py-2 text-sm text-white/70">
                        {isEditing && col.editRender ? (
                          col.editRender(editValues[col.key], (v) =>
                            handleEditValueChange(col.key, v),
                          )
                        ) : isEditing ? (
                          <input
                            type="text"
                            value={String(editValues[col.key] ?? '')}
                            onChange={(e) =>
                              handleEditValueChange(col.key, e.target.value)
                            }
                            className="w-full rounded bg-white/5 px-2 py-1 text-sm text-white/90 outline-none focus:ring-1 focus:ring-accent/50"
                          />
                        ) : (
                          col.render(item)
                        )}
                      </td>
                    ))}
                    <td className="px-3 py-2 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {isEditing ? (
                          <>
                            <button
                              type="button"
                              onClick={() => void handleSave()}
                              className="rounded p-1 text-green-400 hover:bg-green-400/10"
                            >
                              <Check className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              onClick={handleCancel}
                              className="rounded p-1 text-red-400 hover:bg-red-400/10"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              type="button"
                              onClick={() => handleStartEdit(item)}
                              className="rounded p-1 text-white/40 hover:text-white hover:bg-white/10"
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => void handleDelete(item)}
                              className="rounded p-1 text-white/40 hover:text-red-400 hover:bg-red-400/10"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </GlassPanel>
  )
}
