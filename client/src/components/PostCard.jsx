import styles from './PostCard.module.css'
import { subjectColors } from '../data/mockData'

function timeAgo(dateStr) {
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000)
  if (diff < 60) return 'Just now'
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)} hr${Math.floor(diff / 3600) > 1 ? 's' : ''} ago`
  if (diff < 604800) return `${Math.floor(diff / 86400)} day${Math.floor(diff / 86400) > 1 ? 's' : ''} ago`
  return new Date(dateStr).toLocaleDateString()
}

function formatTime(dateStr) {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric',
    hour: 'numeric', minute: '2-digit'
  })
}

function getInitials(name) {
  if (!name) return '?'
  return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
}

function getAvatarColor(str) {
  const colors = ['#2d7a6b', '#c07d1e', '#2e7d32', '#6a3fa0', '#1565c0', '#b71c5a']
  let hash = 0
  for (let i = 0; i < (str || '').length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }
  return colors[Math.abs(hash) % colors.length]
}

export default function PostCard({ post, index, onAccept }) {
  const colors = subjectColors[post.subject] || { bg: '#f0f0f0', text: '#555' }
  const isAccepted = post.status === 'accepted'

  // Support both real Supabase data and mock data shapes
  const authorName = post.host_name || post.author || 'Unknown'
  const avatarInitials = post.avatar || getInitials(authorName)
  const avatarColor = post.host_avatar_color || post.avatarColor || getAvatarColor(authorName)
  const postedAgo = post.postedAgo || timeAgo(post.created_at)
  const courseTitle = post.course || post.topic
  const notes = post.notes || post.topic
  const displayTime = post.time
    ? (post.time.includes('T') ? formatTime(post.time) : post.time)
    : ''

  return (
    <article
      className={styles.card}
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <div className={styles.header}>
        <div className={styles.authorRow}>
          <div
            className={styles.avatar}
            style={{ background: avatarColor }}
          >
            {avatarInitials}
          </div>
          <div className={styles.authorInfo}>
            <span className={styles.authorName}>{authorName}</span>
            <span className={styles.postedAgo}>{postedAgo}</span>
          </div>
        </div>
        <span
          className={styles.subject}
          style={{ background: colors.bg, color: colors.text }}
        >
          {post.subject}
        </span>
      </div>

      <h3 className={styles.topic}>{courseTitle}</h3>

      {notes && (
        <p className={styles.notes}>{notes}</p>
      )}

      <div className={styles.details}>
        <div className={styles.detail}>
          <span className={styles.detailIcon}>📍</span>
          <span>{post.building}{post.room ? `, ${post.room}` : ''}</span>
        </div>
        <div className={styles.detail}>
          <span className={styles.detailIcon}>🕐</span>
          <span>{displayTime}</span>
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
