import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import {
  LayoutDashboard,
  Users,
  ShieldBan,
  Settings,
  Star,
  Salad,
  Tags,
  Ruler,
  Menu,
  X,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { GlassPanel } from '@/shared/ui/GlassPanel'
import { cn } from '@/shared/lib/cn'

interface AdminSection {
  to: string
  icon: LucideIcon
  label: string
  exact?: boolean
}

const adminSections: AdminSection[] = [
  { to: '/admin', icon: LayoutDashboard, label: 'Dashboard', exact: true },
  { to: '/admin/users', icon: Users, label: 'Users' },
  { to: '/admin/ips', icon: ShieldBan, label: 'Blocked IPs' },
  { to: '/admin/config', icon: Settings, label: 'Config' },
  { to: '/admin/rating-criteria', icon: Star, label: 'Rating Criteria' },
  { to: '/admin/ingredients', icon: Salad, label: 'Ingredients' },
  { to: '/admin/tags', icon: Tags, label: 'Tags' },
  { to: '/admin/units', icon: Ruler, label: 'Units' },
]

function SidebarNav() {
  return (
    <nav className="flex flex-col gap-1 p-3">
      {adminSections.map((section) => (
        <Link
          key={section.to}
          to={section.to}
          activeOptions={section.exact ? { exact: true } : undefined}
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-white/60 hover:text-white hover:bg-white/5 transition-colors [&.active]:bg-accent/20 [&.active]:text-accent"
        >
          <section.icon className="h-4 w-4" />
          {section.label}
        </Link>
      ))}
    </nav>
  )
}

export function AdminSidebar() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <>
      {/* Mobile toggle button */}
      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        className="fixed bottom-4 right-4 z-40 rounded-full bg-accent/80 p-3 text-white shadow-lg md:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <GlassPanel
            intensity="heavy"
            className={cn(
              'absolute left-0 top-0 bottom-0 w-64 rounded-none border-l-0 border-t-0 border-b-0',
            )}
          >
            <div className="flex items-center justify-between p-3 border-b border-white/10">
              <span className="text-sm font-medium text-white/80">
                Admin Menu
              </span>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="rounded p-1 text-white/40 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <SidebarNav />
          </GlassPanel>
        </div>
      )}

      {/* Desktop sidebar */}
      <GlassPanel
        intensity="light"
        className="hidden md:block w-56 shrink-0 rounded-none border-y-0 border-l-0 min-h-[calc(100vh-64px)]"
      >
        <SidebarNav />
      </GlassPanel>
    </>
  )
}
