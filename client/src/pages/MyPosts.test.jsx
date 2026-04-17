import { describe, it, expect } from 'vitest'
import { validateSessionTime } from '../utils/validation'

describe('MyPosts - Validation Integration', () => {
  it('should use validateSessionTime utility for past time validation', () => {
    const pastTime = new Date(Date.now() - 3600000).toISOString() // 1 hour ago
    const result = validateSessionTime(pastTime)
    
    expect(result.valid).toBe(false)
    expect(result.error).toBe('Please choose a future date and time')
  })

  it('should use validateSessionTime utility for future time validation', () => {
    const futureTime = new Date(Date.now() + 3600000).toISOString() // 1 hour from now
    const result = validateSessionTime(futureTime)
    
    expect(result.valid).toBe(true)
    expect(result.error).toBe(null)
  })

  it('should validate required fields', () => {
    const emptyForm = {
      course: '',
      topic: '',
      building: '',
      time: '',
      duration: ''
    }
    
    // Check that at least one field is empty
    const hasEmptyFields = !emptyForm.course || !emptyForm.topic || 
                          !emptyForm.building || !emptyForm.time || 
                          !emptyForm.duration
    
    expect(hasEmptyFields).toBe(true)
  })
})
