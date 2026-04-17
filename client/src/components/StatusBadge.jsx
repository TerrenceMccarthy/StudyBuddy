import styles from './StatusBadge.module.css'
import { STATUS_CONFIG } from '../utils/sessionStatus.js'

/**
 * StatusBadge Component
 * 
 * Displays a status badge with appropriate color based on session status.
 * Optionally displays participant count.
 * 
 * @param {Object} props
 * @param {string} props.status - Session status ('open' | 'matched' | 'closed' | 'expired')
 * @param {number} [props.count] - Optional participant count to display
 */
export default function StatusBadge({ status, count }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.open
  
  return (
    <div 
      className={styles.badge}
      style={{ 
        backgroundColor: `${config.color}15`,
        color: config.color,
        borderColor: `${config.color}40`
      }}
      title={config.description}
    >
      <span className={styles.dot} style={{ backgroundColor: config.color }} />
      <span className={styles.label}>{config.label}</span>
      {count !== undefined && count > 0 && (
        <span className={styles.count}>({count})</span>
      )}
    </div>
  )
}
