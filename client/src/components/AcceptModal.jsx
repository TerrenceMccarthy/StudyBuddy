import styles from './AcceptModal.module.css'

export default function AcceptModal({ post, onClose, onConfirm }) {
  if (!post) return null

  // Detect in-person sessions — true unless explicitly marked online
  const isInPerson = !post.is_online

  const authorName = post.host_name || post.author || 'this user'
  const courseTitle = post.course || post.topic
  const displayTime = post.time
    ? (post.time.includes('T')
        ? new Date(post.time).toLocaleString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
        : post.time)
    : ''

  return (
    <div className={styles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={styles.modal}>
        <div className={styles.icon}>🤝</div>
        <h2 className={styles.title}>Join this session?</h2>
        <p className={styles.sub}>
          You're about to connect with <strong>{authorName}</strong>
        </p>

        <div className={styles.sessionCard}>
          <p className={styles.topic}>{courseTitle}</p>
          <div className={styles.details}>
            <span>📍 {post.building}{post.room ? `, ${post.room}` : ''}</span>
            <span>🕐 {displayTime}</span>
          </div>
        </div>

        {/* ── In-person warning ── */}
        {isInPerson && (
          <div className={styles.warning}>
            <div className={styles.warningHeader}>
              <span className={styles.warningIcon}>⚠️</span>
              <span className={styles.warningTitle}>In-Person Meeting</span>
            </div>
            <p className={styles.warningText}>
              This is an in-person study session. For your safety, please keep these tips in mind:
            </p>
            <ul className={styles.warningList}>
              <li>Meet in a <strong>public place</strong> on campus (library, student center, etc.)</li>
              <li>Let a friend or family member know where you'll be</li>
              <li>Trust your instincts — leave if you feel uncomfortable</li>
              <li>Only share personal contact info when you're comfortable</li>
            </ul>
          </div>
        )}

        <p className={styles.note}>
          Once you accept, you'll both be connected to coordinate any final details.
        </p>

        <div className={styles.btns}>
          <button className={styles.cancelBtn} onClick={onClose}>Not now</button>
          <button
            className={styles.confirmBtn}
            onClick={() => { onConfirm(post.id); onClose(); }}
          >
            Accept & Connect
          </button>
        </div>
      </div>
    </div>
  )
}
