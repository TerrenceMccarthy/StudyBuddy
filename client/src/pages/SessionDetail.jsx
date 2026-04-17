import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { useUser } from '../context/UserContext'
import { useToast } from '../context/ToastContext'
import { formatSessionTime } from '../utils/time'
import { getSessionStatus } from '../utils/sessionStatus'
import LoadingSpinner from '../components/LoadingSpinner'
import styles from './SessionDetail.module.css'

/**
 * SessionDetail Page
 * 
 * Displays detailed information about a specific session.
 * Accessed via share links: /session/:id
 */
export default function SessionDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useUser()
  const { showToast } = useToast()
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [joining, setJoining] = useState(false)

  useEffect(() => {
    fetchSession()
  }, [id])

  const fetchSession = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          profiles ( full_name, avatar_color, profile_picture_url ),
          matches ( count )
        `)
        .eq('id', id)
        .single()

      if (error) throw error

      if (data) {
        const sessionData = {
          ...data,
          match_count: data.matches?.[0]?.count || 0,
          host_name: data.profiles?.full_name || 'Unknown',
          host_avatar_color: data.profiles?.avatar_color || null,
          profile_picture_url: data.profiles?.profile_picture_url || null,
        }
        setSession(sessionData)
      }
    } catch (error) {
      console.error('Error fetching session:', error)
      showToast('Session not found', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleJoin = async () => {
    if (!user) {
      showToast('Please log in to join sessions', 'error')
      navigate('/login')
      return
    }

    if (session.user_id === user.id) {
      showToast('You cannot join your own session', 'error')
      return
    }

    setJoining(true)
    try {
      const { error } = await supabase.from('matches').insert({
        post_id: session.id,
        user_id: user.id,
      })

      if (error) throw error

      showToast('Joined session!', 'success')
      fetchSession() // Refresh to show updated status
    } catch (error) {
      console.error('Error joining session:', error)
      showToast('Failed to join session', 'error')
    } finally {
      setJoining(false)
    }
  }

  if (loading) {
    return (
      <div className={styles.container}>
        <LoadingSpinner />
      </div>
    )
  }

  if (!session) {
    return (
      <div className={styles.container}>
        <div className={styles.notFound}>
          <span className={styles.notFoundIcon}>🔍</span>
          <h2 className={styles.notFoundTitle}>Session Not Found</h2>
          <p className={styles.notFoundText}>
            This session may have been deleted or the link is invalid.
          </p>
          <button
            className={styles.backBtn}
            onClick={() => navigate('/')}
          >
            Back to Home
          </button>
        </div>
      </div>
    )
  }

  const status = getSessionStatus(session)
  const isExpired = status === 'expired'
  const isOwner = user && session.user_id === user.id
  const canJoin = user && !isOwner && !isExpired && session.status === 'open'

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <button
            className={styles.backLink}
            onClick={() => navigate('/')}
          >
            ← Back to Sessions
          </button>
        </div>

        <div className={styles.content}>
          <div className={styles.mainInfo}>
            <h1 className={styles.title}>{session.course || session.topic}</h1>
            
            {session.topic && session.course !== session.topic && (
              <p className={styles.notes}>{session.topic}</p>
            )}

            <div className={styles.meta}>
              <span className={styles.subject}>{session.subject}</span>
              <span className={`${styles.status} ${styles[status]}`}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </span>
            </div>
          </div>

          <div className={styles.details}>
            <div className={styles.detailItem}>
              <span className={styles.detailIcon}>👤</span>
              <div className={styles.detailContent}>
                <span className={styles.detailLabel}>Host</span>
                <span className={styles.detailValue}>
                  {isOwner ? 'You' : session.host_name}
                </span>
              </div>
            </div>

            <div className={styles.detailItem}>
              <span className={styles.detailIcon}>📍</span>
              <div className={styles.detailContent}>
                <span className={styles.detailLabel}>Location</span>
                <span className={styles.detailValue}>{session.building}</span>
              </div>
            </div>

            <div className={styles.detailItem}>
              <span className={styles.detailIcon}>🕐</span>
              <div className={styles.detailContent}>
                <span className={styles.detailLabel}>Time</span>
                <span className={styles.detailValue}>
                  {formatSessionTime(session.time)}
                </span>
              </div>
            </div>

            <div className={styles.detailItem}>
              <span className={styles.detailIcon}>⏱</span>
              <div className={styles.detailContent}>
                <span className={styles.detailLabel}>Duration</span>
                <span className={styles.detailValue}>{session.duration}</span>
              </div>
            </div>
          </div>

          {canJoin && (
            <div className={styles.actions}>
              <button
                className={styles.joinBtn}
                onClick={handleJoin}
                disabled={joining}
              >
                {joining ? 'Joining...' : 'Join Session'}
              </button>
            </div>
          )}

          {isExpired && (
            <div className={styles.expiredNotice}>
              This session has already passed
            </div>
          )}

          {isOwner && (
            <div className={styles.ownerNotice}>
              This is your session
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
