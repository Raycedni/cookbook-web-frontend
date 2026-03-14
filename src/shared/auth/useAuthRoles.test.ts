import { describe, it, expect, vi } from 'vitest'
import { renderHook } from '@testing-library/react'
import type { ReactNode } from 'react'
import React from 'react'

// Mock react-oidc-context
const mockUseAuth = vi.fn()
vi.mock('react-oidc-context', () => ({
  useAuth: () => mockUseAuth(),
}))

import { useAuthRoles } from './useAuthRoles'

describe('useAuthRoles', () => {
  it('returns isAdmin true when user has ADMIN role', () => {
    mockUseAuth.mockReturnValue({
      user: {
        profile: {
          realm_access: {
            roles: ['ADMIN', 'USER'],
          },
        },
      },
    })

    const { result } = renderHook(() => useAuthRoles())

    expect(result.current.isAdmin).toBe(true)
    expect(result.current.isUser).toBe(true)
    expect(result.current.roles).toEqual(['ADMIN', 'USER'])
  })

  it('returns isAdmin false when user has only USER role', () => {
    mockUseAuth.mockReturnValue({
      user: {
        profile: {
          realm_access: {
            roles: ['USER'],
          },
        },
      },
    })

    const { result } = renderHook(() => useAuthRoles())

    expect(result.current.isAdmin).toBe(false)
    expect(result.current.isUser).toBe(true)
    expect(result.current.roles).toEqual(['USER'])
  })

  it('returns empty roles and false for isAdmin/isUser when unauthenticated', () => {
    mockUseAuth.mockReturnValue({
      user: null,
    })

    const { result } = renderHook(() => useAuthRoles())

    expect(result.current.isAdmin).toBe(false)
    expect(result.current.isUser).toBe(false)
    expect(result.current.roles).toEqual([])
  })

  it('returns empty roles when realm_access is missing', () => {
    mockUseAuth.mockReturnValue({
      user: {
        profile: {},
      },
    })

    const { result } = renderHook(() => useAuthRoles())

    expect(result.current.roles).toEqual([])
    expect(result.current.isAdmin).toBe(false)
  })

  it('hasRole returns true when role is present', () => {
    mockUseAuth.mockReturnValue({
      user: {
        profile: {
          realm_access: {
            roles: ['ADMIN', 'USER'],
          },
        },
      },
    })

    const { result } = renderHook(() => useAuthRoles())

    expect(result.current.hasRole('ADMIN')).toBe(true)
    expect(result.current.hasRole('USER')).toBe(true)
    expect(result.current.hasRole('MODERATOR')).toBe(false)
  })
})
