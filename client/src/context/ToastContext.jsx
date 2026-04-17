import { createContext, useContext, useState, useCallback } from 'react'
import Toast from '../components/Toast'
import styles from './ToastContext.module.css'

const ToastContext = createContext(null)

/**
 * ToastProvider Component
 * 
 * Provides toast notification functionality throughout the application.
 * Manages toast state and renders toast notifications in a fixed container.
 * 
 * Usage:
 *   const { showToast } = useToast()
 *   showToast('Operation successful!', 'success')
 *   showToast('An error occurred', 'error')
 */
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  /**
   * Show a toast notification
   * @param {string} message - Message to display
   * @param {string} type - Toast type ('success' | 'error' | 'info')
   */
  const showToast = useCallback((message, type = 'success') => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, message, type }])
  }, [])

  /**
   * Dismiss a toast notification
   * @param {number} id - Toast ID to dismiss
   */
  const dismissToast = useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ showToast, dismissToast }}>
      {children}
      <div className={styles.toastContainer}>
        {toasts.map(toast => (
          <Toast
            key={toast.id}
            id={toast.id}
            message={toast.message}
            type={toast.type}
            onDismiss={dismissToast}
          />
        ))}
      </div>
    </ToastContext.Provider>
  )
}

/**
 * Hook to access toast functionality
 * @returns {{ showToast: Function, dismissToast: Function }}
 */
export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}
