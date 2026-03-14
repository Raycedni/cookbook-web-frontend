export interface AppConfig {
  apiBaseUrl: string
  keycloakUrl: string
  keycloakRealm: string
  keycloakClientId: string
}

declare global {
  interface Window {
    __APP_CONFIG__?: AppConfig
  }
}

const defaultConfig: AppConfig = {
  apiBaseUrl: '/api/v1',
  keycloakUrl: 'http://localhost:8180',
  keycloakRealm: 'cookbook',
  keycloakClientId: 'cookbook-frontend',
}

export function getConfig(): AppConfig {
  const windowConfig = window.__APP_CONFIG__

  // If placeholders haven't been replaced (dev mode), use defaults
  if (!windowConfig || windowConfig.apiBaseUrl.startsWith('__')) {
    return defaultConfig
  }

  return windowConfig
}
