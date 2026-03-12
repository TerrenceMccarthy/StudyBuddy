import styles from './PostCard.module.css'
import { subjectColors } from '../data/mockData'

export default function PostCard({ post, index, onAccept }) {
  const colors = subjectColors[post.subject] || { bg: '#f0f0f0', text: '#555' }
  const isAccepted = post.status === 'accepted'

  return (
    <article
      className={styles.card}
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <div className={styles.header}>
        <div className={styles.authorRow}>
          <div
            className={styles.avatar}
            style={{ background: post.avatarColor }}
          >
            {post.avatar}
          </div>
          <div className={styles.authorInfo}>
            <span className={styles.authorName}>{post.author}</span>
            <span className={styles.postedAgo}>{post.postedAgo}</span>
          </div>
        </div>
        <span
          className={styles.subject}
          style={{ background: colors.bg, color: colors.text }}
        >
          {post.subject}
        </span>
      </div>

      <h3 className={styles.topic}>{post.topic}</h3>

      {post.notes && (
        <p className={styles.notes}>{post.notes}</p>
      )}

      <div className={styles.details}>
        <div className={styles.detail}>
          <span className={styles.detailIcon}>📍</span>
          <span>{post.building}{post.room ? `, ${post.room}` : ''}</span>
        </div>
        <div className={styles.detail}>
          <span className={styles.detailIcon}>🕐</span>
          <span>{post.time}</span>
        </div>
        <div className={styles.detail}>
          <span className={styles.detailIcon}>⏱</span>
          <span>{post.duration}</span>
        </div>
      </div>

      <div className={styles.footer}>
        {isAccepted ? (
          <div className={styles.acceptedBadge}>
            <span className={styles.acceptedDot} />
            Session Matched
          </div>
        ) : (
          <button
            className={styles.acceptBtn}
            onClick={() => onAccept(post)}
          >
            Join Session
          </button>
        )}
        <button className={styles.moreBtn} title="More options">
          ···
        </button>
      </div>
    </article>
  )
}
