import ky from 'ky'
import { User } from 'oidc-client-ts'
import { getConfig } from '@/shared/config/env'

function getStoredUser(): User | null {
  const config = getConfig()
  const key = `oidc.user:${config.keycloakUrl}/realms/${config.keycloakRealm}:${config.keycloakClientId}`
  const stored = sessionStorage.getItem(key)
  return stored ? User.fromStorageString(stored) : null
}

export const apiClient = ky.create({
  prefixUrl: getConfig().apiBaseUrl,
  hooks: {
    beforeRequest: [
      (request) => {
        const user = getStoredUser()
        if (user?.access_token) {
          request.headers.set('Authorization', `Bearer ${user.access_token}`)
        }
      },
    ],
  },
})
