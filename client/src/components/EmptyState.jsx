import styles from './EmptyState.module.css'

/**
 * EmptyState Component
 * 
 * Displays a friendly empty state message with an optional call-to-action button.
 * Used when there is no content to display in a view.
 * 
 * **Validates: Requirements 13.1-13.5**
 * 
 * @param {Object} props
 * @param {string} props.icon - Icon or emoji to display
 * @param {string} props.title - Main heading text
 * @param {string} props.message - Descriptive message text
 * @param {Object} [props.action] - Optional action button configuration
 * @param {string} props.action.label - Button text
 * @param {Function} props.action.onClick - Button click handler
 */
export default function EmptyState({ icon, title, message, action }) {
  return (
    <div className={styles.empty}>
      <span className={styles.emptyIcon}>{icon}</span>
      <p className={styles.emptyTitle}>{title}</p>
      <p className={styles.emptySub}>{message}</p>
      {action && (
        <button className={styles.emptyAction} onClick={action.onClick}>
          {action.label}
        </button>
      )}
    </div>
  )
}
