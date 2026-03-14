import { createRootRouteWithContext, Outlet } from '@tanstack/react-router'
import type { AuthContextProps } from 'react-oidc-context'
import { AppLayout } from '@/shared/ui/AppLayout'

type RouterContext = {
  auth: AuthContextProps
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: () => (
    <AppLayout>
      <Outlet />
    </AppLayout>
  ),
})
