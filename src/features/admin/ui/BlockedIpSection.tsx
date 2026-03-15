import { useState, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ShieldBan } from 'lucide-react'
import { adminQueries } from '@/features/admin/api/admin-queries'
import { addBlockedIp, removeBlockedIp } from '@/features/admin/api/admin-api'
import type { BlockedIp } from '@/features/admin/api/types'
import { AdminTable, type Column } from './AdminTable'

const IP_REGEX = /^\d{1,3}(\.\d{1,3}){3}(\/\d{1,2})?$/

export function BlockedIpSection() {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [ipError, setIpError] = useState('')

  const { data, isLoading } = useQuery(adminQueries.blockedIps())

  const addMutation = useMutation({
    mutationFn: (data: { ipAddress: string; reason?: string }) =>
      addBlockedIp(data),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: adminQueries.blockedIps().queryKey,
      })
    },
  })

  const removeMutation = useMutation({
    mutationFn: (id: number) => removeBlockedIp(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: adminQueries.blockedIps().queryKey,
      })
    },
  })

  const handleSearch = useCallback((q: string) => {
    setSearch(q)
  }, [])

  // Client-side filter since the API returns all IPs
  const filtered = (data ?? []).filter(
    (ip) =>
      !search ||
      ip.ipAddress.includes(search) ||
      ip.reason?.toLowerCase().includes(search.toLowerCase()),
  )

  const columns: Column<BlockedIp>[] = [
    {
      key: 'ipAddress',
      header: 'IP Address',
      render: (ip) => (
        <span className="font-mono text-white/90">{ip.ipAddress}</span>
      ),
      editRender: (value, onChange) => (
        <div>
          <input
            type="text"
            value={String(value ?? '')}
            onChange={(e) => {
              onChange(e.target.value)
              setIpError('')
            }}
            placeholder="e.g. 192.168.1.1"
            className="w-full rounded bg-white/5 px-2 py-1 font-mono text-sm text-white/90 outline-none focus:ring-1 focus:ring-accent/50"
          />
          {ipError && (
            <p className="mt-1 text-xs text-red-400">{ipError}</p>
          )}
        </div>
      ),
    },
    {
      key: 'reason',
      header: 'Reason',
      render: (ip) => ip.reason || '-',
    },
    {
      key: 'createdAt',
      header: 'Blocked At',
      render: (ip) => new Date(ip.createdAt).toLocaleDateString(),
    },
  ]

  return (
    <AdminTable<BlockedIp>
      columns={columns}
      data={filtered}
      isLoading={isLoading}
      searchPlaceholder="Search IPs..."
      onSearch={handleSearch}
      onCreate={async (item) => {
        const partial = item as Partial<BlockedIp>
        const ipAddress = String(partial.ipAddress ?? '').trim()
        if (!IP_REGEX.test(ipAddress)) {
          setIpError('Invalid IP address format (e.g. 192.168.1.1 or 10.0.0.0/24)')
          throw new Error('Invalid IP format')
        }
        await addMutation.mutateAsync({
          ipAddress,
          reason: partial.reason ? String(partial.reason) : undefined,
        })
      }}
      onDelete={async (ip) => {
        await removeMutation.mutateAsync(ip.id)
      }}
      getId={(ip) => ip.id}
      emptyDefaults={{ ipAddress: '', reason: '' } as Partial<BlockedIp>}
      emptyIcon={ShieldBan}
      emptyTitle="No blocked IPs"
    />
  )
}
