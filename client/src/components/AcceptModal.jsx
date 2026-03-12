import styles from './AcceptModal.module.css'

export default function AcceptModal({ post, onClose, onConfirm }) {
  if (!post) return null

  return (
    <div className={styles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={styles.modal}>
        <div className={styles.icon}>🤝</div>
        <h2 className={styles.title}>Join this session?</h2>
        <p className={styles.sub}>You're about to connect with <strong>{post.author}</strong></p>

        <div className={styles.sessionCard}>
          <p className={styles.topic}>{post.topic}</p>
          <div className={styles.details}>
            <span>📍 {post.building}{post.room ? `, ${post.room}` : ''}</span>
            <span>🕐 {post.time}</span>
          </div>
        </div>

        <p className={styles.note}>
          Once you accept, you'll both be connected to coordinate any final details.
        </p>

        <div className={styles.btns}>
          <button className={styles.cancelBtn} onClick={onClose}>Not now</button>
          <button className={styles.confirmBtn} onClick={() => { onConfirm(post.id); onClose(); }}>
            Accept & Connect
          </button>
        </div>
      </div>
    </div>
  )
}
