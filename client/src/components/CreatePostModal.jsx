import { useState } from 'react'
import styles from './CreatePostModal.module.css'
import { validateSessionTime } from '../utils/validation'

const SUBJECTS = [
  "Computer Science", "Mathematics", "Biology", "Chemistry",
  "Physics", "English", "History", "Psychology", "Economics", "Other"
]

export default function CreatePostModal({ onClose, onSubmit, spamError }) {
  const [form, setForm] = useState({
    topic: '', subject: '', building: '', room: '',
    date: '', time: '', duration: '', notes: ''
  })
  const [submitting, setSubmitting] = useState(false)
  const [validationError, setValidationError] = useState('')

  const set = (field, val) => setForm(f => ({ ...f, [field]: val }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setValidationError('')
    
    // Validate session time is in the future
    if (form.date && form.time) {
      const dateTimeString = `${form.date}T${form.time}`
      const validation = validateSessionTime(dateTimeString)
      
      if (!validation.valid) {
        setValidationError(validation.error)
        return
      }
    }
    
    setSubmitting(true)
    await onSubmit(form)
    setSubmitting(false)
  }

  // Min date = today
  const today = new Date().toISOString().split('T')[0]

  return (
    <div className={styles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <div>
            <h2 className={styles.modalTitle}>Post a Study Session</h2>
            <p className={styles.modalSub}>Find someone to study with</p>
          </div>
          <button className={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label className={styles.label}>Course / Topic *</label>
            <input
              className={styles.input}
              type="text"
              placeholder="e.g. CSE 3318 — Algorithms & Data Structures"
              value={form.topic}
              onChange={e => set('topic', e.target.value)}
              required
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Subject Area *</label>
            <select
              className={styles.select}
              value={form.subject}
              onChange={e => set('subject', e.target.value)}
              required
            >
              <option value="">Select a subject...</option>
              {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div className={styles.row}>
            <div className={styles.field}>
              <label className={styles.label}>Building *</label>
              <input
                className={styles.input}
                type="text"
                placeholder="e.g. Central Library"
                value={form.building}
                onChange={e => set('building', e.target.value)}
                required
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Room / Area</label>
              <input
                className={styles.input}
                type="text"
                placeholder="e.g. Study Room 4B"
                value={form.room}
                onChange={e => set('room', e.target.value)}
              />
            </div>
          </div>

          <div className={styles.row}>
            <div className={styles.field}>
              <label className={styles.label}>Date *</label>
              <input
                className={styles.input}
                type="date"
                min={today}
                value={form.date}
                onChange={e => set('date', e.target.value)}
                required
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Time *</label>
              <input
                className={styles.input}
                type="time"
                value={form.time}
                onChange={e => set('time', e.target.value)}
                required
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Duration</label>
              <select
                className={styles.select}
                value={form.duration}
                onChange={e => set('duration', e.target.value)}
              >
                <option value="">Select...</option>
                <option>1 hour</option>
                <option>1.5 hours</option>
                <option>2 hours</option>
                <option>3 hours</option>
                <option>4+ hours</option>
              </select>
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Notes</label>
            <textarea
              className={styles.textarea}
              placeholder="What will you be working on? Any notes for potential study partners..."
              value={form.notes}
              onChange={e => set('notes', e.target.value)}
              rows={3}
            />
          </div>

          {/* ── Validation error ── */}
          {validationError && (
            <div className={styles.spamError}>
              <span className={styles.spamIcon}>⚠️</span>
              <p className={styles.spamText}>{validationError}</p>
            </div>
          )}

          {/* ── Spam error ── */}
          {spamError && (
            <div className={styles.spamError}>
              <span className={styles.spamIcon}>🚫</span>
              <p className={styles.spamText}>{spamError}</p>
            </div>
          )}

          <div className={styles.modalFooter}>
            <button type="button" className={styles.cancelBtn} onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className={styles.submitBtn} disabled={submitting}>
              {submitting ? 'Checking...' : 'Post Session'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
