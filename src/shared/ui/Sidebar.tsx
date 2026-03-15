import type { ReactNode } from 'react'
import { create } from 'zustand'
import { GlassPanel } from '@/shared/ui/GlassPanel'
import { cn } from '@/shared/lib/cn'
import { PanelLeftClose, PanelLeftOpen, Tags } from 'lucide-react'

interface SidebarState {
  isOpen: boolean
  content: ReactNode | null
  toggle: () => void
  open: () => void
  close: () => void
  setContent: (content: ReactNode | null) => void
}

export const useSidebarStore = create<SidebarState>((set) => ({
  isOpen: false,
  content: null,
  toggle: () => set((state) => ({ isOpen: !state.isOpen })),
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
  setContent: (content) => set({ content }),
}))

export function Sidebar() {
  const { isOpen, toggle, content } = useSidebarStore()

  return (
    <>
      {/* Toggle button - hidden on mobile */}
      <button
        onClick={toggle}
        className="hidden md:flex fixed top-[68px] left-2 z-40 items-center justify-center rounded-lg bg-white/10 p-2 text-white/60 hover:bg-white/20 hover:text-white transition-colors"
        aria-label={isOpen ? 'Close sidebar' : 'Open sidebar'}
      >
        {isOpen ? (
          <PanelLeftClose className="h-4 w-4" />
        ) : (
          <PanelLeftOpen className="h-4 w-4" />
        )}
      </button>

      {/* Sidebar panel - hidden on mobile */}
      <aside
        className={cn(
          'hidden md:block fixed top-[56px] left-0 bottom-0 z-30 transition-all duration-300 ease-in-out overflow-hidden',
          isOpen ? 'w-64' : 'w-0',
        )}
      >
        <GlassPanel
          className="h-full rounded-none border-y-0 border-l-0 p-4 pt-8 overflow-y-auto"
          intensity="medium"
        >
          <div className="flex items-center gap-2 text-white/60 mb-4">
            <Tags className="h-4 w-4" />
            <h3 className="text-sm font-semibold uppercase tracking-wider">Tags</h3>
          </div>
          {content ?? (
            <p className="text-sm text-white/40 italic">
              Tag browsing will appear here.
            </p>
          )}
        </GlassPanel>
      </aside>
    </>
  )
}
