import styles from './LoadingSpinner.module.css'

/**
 * LoadingSpinner Component
 * 
 * Displays a loading spinner with optional message.
 * Used to indicate data fetching or processing states.
 * 
 * @param {Object} props
 * @param {string} [props.message] - Optional message to display below spinner
 * @param {string} [props.size] - Size variant ('small' | 'medium' | 'large'), defaults to 'medium'
 */
export default function LoadingSpinner({ message = 'Loading...', size = 'medium' }) {
  return (
    <div className={styles.loadingWrap}>
      <div className={`${styles.spinner} ${styles[size]}`} />
      {message && <p className={styles.message}>{message}</p>}
    </div>
  )
}
