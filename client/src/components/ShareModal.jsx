import { useState } from 'react'
import { useToast } from '../context/ToastContext'
import styles from './ShareModal.module.css'

/**
 * ShareModal Component
 * 
 * Displays sharing options for a session:
 * - Copy Link: Copies share URL to clipboard
 * - Native Share: Uses device's native share functionality (if supported)
 * 
 * @param {Object} props
 * @param {Object} props.session - Session object to share
 * @param {Function} props.onClose - Callback to close the modal
 */
export default function ShareModal({ session, onClose }) {
  const { showToast } = useToast()
  const [copying, setCopying] = useState(false)

  // Generate share URL with session ID
  const shareUrl = `${window.location.origin}/session/${session.id}`
  const shareTitle = `Study Session: ${session.course || session.topic}`
  const shareText = `Join my study session for ${session.course || session.topic} at ${session.building}`

  // Check if native share is supported
  const isNativeShareSupported = typeof navigator.share !== 'undefined'

  /**
   * Copy share link to clipboard
   */
  const handleCopyLink = async () => {
    try {
      setCopying(true)
      await navigator.clipboard.writeText(shareUrl)
      showToast('Link copied to clipboard!', 'success')
      onClose()
    } catch (error) {
      console.error('Failed to copy link:', error)
      showToast('Failed to copy link', 'error')
    } finally {
      setCopying(false)
    }
  }

  /**
   * Use native share functionality
   */
  const handleNativeShare = async () => {
    try {
      await navigator.share({
        title: shareTitle,
        text: shareText,
        url: shareUrl
      })
      onClose()
    } catch (error) {
      // User cancelled or share failed
      if (error.name !== 'AbortError') {
        console.error('Failed to share:', error)
        showToast('Failed to share', 'error')
      }
    }
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>Share Session</h2>
          <button
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className={styles.content}>
          <div className={styles.sessionInfo}>
            <h3 className={styles.sessionTitle}>{session.course || session.topic}</h3>
            <p className={styles.sessionDetails}>
              {session.building} • {session.duration}
            </p>
          </div>

          <div className={styles.shareUrl}>
            <input
              type="text"
              value={shareUrl}
              readOnly
              className={styles.urlInput}
              onClick={(e) => e.target.select()}
            />
          </div>

          <div className={styles.actions}>
            <button
              className={styles.copyBtn}
              onClick={handleCopyLink}
              disabled={copying}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
              {copying ? 'Copying...' : 'Copy Link'}
            </button>

            {isNativeShareSupported && (
              <button
                className={styles.nativeShareBtn}
                onClick={handleNativeShare}
              >
                <svg
                  width="18"
                  height="18"
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
                Share
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
