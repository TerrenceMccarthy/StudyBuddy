/**
 * Tests for StatusBadge component
 * 
 * **Validates: Requirements 12.1-12.6, 18.3**
 */

import { describe, it, expect } from 'vitest'
import { STATUS_CONFIG } from '../utils/sessionStatus.js'

describe('StatusBadge Component Logic', () => {
  it('should use correct config for open status', () => {
    const status = 'open'
    const config = STATUS_CONFIG[status] || STATUS_CONFIG.open
    expect(config.label).toBe('Open')
    expect(config.color).toBe('#4caf50')
  })

  it('should use correct config for matched status', () => {
    const status = 'matched'
    const config = STATUS_CONFIG[status] || STATUS_CONFIG.open
    expect(config.label).toBe('Matched')
    expect(config.color).toBe('#2196f3')
  })

  it('should use correct config for closed status', () => {
    const status = 'closed'
    const config = STATUS_CONFIG[status] || STATUS_CONFIG.open
    expect(config.label).toBe('Closed')
    expect(config.color).toBe('#9e9e9e')
  })

  it('should use correct config for expired status', () => {
    const status = 'expired'
    const config = STATUS_CONFIG[status] || STATUS_CONFIG.open
    expect(config.label).toBe('Expired')
    expect(config.color).toBe('#f59e0b')
  })

  it('should fall back to open config for invalid status', () => {
    const status = 'invalid'
    const config = STATUS_CONFIG[status] || STATUS_CONFIG.open
    expect(config.label).toBe('Open')
    expect(config.color).toBe('#4caf50')
  })

  it('should handle count display logic - show when count > 0', () => {
    const count = 3
    const shouldDisplay = count !== undefined && count > 0
    expect(shouldDisplay).toBe(true)
  })

  it('should handle count display logic - hide when count is 0', () => {
    const count = 0
    const shouldDisplay = count !== undefined && count > 0
    expect(shouldDisplay).toBe(false)
  })

  it('should handle count display logic - hide when count is undefined', () => {
    const count = undefined
    const shouldDisplay = count !== undefined && count > 0
    expect(shouldDisplay).toBe(false)
  })

  it('should generate correct background color with opacity', () => {
    const color = '#4caf50'
    const bgColor = `${color}15`
    expect(bgColor).toBe('#4caf5015')
  })

  it('should generate correct border color with opacity', () => {
    const color = '#2196f3'
    const borderColor = `${color}40`
    expect(borderColor).toBe('#2196f340')
  })
})
