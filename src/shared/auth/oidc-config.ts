import type { AuthProviderNoUserManagerProps } from 'react-oidc-context'
import { getConfig } from '@/shared/config/env'

export function getOidcConfig(): AuthProviderNoUserManagerProps {
  const config = getConfig()
  const realmUrl = `${config.keycloakUrl}/realms/${config.keycloakRealm}`
  return {
    authority: realmUrl,
    client_id: config.keycloakClientId,
    redirect_uri: window.location.origin,
    post_logout_redirect_uri: window.location.origin,
    scope: 'openid profile',
    automaticSilentRenew: true,
    // Override discovery endpoints so that Keycloak's internal port
    // (from its .well-known metadata) is replaced with our configured URL
    metadataSeed: {
      authorization_endpoint: `${realmUrl}/protocol/openid-connect/auth`,
      token_endpoint: `${realmUrl}/protocol/openid-connect/token`,
      end_session_endpoint: `${realmUrl}/protocol/openid-connect/logout`,
      userinfo_endpoint: `${realmUrl}/protocol/openid-connect/userinfo`,
    },
    onSigninCallback: (_user) => {
      // Remove OIDC query params from URL after login callback
      window.history.replaceState({}, document.title, window.location.pathname)
    },
  }
}
