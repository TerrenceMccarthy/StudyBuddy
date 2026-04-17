/**
 * Centralized validation utilities for StudyBuddy frontend
 * Provides client-side validation for user input
 * Note: Backend validation is authoritative - these are for UX only
 */

/**
 * Validate that a session time is in the future
 * @param {string|Date} timeValue - The time to validate (ISO string or Date object)
 * @returns {Object} { valid: boolean, error: string|null }
 */
export function validateSessionTime(timeValue) {
  if (!timeValue) {
    return { valid: false, error: 'Session time is required' }
  }

  const sessionTime = new Date(timeValue)
  const now = new Date()

  if (isNaN(sessionTime.getTime())) {
    return { valid: false, error: 'Invalid date format' }
  }

  if (sessionTime <= now) {
    return { valid: false, error: 'Please choose a future date and time' }
  }

  return { valid: true, error: null }
}

/**
 * Validate all required session data fields
 * @param {Object} data - Session data object
 * @param {string} data.course - Course/topic name
 * @param {string} data.subject - Subject area
 * @param {string} data.building - Building location
 * @param {string} data.time - Session time (ISO string)
 * @param {string} data.duration - Session duration
 * @returns {Object} { valid: boolean, errors: Object }
 */
export function validateSessionData(data) {
  const errors = {}

  // Required fields validation
  if (!data.course || !data.course.trim()) {
    errors.course = 'Course/topic is required'
  }

  if (!data.subject || !data.subject.trim()) {
    errors.subject = 'Subject area is required'
  }

  if (!data.building || !data.building.trim()) {
    errors.building = 'Building is required'
  }

  if (!data.time) {
    errors.time = 'Session time is required'
  } else {
    // Validate time is in future
    const timeValidation = validateSessionTime(data.time)
    if (!timeValidation.valid) {
      errors.time = timeValidation.error
    }
  }

  if (!data.duration || !data.duration.trim()) {
    errors.duration = 'Duration is required'
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors
  }
}

/**
 * Validate image file for profile picture upload
 * @param {File} file - The file to validate
 * @returns {Object} { valid: boolean, error: string|null }
 */
export function validateImageFile(file) {
  if (!file) {
    return { valid: false, error: 'Please select a file' }
  }

  // Check file type
  if (!file.type.startsWith('image/')) {
    return { valid: false, error: 'Please select a valid image file' }
  }

  // Check file size (5MB limit)
  const maxSize = 5 * 1024 * 1024 // 5MB in bytes
  if (file.size > maxSize) {
    return { valid: false, error: 'Image must be less than 5MB' }
  }

  return { valid: true, error: null }
}

/**
 * Validate password for password reset
 * @param {string} password - The password to validate
 * @returns {Object} { valid: boolean, error: string|null }
 */
export function validatePassword(password) {
  if (!password) {
    return { valid: false, error: 'Password is required' }
  }

  if (password.length < 8) {
    return { valid: false, error: 'Password must be at least 8 characters' }
  }

  return { valid: true, error: null }
}

/**
 * Validate email format
 * @param {string} email - The email to validate
 * @returns {Object} { valid: boolean, error: string|null }
 */
export function validateEmail(email) {
  if (!email) {
    return { valid: false, error: 'Email is required' }
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return { valid: false, error: 'Please enter a valid email address' }
  }

  return { valid: true, error: null }
}

/**
 * Validate required field
 * @param {any} value - The value to validate
 * @param {string} fieldName - Name of the field for error message
 * @returns {Object} { valid: boolean, error: string|null }
 */
export function validateRequired(value, fieldName = 'This field') {
  if (!value || (typeof value === 'string' && !value.trim())) {
    return { valid: false, error: `${fieldName} is required` }
  }

  return { valid: true, error: null }
}
