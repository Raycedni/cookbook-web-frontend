import { useState, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Users } from 'lucide-react'
import { adminQueries } from '@/features/admin/api/admin-queries'
import { updateUserRole, deleteUser } from '@/features/admin/api/admin-api'
import type { AdminUser } from '@/features/admin/api/types'
import { AdminTable, type Column } from './AdminTable'

export function UserManagement() {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(0)

  const { data, isLoading } = useQuery(adminQueries.users(search, page))

  const roleMutation = useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: string }) =>
      updateUserRole(userId, role),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: adminQueries.all() })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (userId: string) => deleteUser(userId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: adminQueries.all() })
    },
  })

  const handleSearch = useCallback((q: string) => {
    setSearch(q)
    setPage(0)
  }, [])

  const columns: Column<AdminUser>[] = [
    {
      key: 'username',
      header: 'Username',
      render: (u) => <span className="text-white/90">{u.username}</span>,
    },
    {
      key: 'email',
      header: 'Email',
      render: (u) => u.email,
    },
    {
      key: 'role',
      header: 'Role',
      render: (u) => (
        <span className="inline-block rounded-full bg-accent/20 px-2 py-0.5 text-xs text-accent-light">
          {u.role}
        </span>
      ),
      editRender: (value, onChange) => (
        <select
          value={String(value ?? 'USER')}
          onChange={(e) => onChange(e.target.value)}
          className="rounded bg-white/5 px-2 py-1 text-sm text-white/90 outline-none focus:ring-1 focus:ring-accent/50"
        >
          <option value="USER">USER</option>
          <option value="ADMIN">ADMIN</option>
        </select>
      ),
    },
    {
      key: 'createdAt',
      header: 'Created',
      render: (u) => new Date(u.createdAt).toLocaleDateString(),
    },
  ]

  // Accumulate pages for "Load more" pattern
  const allUsers = data?.content ?? []

  return (
    <AdminTable<AdminUser>
      columns={columns}
      data={allUsers}
      isLoading={isLoading}
      searchPlaceholder="Search users..."
      onSearch={handleSearch}
      onSave={async (item) => {
        const partial = item as Partial<AdminUser> & { id?: string }
        if (partial.id && partial.role) {
          await roleMutation.mutateAsync({
            userId: partial.id,
            role: partial.role,
          })
        }
      }}
      onDelete={async (user) => {
        await deleteMutation.mutateAsync(user.id)
      }}
      getId={(u) => u.id}
      emptyIcon={Users}
      emptyTitle="No users found"
    >
      {data && !data.last && (
        <button
          type="button"
          onClick={() => setPage((p) => p + 1)}
          className="mt-3 w-full rounded-lg bg-white/5 py-2 text-sm text-white/60 hover:bg-white/10 transition-colors"
        >
          Load more
        </button>
      )}
    </AdminTable>
  )
}
