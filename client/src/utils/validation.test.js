/**
 * Unit tests for validation utilities
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import {
  validateSessionTime,
  validateSessionData,
  validateImageFile,
  validatePassword,
  validateEmail,
  validateRequired
} from './validation'

describe('validateSessionTime', () => {
  beforeEach(() => {
    // Mock current time to 2024-01-01 12:00:00
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2024-01-01T12:00:00Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should accept future times', () => {
    const futureTime = new Date('2024-01-02T12:00:00Z')
    const result = validateSessionTime(futureTime)
    expect(result.valid).toBe(true)
    expect(result.error).toBe(null)
  })

  it('should reject past times', () => {
    const pastTime = new Date('2023-12-31T12:00:00Z')
    const result = validateSessionTime(pastTime)
    expect(result.valid).toBe(false)
    expect(result.error).toBe('Please choose a future date and time')
  })

  it('should reject current time', () => {
    const currentTime = new Date('2024-01-01T12:00:00Z')
    const result = validateSessionTime(currentTime)
    expect(result.valid).toBe(false)
    expect(result.error).toBe('Please choose a future date and time')
  })

  it('should reject empty time', () => {
    const result = validateSessionTime('')
    expect(result.valid).toBe(false)
    expect(result.error).toBe('Session time is required')
  })

  it('should reject invalid date format', () => {
    const result = validateSessionTime('invalid-date')
    expect(result.valid).toBe(false)
    expect(result.error).toBe('Invalid date format')
  })

  it('should accept ISO string format', () => {
    const futureTime = '2024-01-02T12:00:00Z'
    const result = validateSessionTime(futureTime)
    expect(result.valid).toBe(true)
    expect(result.error).toBe(null)
  })
})

describe('validateSessionData', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2024-01-01T12:00:00Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should accept valid session data', () => {
    const validData = {
      course: 'CSE 3318',
      subject: 'Computer Science',
      building: 'Central Library',
      time: '2024-01-02T12:00:00Z',
      duration: '2 hours'
    }
    const result = validateSessionData(validData)
    expect(result.valid).toBe(true)
    expect(result.errors).toEqual({})
  })

  it('should reject missing course', () => {
    const data = {
      subject: 'Computer Science',
      building: 'Central Library',
      time: '2024-01-02T12:00:00Z',
      duration: '2 hours'
    }
    const result = validateSessionData(data)
    expect(result.valid).toBe(false)
    expect(result.errors.course).toBe('Course/topic is required')
  })

  it('should reject empty course', () => {
    const data = {
      course: '   ',
      subject: 'Computer Science',
      building: 'Central Library',
      time: '2024-01-02T12:00:00Z',
      duration: '2 hours'
    }
    const result = validateSessionData(data)
    expect(result.valid).toBe(false)
    expect(result.errors.course).toBe('Course/topic is required')
  })

  it('should reject missing subject', () => {
    const data = {
      course: 'CSE 3318',
      building: 'Central Library',
      time: '2024-01-02T12:00:00Z',
      duration: '2 hours'
    }
    const result = validateSessionData(data)
    expect(result.valid).toBe(false)
    expect(result.errors.subject).toBe('Subject area is required')
  })

  it('should reject missing building', () => {
    const data = {
      course: 'CSE 3318',
      subject: 'Computer Science',
      time: '2024-01-02T12:00:00Z',
      duration: '2 hours'
    }
    const result = validateSessionData(data)
    expect(result.valid).toBe(false)
    expect(result.errors.building).toBe('Building is required')
  })

  it('should reject missing time', () => {
    const data = {
      course: 'CSE 3318',
      subject: 'Computer Science',
      building: 'Central Library',
      duration: '2 hours'
    }
    const result = validateSessionData(data)
    expect(result.valid).toBe(false)
    expect(result.errors.time).toBe('Session time is required')
  })

  it('should reject past time', () => {
    const data = {
      course: 'CSE 3318',
      subject: 'Computer Science',
      building: 'Central Library',
      time: '2023-12-31T12:00:00Z',
      duration: '2 hours'
    }
    const result = validateSessionData(data)
    expect(result.valid).toBe(false)
    expect(result.errors.time).toBe('Please choose a future date and time')
  })

  it('should reject missing duration', () => {
    const data = {
      course: 'CSE 3318',
      subject: 'Computer Science',
      building: 'Central Library',
      time: '2024-01-02T12:00:00Z'
    }
    const result = validateSessionData(data)
    expect(result.valid).toBe(false)
    expect(result.errors.duration).toBe('Duration is required')
  })

  it('should return multiple errors for multiple missing fields', () => {
    const data = {}
    const result = validateSessionData(data)
    expect(result.valid).toBe(false)
    expect(Object.keys(result.errors).length).toBe(5)
    expect(result.errors.course).toBeDefined()
    expect(result.errors.subject).toBeDefined()
    expect(result.errors.building).toBeDefined()
    expect(result.errors.time).toBeDefined()
    expect(result.errors.duration).toBeDefined()
  })
})

describe('validateImageFile', () => {
  it('should accept valid image file', () => {
    const file = new File(['content'], 'test.jpg', { type: 'image/jpeg' })
    const result = validateImageFile(file)
    expect(result.valid).toBe(true)
    expect(result.error).toBe(null)
  })

  it('should accept PNG files', () => {
    const file = new File(['content'], 'test.png', { type: 'image/png' })
    const result = validateImageFile(file)
    expect(result.valid).toBe(true)
    expect(result.error).toBe(null)
  })

  it('should reject non-image files', () => {
    const file = new File(['content'], 'test.pdf', { type: 'application/pdf' })
    const result = validateImageFile(file)
    expect(result.valid).toBe(false)
    expect(result.error).toBe('Please select a valid image file')
  })

  it('should reject files larger than 5MB', () => {
    const largeContent = new Array(6 * 1024 * 1024).fill('a').join('')
    const file = new File([largeContent], 'large.jpg', { type: 'image/jpeg' })
    const result = validateImageFile(file)
    expect(result.valid).toBe(false)
    expect(result.error).toBe('Image must be less than 5MB')
  })

  it('should accept files exactly at 5MB', () => {
    const content = new Array(5 * 1024 * 1024).fill('a').join('')
    const file = new File([content], 'exact.jpg', { type: 'image/jpeg' })
    const result = validateImageFile(file)
    expect(result.valid).toBe(true)
    expect(result.error).toBe(null)
  })

  it('should reject null file', () => {
    const result = validateImageFile(null)
    expect(result.valid).toBe(false)
    expect(result.error).toBe('Please select a file')
  })

  it('should reject undefined file', () => {
    const result = validateImageFile(undefined)
    expect(result.valid).toBe(false)
    expect(result.error).toBe('Please select a file')
  })
})

describe('validatePassword', () => {
  it('should accept valid password', () => {
    const result = validatePassword('password123')
    expect(result.valid).toBe(true)
    expect(result.error).toBe(null)
  })

  it('should accept password exactly 8 characters', () => {
    const result = validatePassword('12345678')
    expect(result.valid).toBe(true)
    expect(result.error).toBe(null)
  })

  it('should reject password shorter than 8 characters', () => {
    const result = validatePassword('pass123')
    expect(result.valid).toBe(false)
    expect(result.error).toBe('Password must be at least 8 characters')
  })

  it('should reject empty password', () => {
    const result = validatePassword('')
    expect(result.valid).toBe(false)
    expect(result.error).toBe('Password is required')
  })

  it('should reject null password', () => {
    const result = validatePassword(null)
    expect(result.valid).toBe(false)
    expect(result.error).toBe('Password is required')
  })

  it('should accept long passwords', () => {
    const longPassword = 'a'.repeat(100)
    const result = validatePassword(longPassword)
    expect(result.valid).toBe(true)
    expect(result.error).toBe(null)
  })
})

describe('validateEmail', () => {
  it('should accept valid email', () => {
    const result = validateEmail('test@example.com')
    expect(result.valid).toBe(true)
    expect(result.error).toBe(null)
  })

  it('should accept email with subdomain', () => {
    const result = validateEmail('user@mail.example.com')
    expect(result.valid).toBe(true)
    expect(result.error).toBe(null)
  })

  it('should reject email without @', () => {
    const result = validateEmail('testexample.com')
    expect(result.valid).toBe(false)
    expect(result.error).toBe('Please enter a valid email address')
  })

  it('should reject email without domain', () => {
    const result = validateEmail('test@')
    expect(result.valid).toBe(false)
    expect(result.error).toBe('Please enter a valid email address')
  })

  it('should reject email without local part', () => {
    const result = validateEmail('@example.com')
    expect(result.valid).toBe(false)
    expect(result.error).toBe('Please enter a valid email address')
  })

  it('should reject empty email', () => {
    const result = validateEmail('')
    expect(result.valid).toBe(false)
    expect(result.error).toBe('Email is required')
  })

  it('should reject email with spaces', () => {
    const result = validateEmail('test @example.com')
    expect(result.valid).toBe(false)
    expect(result.error).toBe('Please enter a valid email address')
  })
})

describe('validateRequired', () => {
  it('should accept non-empty string', () => {
    const result = validateRequired('value')
    expect(result.valid).toBe(true)
    expect(result.error).toBe(null)
  })

  it('should accept number', () => {
    const result = validateRequired(123)
    expect(result.valid).toBe(true)
    expect(result.error).toBe(null)
  })

  it('should accept boolean true', () => {
    const result = validateRequired(true)
    expect(result.valid).toBe(true)
    expect(result.error).toBe(null)
  })

  it('should reject empty string', () => {
    const result = validateRequired('')
    expect(result.valid).toBe(false)
    expect(result.error).toBe('This field is required')
  })

  it('should reject whitespace-only string', () => {
    const result = validateRequired('   ')
    expect(result.valid).toBe(false)
    expect(result.error).toBe('This field is required')
  })

  it('should reject null', () => {
    const result = validateRequired(null)
    expect(result.valid).toBe(false)
    expect(result.error).toBe('This field is required')
  })

  it('should reject undefined', () => {
    const result = validateRequired(undefined)
    expect(result.valid).toBe(false)
    expect(result.error).toBe('This field is required')
  })

  it('should use custom field name in error message', () => {
    const result = validateRequired('', 'Username')
    expect(result.valid).toBe(false)
    expect(result.error).toBe('Username is required')
  })
})
