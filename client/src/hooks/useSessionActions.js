import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { validateSessionTime } from '../utils/validation'
import { formatForDateTimeInput, prepareTimeForStorage } from '../utils/time'

/**
 * Custom hook to centralize session edit/delete logic
 * Used by both Profile and MyPosts pages for consistency
 */
export function useSessionActions() {
  const [editingSession, setEditingSession] = useState(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [sessionForm, setSessionForm] = useState({
    course: '',
    subject: 'Computer Science',
    topic: '',
    building: '',
    duration: '',
    time: ''
  })
  const [savingSession, setSavingSession] = useState(false)
  const [sessionFormError, setSessionFormError] = useState('')

  /**
   * Open edit modal with session data
   */
  const handleEditSession = (post) => {
    setEditingSession(post)
    setSessionForm({
      course: post.course,
      subject: post.subject,
      topic: post.topic,
      building: post.building,
      duration: post.duration,
      // Convert UTC time to local timezone for display in datetime-local input
      time: formatForDateTimeInput(post.time),
    })
    setShowEditModal(true)
    setSessionFormError('')
  }

  /**
   * Save edited session
   * @param {Function} onSuccess - Callback after successful save
   */
  const handleSaveSession = async (onSuccess) => {
    setSessionFormError('')

    // Validate all fields are filled
    if (!sessionForm.course || !sessionForm.topic || !sessionForm.building ||
        !sessionForm.time || !sessionForm.duration) {
      setSessionFormError('Please fill in all fields.')
      return
    }

    // Validate session time is in the future
    const timeValidation = validateSessionTime(sessionForm.time)
    if (!timeValidation.valid) {
      setSessionFormError(timeValidation.error)
      return
    }

    setSavingSession(true)

    // Convert local time to UTC for storage
    const utcTime = prepareTimeForStorage(sessionForm.time)

    // Update the session in Supabase
    const { error } = await supabase
      .from('posts')
      .update({
        course: sessionForm.course,
        subject: sessionForm.subject,
        topic: sessionForm.topic,
        building: sessionForm.building,
        duration: sessionForm.duration,
        time: utcTime,
      })
      .eq('id', editingSession.id)

    if (!error) {
      setShowEditModal(false)
      setEditingSession(null)
      if (onSuccess) await onSuccess()
    } else {
      setSessionFormError('Failed to save changes. Please try again.')
    }

    setSavingSession(false)
  }

  /**
   * Delete session with optimistic UI update
   * @param {string} sessionId - ID of session to delete
   * @param {Function} onOptimisticDelete - Callback to update UI immediately
   * @param {Function} onError - Callback if delete fails (to restore UI)
   */
  const handleDeleteSession = async (sessionId, onOptimisticDelete, onError) => {
    // Optimistic UI update - remove from state immediately
    if (onOptimisticDelete) {
      onOptimisticDelete(sessionId)
    }

    // Perform actual delete
    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', sessionId)

    // If delete failed, restore the UI
    if (error && onError) {
      onError()
    }
  }

  /**
   * Close edit modal
   */
  const handleCancelEdit = () => {
    setShowEditModal(false)
    setEditingSession(null)
    setSessionFormError('')
  }

  return {
    // State
    editingSession,
    showEditModal,
    sessionForm,
    savingSession,
    sessionFormError,
    
    // Actions
    handleEditSession,
    handleSaveSession,
    handleDeleteSession,
    handleCancelEdit,
    setSessionForm,
  }
}
