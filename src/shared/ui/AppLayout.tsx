import type { ReactNode } from 'react'
import { NavBar } from '@/shared/ui/NavBar'
import { Sidebar, useSidebarStore } from '@/shared/ui/Sidebar'
import { MobileNav } from '@/shared/ui/MobileNav'
import { cn } from '@/shared/lib/cn'

interface AppLayoutProps {
  children: ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  const isOpen = useSidebarStore((s) => s.isOpen)

  return (
    <div className="min-h-screen bg-bg text-white">
      <NavBar />
      <Sidebar />
      <main
        className={cn(
          'pt-[56px] pb-16 md:pb-0 min-h-screen transition-all duration-300 ease-in-out',
          isOpen ? 'md:pl-64' : 'md:pl-0',
        )}
      >
        <div className="p-4 lg:p-6">{children}</div>
      </main>
      <MobileNav />
    </div>
  )
}
