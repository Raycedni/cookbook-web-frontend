import type { ReactElement } from 'react'
import { render, act } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
  createRouter,
  createRootRoute,
  createRoute,
  createMemoryHistory,
  RouterProvider,
} from '@tanstack/react-router'

export async function renderWithProviders(ui: ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  })

  const rootRoute = createRootRoute({
    component: () => (
      <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>
    ),
  })

  const indexRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/',
    component: () => null,
  })

  const router = createRouter({
    routeTree: rootRoute.addChildren([indexRoute]),
    history: createMemoryHistory({ initialEntries: ['/'] }),
  })

  // Wait for router to be ready
  await router.load()

  let result: ReturnType<typeof render>

  await act(async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    result = render(<RouterProvider router={router as any} />)
  })

  return result!
}

export { screen, waitFor, act, within } from '@testing-library/react'
