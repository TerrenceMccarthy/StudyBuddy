import { useToast } from '../context/ToastContext'

/**
 * Example component demonstrating Toast usage
 * 
 * This example shows how to use the toast notification system
 * throughout the application.
 */
export default function ToastExample() {
  const { showToast } = useToast()

  const handleSuccess = () => {
    showToast('Operation completed successfully!', 'success')
  }

  const handleError = () => {
    showToast('An error occurred. Please try again.', 'error')
  }

  const handleInfo = () => {
    showToast('Here is some helpful information.', 'info')
  }

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Toast Notification Examples</h2>
      <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
        <button onClick={handleSuccess}>Show Success Toast</button>
        <button onClick={handleError}>Show Error Toast</button>
        <button onClick={handleInfo}>Show Info Toast</button>
      </div>
      
      <div style={{ marginTop: '2rem' }}>
        <h3>Usage Notes:</h3>
        <ul>
          <li>Success toasts auto-dismiss after 3 seconds</li>
          <li>Error toasts require manual dismissal</li>
          <li>Info toasts auto-dismiss after 3 seconds</li>
          <li>All toasts can be manually dismissed by clicking the X button</li>
        </ul>
      </div>
    </div>
  )
}
