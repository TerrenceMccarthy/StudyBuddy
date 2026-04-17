import { useEffect } from 'react'
import styles from './Toast.module.css'

/**
 * Toast Component
 * 
 * Displays a notification message with appropriate styling based on type.
 * Success toasts auto-dismiss after 3 seconds.
 * Error toasts require manual dismissal.
 * 
 * @param {Object} props
 * @param {string} props.id - Unique identifier for the toast
 * @param {string} props.message - Message to display
 * @param {string} props.type - Toast type ('success' | 'error' | 'info')
 * @param {Function} props.onDismiss - Callback when toast is dismissed
 */
export default function Toast({ id, message, type = 'success', onDismiss }) {
  useEffect(() => {
    // Auto-dismiss success and info toasts after 3 seconds
    if (type === 'success' || type === 'info') {
      const timer = setTimeout(() => {
        onDismiss(id)
      }, 3000)
      
      return () => clearTimeout(timer)
    }
  }, [id, type, onDismiss])

  const handleDismiss = () => {
    onDismiss(id)
  }

  return (
    <div className={`${styles.toast} ${styles[type]}`}>
      <div className={styles.content}>
        <span className={styles.icon}>
          {type === 'success' && '✓'}
          {type === 'error' && '✕'}
          {type === 'info' && 'ℹ'}
        </span>
        <span className={styles.message}>{message}</span>
      </div>
      <button 
        className={styles.dismiss}
        onClick={handleDismiss}
        aria-label="Dismiss notification"
      >
        ✕
      </button>
    </div>
  )
}
