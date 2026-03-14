import { vi } from 'vitest'
import type { AuthContextProps } from 'react-oidc-context'

export function createMockAuth(
  overrides: Partial<AuthContextProps> = {},
): AuthContextProps {
  return {
    isAuthenticated: false,
    isLoading: false,
    activeNavigator: undefined,
    signinRedirect: vi.fn(),
    signinPopup: vi.fn(),
    signinSilent: vi.fn(),
    signoutRedirect: vi.fn(),
    signoutPopup: vi.fn(),
    signoutSilent: vi.fn(),
    removeUser: vi.fn(),
    revokeTokens: vi.fn(),
    startSilentRenew: vi.fn(),
    stopSilentRenew: vi.fn(),
    querySessionStatus: vi.fn(),
    clearStaleState: vi.fn(),
    signinResourceOwnerCredentials: vi.fn(),
    events: {} as AuthContextProps['events'],
    settings: {} as AuthContextProps['settings'],
    user: null,
    error: undefined,
    ...overrides,
  }
}
