import { useAuth } from 'react-oidc-context'

interface KeycloakTokenClaims {
  realm_access?: {
    roles?: string[]
  }
}

export function useAuthRoles() {
  const auth = useAuth()
  const claims = auth.user?.profile as KeycloakTokenClaims | undefined
  const roles = claims?.realm_access?.roles ?? []

  return {
    roles,
    isAdmin: roles.includes('ADMIN'),
    isUser: roles.includes('USER'),
    hasRole: (role: string) => roles.includes(role),
  }
}
