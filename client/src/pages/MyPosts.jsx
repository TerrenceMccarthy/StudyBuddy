import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useUser } from '../context/UserContext'
import { getSessionStatus } from '../utils/sessionStatus'
import { useSessionActions } from '../hooks/useSessionActions'
import { formatSessionTime } from '../utils/time'
import styles from './MyPosts.module.css'

const SUBJECT_COLORS = {
  'Computer Science': { bg: '#e8f4f0', text: '#2d7a6b' },
  'Mathematics':      { bg: '#fef3e2', text: '#c07d1e' },
  'Biology':          { bg: '#e9f5e9', text: '#2e7d32' },
  'Chemistry':        { bg: '#ede7f6', text: '#6a3fa0' },
  'English':          { bg: '#e3f2fd', text: '#1565c0' },
  'History':          { bg: '#fce4ec', text: '#b71c5a' },
}


const STATUS_CONFIG = {
  open:    { label: 'Open',    dot: '#4caf50', bg: '#e8f5e9', text: '#2e7d32' },
  matched: { label: 'Matched', dot: '#2196f3', bg: '#e3f2fd', text: '#1565c0' },
  closed:  { label: 'Closed',  dot: '#9e9e9e', bg: '#f5f5f5', text: '#616161' },
  expired: { label: 'Expired', dot: '#f59e0b', bg: '#fff8e1', text: '#b45309' },
}

function timeAgo(dateStr) {
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000)
  if (diff < 60) return 'Just now'
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)} hr${Math.floor(diff / 3600) > 1 ? 's' : ''} ago`
  if (diff < 604800) return `${Math.floor(diff / 86400)} day${Math.floor(diff / 86400) > 1 ? 's' : ''} ago`
  return new Date(dateStr).toLocaleDateString()
}

function PostCard({ post, onEdit, onDelete, onClose, onShare, avatarColor, initials, profilePicture }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const subjectColor = SUBJECT_COLORS[post.subject] || { bg: '#f0f0f0', text: '#555' }
  const displayStatus = getSessionStatus(post)
  const status = STATUS_CONFIG[displayStatus]
  const isDim = displayStatus === 'closed' || displayStatus === 'expired'

  const handleShare = (e) => {
    e.stopPropagation()
    if (onShare) {
      onShare(post)
    }
  }

  return (
    <div className={`${styles.card} ${isDim ? styles.cardClosed : ''}`}>
      <div className={styles.cardHeader}>
        <div className={styles.avatarWrap}>
          {profilePicture ? (
            <img src={profilePicture} alt="avatar" className={styles.avatar} style={{ objectFit: 'cover' }} />
          ) : (
            <div className={styles.avatar} style={{ background: avatarColor || subjectColor.text }}>
              {initials || 'ME'}
            </div>
          )}
          <div className={styles.posterInfo}>
            <span className={styles.posterName}>You</span>
            <span className={styles.postedAgo}>{timeAgo(post.created_at)}</span>
          </div>
        </div>
        <div className={styles.headerRight}>
          <span className={styles.subjectBadge} style={{ background: subjectColor.bg, color: subjectColor.text }}>
            {post.subject}
          </span>
          <button className={styles.shareBtn} onClick={handleShare} aria-label="Share session" title="Share session">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="18" cy="5" r="3" />
              <circle cx="6" cy="12" r="3" />
              <circle cx="18" cy="19" r="3" />
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
              <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
            </svg>
          </button>
          <div className={styles.menuWrap}>
            <button className={styles.menuBtn} onClick={() => setMenuOpen(o => !o)}>···</button>
            {menuOpen && (
              <div className={styles.menu}>
                {displayStatus === 'open' && (
                  <button onClick={() => { onEdit(post); setMenuOpen(false) }}>✏️ Edit</button>
                )}
                {displayStatus === 'open' && (
                  <button onClick={() => { onClose(post.id); setMenuOpen(false) }}>🔒 Close</button>
                )}
                <button className={styles.menuDelete} onClick={() => { onDelete(post.id); setMenuOpen(false) }}>🗑 Delete</button>
              </div>
            )}
          </div>
        </div>
      </div>

      <h3 className={styles.courseTitle}>{post.course}</h3>

      <div className={styles.topicBox}>
        <p className={styles.topicText}>{post.topic}</p>
      </div>

      <div className={styles.meta}>
        <span>📍 {post.building}</span>
        <span>🕐 {formatSessionTime(post.time)}</span>
        <span>⏱ {post.duration}</span>
      </div>

      <div className={styles.cardFooter}>
        <span className={styles.statusBadge} style={{ background: status.bg, color: status.text }}>
          <span className={styles.statusDot} style={{ background: status.dot }} />
          {status.label}
        </span>
        {displayStatus !== 'closed' && displayStatus !== 'expired' && (
          <span className={styles.participants}>{post.match_count || 0} joined</span>
        )}
        {displayStatus === 'expired' && (
          <span className={styles.expiredNote}>Session has passed</span>
        )}
      </div>
    </div>
  )
}

function getInitials(name) {
  if (!name) return '?'
  return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
}

export default function MyPosts({ onShare }) {
  const { user, profile } = useUser()
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState('all')

  // Use centralized session actions hook
  const {
    showEditModal,
    sessionForm,
    savingSession,
    sessionFormError,
    handleEditSession,
    handleSaveSession,
    handleDeleteSession,
    handleCancelEdit,
    setSessionForm,
  } = useSessionActions()

  const FILTERS = [
    { key: 'all', label: 'All Posts' },
    { key: 'open', label: 'Open' },
    { key: 'matched', label: 'Matched' },
    { key: 'expired', label: 'Expired' },
    { key: 'closed', label: 'Closed' },
  ]

  const fetchPosts = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('posts')
      .select(`*, matches(count)`)
      .eq('user_id', user.id)
      .order('time', { ascending: false })   // most recent session time first

    if (!error) {
      const withCount = data.map(p => ({
        ...p,
        match_count: p.matches?.[0]?.count || 0
      }))
      setPosts(withCount)
    }
    setLoading(false)
  }

  useEffect(() => { fetchPosts() }, [user])

  // Apply display status before filtering
  const postsWithStatus = posts.map(p => ({ ...p, _displayStatus: getSessionStatus(p) }))

  const filtered = postsWithStatus.filter(p =>
    activeFilter === 'all' || p._displayStatus === activeFilter
  )

  const stats = {
    total: posts.length,
    open: postsWithStatus.filter(p => p._displayStatus === 'open').length,
    matched: postsWithStatus.filter(p => p._displayStatus === 'matched').length,
    expired: postsWithStatus.filter(p => p._displayStatus === 'expired').length,
  }

  const handleDelete = async (id) => {
    // Optimistic UI update - remove from state immediately
    const optimisticDelete = (sessionId) => {
      setPosts(ps => ps.filter(p => p.id !== sessionId))
    }

    // If delete fails, refresh from database
    const onError = () => {
      fetchPosts()
    }

    await handleDeleteSession(id, optimisticDelete, onError)
  }

  const handleClose = async (id) => {
    await supabase.from('posts').update({ status: 'closed' }).eq('id', id)
    setPosts(ps => ps.map(p => p.id === id ? { ...p, status: 'closed' } : p))
  }

  const handleEdit = (post) => {
    handleEditSession(post)
  }

  const handleOpenNew = () => {
    // For creating new posts, we still use local state
    // This is not part of the centralized edit/delete logic
    setSessionForm({
      course: '',
      subject: 'Computer Science',
      topic: '',
      building: '',
      duration: '',
      time: ''
    })
    // Note: We would need to extend the hook or handle this separately
    // For now, keeping the existing modal approach for new posts
  }

  const handleSave = async () => {
    await handleSaveSession(fetchPosts)
  }

  if (loading) {
    return (
      <main className={styles.main}>
        <div className={styles.loadingWrap}>
          <p className={styles.loadingText}>Loading your posts...</p>
        </div>
      </main>
    )
  }

  return (
    <main className={styles.main}>
      <div className={styles.hero}>
        <div className={styles.heroInner}>
          <p className={styles.heroEyebrow}>📋 Your study sessions</p>
          <h1 className={styles.heroTitle}>My<br /><em>Posts</em></h1>
          <p className={styles.heroSub}>Track and manage the sessions you've created.</p>
        </div>
        <div className={styles.heroDecor} aria-hidden>
          <div className={styles.decorDot} style={{ top: '20%', left: '10%', animationDelay: '0s' }} />
          <div className={styles.decorDot} style={{ top: '60%', left: '20%', animationDelay: '0.8s' }} />
          <div className={styles.decorDot} style={{ top: '30%', right: '15%', animationDelay: '0.4s' }} />
          <div className={styles.decorDot} style={{ top: '70%', right: '8%', animationDelay: '1.2s' }} />
        </div>
      </div>

      <div className={styles.statsRow}>
        <div className={styles.statCard}>
          <span className={styles.statNum}>{stats.total}</span>
          <span className={styles.statLabel}>Total Posts</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statNum} style={{ color: '#2d7a6b' }}>{stats.open}</span>
          <span className={styles.statLabel}>Open</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statNum} style={{ color: '#1565c0' }}>{stats.matched}</span>
          <span className={styles.statLabel}>Matched</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statNum} style={{ color: '#b45309' }}>{stats.expired}</span>
          <span className={styles.statLabel}>Expired</span>
        </div>
      </div>

      <div className={styles.controls}>
        <div className={styles.filters}>
          {FILTERS.map(f => (
            <button
              key={f.key}
              className={`${styles.filterBtn} ${activeFilter === f.key ? styles.filterActive : ''}`}
              onClick={() => setActiveFilter(f.key)}
            >
              {f.label}
            </button>
          ))}
        </div>
        <button className={styles.newPostBtn} onClick={handleOpenNew}>+ New Session</button>
      </div>

      <div className={styles.content}>
        <div className={styles.feedHeader}>
          <span className={styles.feedCount}>
            {filtered.length} session{filtered.length !== 1 ? 's' : ''}
            {activeFilter !== 'all' ? ` · ${FILTERS.find(f => f.key === activeFilter)?.label}` : ''}
          </span>
          <select className={styles.sortSelect}>
            <option>Most recent</option>
            <option>By status</option>
            <option>By subject</option>
          </select>
        </div>

        {filtered.length === 0 ? (
          <div className={styles.empty}>
            <span className={styles.emptyIcon}>📭</span>
            <p className={styles.emptyTitle}>No sessions here</p>
            <p className={styles.emptySub}>
              {activeFilter === 'all'
                ? "You haven't posted any sessions yet. Create one!"
                : `You have no ${activeFilter} sessions.`}
            </p>
            {activeFilter === 'all' && (
              <button className={styles.emptyAction} onClick={handleOpenNew}>+ Post a Session</button>
            )}
          </div>
        ) : (
          <div className={styles.grid}>
            {filtered.map(post => (
              <PostCard
                key={post.id}
                post={post}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onClose={handleClose}
                onShare={onShare}
                avatarColor={profile?.avatar_color}
                initials={getInitials(profile?.full_name || user?.email || '')}
                profilePicture={profile?.profile_picture_url}
              />
            ))}
          </div>
        )}
      </div>

      {showEditModal && (
        <div className={styles.modalBackdrop} onClick={handleCancelEdit}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Edit Session</h2>
              <button className={styles.modalClose} onClick={handleCancelEdit}>✕</button>
            </div>
            <div className={styles.modalBody}>
              <label className={styles.fieldLabel}>Course</label>
              <input className={styles.fieldInput} value={sessionForm.course} onChange={e => setSessionForm(f => ({ ...f, course: e.target.value }))} placeholder="e.g. CSE 3318 — Algorithms" />

              <label className={styles.fieldLabel}>Subject</label>
              <select className={styles.fieldInput} value={sessionForm.subject} onChange={e => setSessionForm(f => ({ ...f, subject: e.target.value }))}>
                {Object.keys(SUBJECT_COLORS).map(s => <option key={s}>{s}</option>)}
              </select>

              <label className={styles.fieldLabel}>Topic / Description</label>
              <textarea className={styles.fieldTextarea} value={sessionForm.topic} onChange={e => setSessionForm(f => ({ ...f, topic: e.target.value }))} placeholder="What will you be studying?" />

              <div className={styles.fieldRow}>
                <div>
                  <label className={styles.fieldLabel}>Location</label>
                  <input className={styles.fieldInput} value={sessionForm.building} onChange={e => setSessionForm(f => ({ ...f, building: e.target.value }))} placeholder="Building & room" />
                </div>
                <div>
                  <label className={styles.fieldLabel}>Duration</label>
                  <input className={styles.fieldInput} value={sessionForm.duration} onChange={e => setSessionForm(f => ({ ...f, duration: e.target.value }))} placeholder="e.g. 2 hours" />
                </div>
              </div>

              <label className={styles.fieldLabel}>Date & Time</label>
              <input
                className={styles.fieldInput}
                type="datetime-local"
                value={sessionForm.time}
                min={new Date().toISOString().slice(0, 16)}
                onChange={e => setSessionForm(f => ({ ...f, time: e.target.value }))}
              />

              {sessionFormError && <p className={styles.formError}>⚠️ {sessionFormError}</p>}
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.cancelBtn} onClick={handleCancelEdit}>Cancel</button>
              <button className={styles.saveBtn} onClick={handleSave} disabled={savingSession}>
                {savingSession ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
