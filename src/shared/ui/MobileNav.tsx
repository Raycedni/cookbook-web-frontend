import type { LucideIcon } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { Home, BookOpen, Heart, CalendarDays, User } from 'lucide-react'
import { GlassPanel } from '@/shared/ui/GlassPanel'

interface NavItem {
  to: string
  icon: LucideIcon
  label: string
  disabled?: boolean
}

const navItems: NavItem[] = [
  { to: '/', icon: Home, label: 'Home' },
  { to: '/recipes', icon: BookOpen, label: 'Recipes' },
  { to: '/favorites', icon: Heart, label: 'Favorites' },
  { to: '/', icon: CalendarDays, label: 'Meals', disabled: true },
  { to: '/profile', icon: User, label: 'Profile' },
]

export function MobileNav() {
  return (
    <GlassPanel
      as="nav"
      intensity="heavy"
      className="fixed bottom-0 left-0 right-0 z-50 md:hidden flex items-center justify-around px-2 py-2 rounded-none border-x-0 border-b-0"
    >
      {navItems.map((item) => {
        const Icon = item.icon
        if (item.disabled) {
          return (
            <span
              key={item.label}
              className="flex flex-col items-center gap-0.5 px-3 py-1 text-white/30"
            >
              <Icon className="h-5 w-5" />
              <span className="text-[10px]">{item.label}</span>
            </span>
          )
        }
        return (
          <Link
            key={item.label}
            to={item.to}
            className="flex flex-col items-center gap-0.5 px-3 py-1 text-white/60 hover:text-white transition-colors [&.active]:text-accent"
          >
            <Icon className="h-5 w-5" />
            <span className="text-[10px]">{item.label}</span>
          </Link>
        )
      })}
    </GlassPanel>
  )
}
