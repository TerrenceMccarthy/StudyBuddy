/**
 * LoadingButton Example Usage
 * 
 * This file demonstrates how to use the LoadingButton component
 * in different scenarios throughout the application.
 */

import { useState } from 'react'
import LoadingButton from './LoadingButton'

// Example 1: Basic form submission
function Example1() {
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    setLoading(true)
    await submitForm()
    setLoading(false)
  }

  return (
    <LoadingButton loading={loading} onClick={handleSubmit}>
      Submit
    </LoadingButton>
  )
}

// Example 2: Primary variant (default)
function Example2() {
  const [loading, setLoading] = useState(false)

  return (
    <LoadingButton loading={loading} variant="primary">
      Create Session
    </LoadingButton>
  )
}

// Example 3: Secondary variant
function Example3() {
  const [loading, setLoading] = useState(false)

  return (
    <LoadingButton loading={loading} variant="secondary">
      Save Changes
    </LoadingButton>
  )
}

// Example 4: Danger variant
function Example4() {
  const [loading, setLoading] = useState(false)

  return (
    <LoadingButton loading={loading} variant="danger">
      Delete Session
    </LoadingButton>
  )
}

// Example 5: With form submission
function Example5() {
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    await submitForm()
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit}>
      <input type="text" name="title" />
      <LoadingButton loading={loading} type="submit">
        Submit
      </LoadingButton>
    </form>
  )
}

// Example 6: Disabled state
function Example6() {
  const [loading, setLoading] = useState(false)
  const [isValid, setIsValid] = useState(false)

  return (
    <LoadingButton loading={loading} disabled={!isValid}>
      Submit
    </LoadingButton>
  )
}

// Example 7: Custom className
function Example7() {
  const [loading, setLoading] = useState(false)

  return (
    <LoadingButton loading={loading} className="custom-button-class">
      Submit
    </LoadingButton>
  )
}

// Example 8: Complete form with loading state
function SessionForm() {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    course: '',
    subject: '',
    building: '',
    time: '',
    duration: ''
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      await createSession(formData)
      showToast('Session created successfully!', 'success')
    } catch (error) {
      showToast('Failed to create session', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={formData.course}
        onChange={(e) => setFormData({ ...formData, course: e.target.value })}
        placeholder="Course"
      />
      {/* More form fields */}
      
      <div className="form-actions">
        <button type="button" onClick={onCancel}>
          Cancel
        </button>
        <LoadingButton loading={loading} type="submit" variant="primary">
          Create Session
        </LoadingButton>
      </div>
    </form>
  )
}

// Example 9: Multiple buttons with different states
function MultipleButtons() {
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  return (
    <div className="button-group">
      <LoadingButton loading={saving} variant="primary" onClick={handleSave}>
        Save
      </LoadingButton>
      <LoadingButton loading={deleting} variant="danger" onClick={handleDelete}>
        Delete
      </LoadingButton>
    </div>
  )
}

export { 
  Example1, 
  Example2, 
  Example3, 
  Example4, 
  Example5, 
  Example6, 
  Example7, 
  SessionForm,
  MultipleButtons 
}
