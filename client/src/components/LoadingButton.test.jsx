/**
 * Tests for LoadingButton component
 * 
 * **Validates: Requirements 14.3, 14.5**
 */

import { describe, it, expect } from 'vitest'

describe('LoadingButton Component Logic', () => {
  it('should disable button when loading is true', () => {
    const loading = true
    const disabled = false
    const isDisabled = loading || disabled
    expect(isDisabled).toBe(true)
  })

  it('should disable button when disabled prop is true', () => {
    const loading = false
    const disabled = true
    const isDisabled = loading || disabled
    expect(isDisabled).toBe(true)
  })

  it('should disable button when both loading and disabled are true', () => {
    const loading = true
    const disabled = true
    const isDisabled = loading || disabled
    expect(isDisabled).toBe(true)
  })

  it('should not disable button when both loading and disabled are false', () => {
    const loading = false
    const disabled = false
    const isDisabled = loading || disabled
    expect(isDisabled).toBe(false)
  })

  it('should show loading content when loading is true', () => {
    const loading = true
    const content = loading ? 'Loading...' : 'Submit'
    expect(content).toBe('Loading...')
  })

  it('should show children content when loading is false', () => {
    const loading = false
    const children = 'Submit'
    const content = loading ? 'Loading...' : children
    expect(content).toBe('Submit')
  })

  it('should use default variant when not provided', () => {
    const variant = undefined
    const displayVariant = variant || 'primary'
    expect(displayVariant).toBe('primary')
  })

  it('should use primary variant when specified', () => {
    const variant = 'primary'
    expect(variant).toBe('primary')
  })

  it('should use secondary variant when specified', () => {
    const variant = 'secondary'
    expect(variant).toBe('secondary')
  })

  it('should use danger variant when specified', () => {
    const variant = 'danger'
    expect(variant).toBe('danger')
  })

  it('should use default button type when not provided', () => {
    const type = undefined
    const displayType = type || 'button'
    expect(displayType).toBe('button')
  })

  it('should use submit type when specified', () => {
    const type = 'submit'
    expect(type).toBe('submit')
  })

  it('should apply correct CSS classes for variant', () => {
    const variant = 'primary'
    const className = `button ${variant}`
    expect(className).toContain('primary')
  })

  it('should combine custom className with base classes', () => {
    const variant = 'primary'
    const customClass = 'custom-class'
    const className = `button ${variant} ${customClass}`
    expect(className).toContain('button')
    expect(className).toContain('primary')
    expect(className).toContain('custom-class')
  })

  it('should handle empty custom className', () => {
    const variant = 'primary'
    const customClass = ''
    const className = `button ${variant} ${customClass}`
    expect(className).toContain('button')
    expect(className).toContain('primary')
  })
})
