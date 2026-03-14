import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/shared/config/env', () => ({
  getConfig: vi.fn(() => ({
    apiBaseUrl: '/api/v1',
    keycloakUrl: 'http://localhost:8180',
    keycloakRealm: 'cookbook',
    keycloakClientId: 'cookbook-frontend',
  })),
}))

describe('getOidcConfig', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('returns authority built from keycloakUrl and realm', async () => {
    const { getOidcConfig } = await import('./oidc-config')
    const config = getOidcConfig()
    expect(config.authority).toBe('http://localhost:8180/realms/cookbook')
  })

  it('returns client_id from config', async () => {
    const { getOidcConfig } = await import('./oidc-config')
    const config = getOidcConfig()
    expect(config.client_id).toBe('cookbook-frontend')
  })

  it('sets redirect_uri to window.location.origin', async () => {
    const { getOidcConfig } = await import('./oidc-config')
    const config = getOidcConfig()
    expect(config.redirect_uri).toBe(window.location.origin)
  })

  it('sets post_logout_redirect_uri to window.location.origin', async () => {
    const { getOidcConfig } = await import('./oidc-config')
    const config = getOidcConfig()
    expect(config.post_logout_redirect_uri).toBe(window.location.origin)
  })

  it('has scope set to openid profile', async () => {
    const { getOidcConfig } = await import('./oidc-config')
    const config = getOidcConfig()
    expect(config.scope).toBe('openid profile')
  })

  it('has automaticSilentRenew enabled', async () => {
    const { getOidcConfig } = await import('./oidc-config')
    const config = getOidcConfig()
    expect(config.automaticSilentRenew).toBe(true)
  })

  it('provides onSigninCallback that cleans URL params', async () => {
    const replaceStateSpy = vi.spyOn(window.history, 'replaceState')
    const { getOidcConfig } = await import('./oidc-config')
    const config = getOidcConfig()

    expect(config.onSigninCallback).toBeDefined()
    config.onSigninCallback!(undefined)

    expect(replaceStateSpy).toHaveBeenCalledWith(
      {},
      document.title,
      window.location.pathname,
    )
  })
})
