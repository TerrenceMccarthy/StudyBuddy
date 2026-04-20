import styles from './PostCard.module.css'
import { subjectColors } from '../data/mockData'
import { formatSessionTime, timeAgo as formatTimeAgo } from '../utils/time'



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

export default function PostCard({ post, index, onAccept, onShare, currentUser, onModeratorDelete, onModeratorClose }) {
  const colors = subjectColors[post.subject] || { bg: '#f0f0f0', text: '#555' }
  const isAccepted = post.status === 'accepted'
  const isModerator = currentUser?.is_moderator || false

  // Support both real Supabase data and mock data shapes
  const authorName = post.host_name || post.author || 'Unknown'
  const avatarInitials = post.avatar || getInitials(authorName)
  const avatarColor = post.host_avatar_color || post.avatarColor || getAvatarColor(authorName)
  const profilePictureUrl = post.profile_picture_url || null
  const postedAgo = post.postedAgo || formatTimeAgo(post.created_at)
  const courseTitle = post.course || post.topic
  const notes = post.notes || post.topic
  // Use formatSessionTime utility to convert UTC to local timezone
  const displayTime = post.time ? formatSessionTime(post.time) : ''

  const handleShare = (e) => {
    e.stopPropagation()
    if (onShare) {
      onShare(post)
    }
  }

  const handleModeratorDelete = (e) => {
    e.stopPropagation()
    if (onModeratorDelete && window.confirm('Are you sure you want to delete this session as a moderator?')) {
      onModeratorDelete(post)
    }
  }

  const handleModeratorClose = (e) => {
    e.stopPropagation()
    if (onModeratorClose && window.confirm('Are you sure you want to close this session as a moderator?')) {
      onModeratorClose(post)
    }
  }

  return (
    <article
      className={styles.card}
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <div className={styles.header}>
        <div className={styles.authorRow}>
          {profilePictureUrl ? (
            <img 
              src={profilePictureUrl} 
              alt={authorName}
              className={styles.avatar}
              onError={(e) => {
                // Fallback to initials on error
                e.target.style.display = 'none'
                e.target.nextSibling.style.display = 'flex'
              }}
            />
          ) : null}
          <div
            className={styles.avatar}
            style={{ 
              background: avatarColor,
              display: profilePictureUrl ? 'none' : 'flex'
            }}
          >
            {avatarInitials}
          </div>
          <div className={styles.authorInfo}>
            <span className={styles.authorName}>{authorName}</span>
            <span className={styles.postedAgo}>{postedAgo}</span>
          </div>
        </div>
        <div className={styles.headerActions}>
          <span
            className={styles.subject}
            style={{ background: colors.bg, color: colors.text }}
          >
            {post.subject}
          </span>
          <button
            className={styles.shareBtn}
            onClick={handleShare}
            aria-label="Share session"
            title="Share session"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="18" cy="5" r="3" />
              <circle cx="6" cy="12" r="3" />
              <circle cx="18" cy="19" r="3" />
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
              <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
            </svg>
          </button>
        </div>
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
        
        {isModerator && (
          <div className={styles.moderatorActions}>
            <button
              className={styles.moderatorBtn}
              onClick={handleModeratorClose}
              title="Close session (Moderator)"
            >
              Close
            </button>
            <button
              className={`${styles.moderatorBtn} ${styles.moderatorDeleteBtn}`}
              onClick={handleModeratorDelete}
              title="Delete session (Moderator)"
            >
              Delete
            </button>
          </div>
        )}
      </div>
    </article>
  )
}
