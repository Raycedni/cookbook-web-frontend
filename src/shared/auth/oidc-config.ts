import type { AuthProviderProps } from 'react-oidc-context'
import { getConfig } from '@/shared/config/env'

export function getOidcConfig(): AuthProviderProps {
  const config = getConfig()
  return {
    authority: `${config.keycloakUrl}/realms/${config.keycloakRealm}`,
    client_id: config.keycloakClientId,
    redirect_uri: window.location.origin,
    post_logout_redirect_uri: window.location.origin,
    scope: 'openid profile',
    automaticSilentRenew: true,
    onSigninCallback: () => {
      // Remove OIDC query params from URL after login callback
      window.history.replaceState({}, document.title, window.location.pathname)
    },
  }
}
