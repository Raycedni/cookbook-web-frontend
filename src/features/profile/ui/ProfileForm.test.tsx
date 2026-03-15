import { describe, it, expect, vi } from 'vitest'
import { renderWithProviders, screen, act } from '@/test/utils'
import { ProfileForm } from './ProfileForm'
import type { UserProfile } from '../api/types'

const mockProfile: UserProfile = {
  id: '1',
  displayName: 'Test User',
  email: 'test@example.com',
}

describe('ProfileForm', () => {
  it('renders input with current display name', async () => {
    await renderWithProviders(
      <ProfileForm profile={mockProfile} onSave={vi.fn()} isSaving={false} />,
    )
    const input = screen.getByDisplayValue('Test User')
    expect(input).toBeDefined()
  })

  it('save button disabled when name unchanged', async () => {
    await renderWithProviders(
      <ProfileForm profile={mockProfile} onSave={vi.fn()} isSaving={false} />,
    )
    const button = screen.getByRole('button', { name: /save/i })
    expect(button).toBeDisabled()
  })

  it('save button disabled when name is empty or whitespace', async () => {
    await renderWithProviders(
      <ProfileForm profile={mockProfile} onSave={vi.fn()} isSaving={false} />,
    )
    const input = screen.getByDisplayValue('Test User')
    await act(async () => {
      // Fire native input event to simulate clearing
      const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
        window.HTMLInputElement.prototype,
        'value',
      )?.set
      nativeInputValueSetter?.call(input, '   ')
      input.dispatchEvent(new Event('input', { bubbles: true }))
    })
    const button = screen.getByRole('button', { name: /save/i })
    expect(button).toBeDisabled()
  })

  it('calls onSave with trimmed name on submit', async () => {
    const onSave = vi.fn()
    await renderWithProviders(
      <ProfileForm profile={mockProfile} onSave={onSave} isSaving={false} />,
    )
    const input = screen.getByDisplayValue('Test User')
    await act(async () => {
      const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
        window.HTMLInputElement.prototype,
        'value',
      )?.set
      nativeInputValueSetter?.call(input, '  New Name  ')
      input.dispatchEvent(new Event('input', { bubbles: true }))
    })
    const button = screen.getByRole('button', { name: /save/i })
    await act(async () => {
      button.click()
    })
    expect(onSave).toHaveBeenCalledWith({ displayName: 'New Name' })
  })

  it('shows saving state when isSaving=true', async () => {
    await renderWithProviders(
      <ProfileForm profile={mockProfile} onSave={vi.fn()} isSaving={true} />,
    )
    const button = screen.getByRole('button', { name: /saving/i })
    expect(button).toBeDisabled()
  })
})
