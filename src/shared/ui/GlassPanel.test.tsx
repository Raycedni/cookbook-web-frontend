import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { GlassPanel } from './GlassPanel'

describe('GlassPanel', () => {
  it('renders children', () => {
    render(<GlassPanel>Hello</GlassPanel>)
    expect(screen.getByText('Hello')).toBeInTheDocument()
  })

  it('applies default medium intensity classes', () => {
    render(<GlassPanel>Content</GlassPanel>)
    const el = screen.getByText('Content').closest('div')!
    expect(el.className).toContain('backdrop-blur-md')
    expect(el.className).toContain('bg-white/[0.05]')
    expect(el.className).toContain('border-white/[0.10]')
  })

  it('applies light intensity classes', () => {
    render(<GlassPanel intensity="light">Content</GlassPanel>)
    const el = screen.getByText('Content').closest('div')!
    expect(el.className).toContain('backdrop-blur-sm')
    expect(el.className).toContain('bg-white/[0.03]')
    expect(el.className).toContain('border-white/[0.06]')
  })

  it('applies heavy intensity classes', () => {
    render(<GlassPanel intensity="heavy">Content</GlassPanel>)
    const el = screen.getByText('Content').closest('div')!
    expect(el.className).toContain('backdrop-blur-lg')
    expect(el.className).toContain('bg-white/[0.08]')
    expect(el.className).toContain('border-white/[0.15]')
  })

  it('passes through className prop', () => {
    render(<GlassPanel className="mt-4">Content</GlassPanel>)
    const el = screen.getByText('Content').closest('div')!
    expect(el.className).toContain('mt-4')
  })

  it('renders correct element with as prop', () => {
    render(<GlassPanel as="section">Content</GlassPanel>)
    const el = screen.getByText('Content').closest('section')
    expect(el).toBeInTheDocument()
  })

  it('applies base classes (rounded, border, shadow)', () => {
    render(<GlassPanel>Content</GlassPanel>)
    const el = screen.getByText('Content').closest('div')!
    expect(el.className).toContain('rounded-2xl')
    expect(el.className).toContain('border')
    expect(el.className).toContain('shadow-lg')
  })
})
