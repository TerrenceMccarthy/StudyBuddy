import styles from './LoadingButton.module.css'

/**
 * LoadingButton Component
 * 
 * A button component that displays a loading spinner during form submissions.
 * Automatically disables interaction while loading.
 * 
 * @param {Object} props
 * @param {boolean} props.loading - Whether the button is in loading state
 * @param {React.ReactNode} props.children - Button content
 * @param {string} [props.variant] - Style variant ('primary' | 'secondary' | 'danger'), defaults to 'primary'
 * @param {boolean} [props.disabled] - Whether the button is disabled
 * @param {string} [props.type] - Button type attribute
 * @param {Function} [props.onClick] - Click handler
 * @param {string} [props.className] - Additional CSS classes
 */
export default function LoadingButton({ 
  loading, 
  children, 
  variant = 'primary',
  disabled,
  type = 'button',
  onClick,
  className = '',
  ...props 
}) {
  return (
    <button
      type={type}
      className={`${styles.button} ${styles[variant]} ${className}`}
      disabled={loading || disabled}
      onClick={onClick}
      {...props}
    >
      {loading ? (
        <>
          <span className={styles.buttonSpinner} />
          <span>Loading...</span>
        </>
      ) : (
        children
      )}
    </button>
  )
}
