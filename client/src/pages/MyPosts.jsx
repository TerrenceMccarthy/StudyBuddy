import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useUser } from '../context/UserContext'
import styles from './MyPosts.module.css'

const SUBJECT_COLORS = {
  'Computer Science': { bg: '#e8f4f0', text: '#2d7a6b' },
  'Mathematics':      { bg: '#fef3e2', text: '#c07d1e' },
  'Biology':          { bg: '#e9f5e9', text: '#2e7d32' },
  'Chemistry':        { bg: '#ede7f6', text: '#6a3fa0' },
  'English':          { bg: '#e3f2fd', text: '#1565c0' },
  'History':          { bg: '#fce4ec', text: '#b71c5a' },
}

const SUBJECT_INITIALS = {
  'Computer Science': 'CS', 'Mathematics': 'MA', 'Biology': 'BI',
  'Chemistry': 'CH', 'English': 'EN', 'History': 'HI',
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

function formatTime(dateStr) {
  return new Date(dateStr).toLocaleString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric',
    hour: 'numeric', minute: '2-digit'
  })
}

// Derive the real display status — expired overrides open/matched
function getDisplayStatus(post) {
  const isPast = post.time && new Date(post.time) < new Date()
  if (isPast && post.status !== 'closed') return 'expired'
  return post.status
}

function PostCard({ post, onEdit, onDelete, onClose, avatarColor }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const subjectColor = SUBJECT_COLORS[post.subject] || { bg: '#f0f0f0', text: '#555' }
  const displayStatus = getDisplayStatus(post)
  const status = STATUS_CONFIG[displayStatus]
  const isDim = displayStatus === 'closed' || displayStatus === 'expired'

  return (
    <div className={`${styles.card} ${isDim ? styles.cardClosed : ''}`}>
      <div className={styles.cardHeader}>
        <div className={styles.avatarWrap}>
          <div className={styles.avatar} style={{ background: avatarColor || subjectColor.text }}>
            {SUBJECT_INITIALS[post.subject] || 'ME'}
          </div>
          <div className={styles.posterInfo}>
            <span className={styles.posterName}>You</span>
            <span className={styles.postedAgo}>{timeAgo(post.created_at)}</span>
          </div>
        </div>
        <div className={styles.headerRight}>
          <span className={styles.subjectBadge} style={{ background: subjectColor.bg, color: subjectColor.text }}>
            {post.subject}
          </span>
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
        <span>🕐 {formatTime(post.time)}</span>
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

export default function MyPosts() {
  const { user, profile } = useUser()
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState('all')
  const [editingPost, setEditingPost] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')

  const [form, setForm] = useState({
    course: '', subject: 'Computer Science', topic: '',
    building: '', duration: '', time: ''
  })

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
  const postsWithStatus = posts.map(p => ({ ...p, _displayStatus: getDisplayStatus(p) }))

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
    await supabase.from('posts').delete().eq('id', id)
    setPosts(ps => ps.filter(p => p.id !== id))
  }

  const handleClose = async (id) => {
    await supabase.from('posts').update({ status: 'closed' }).eq('id', id)
    setPosts(ps => ps.map(p => p.id === id ? { ...p, status: 'closed' } : p))
  }

  const handleEdit = (post) => {
    setEditingPost(post)
    setForm({
      course: post.course, subject: post.subject, topic: post.topic,
      building: post.building, duration: post.duration,
      time: post.time?.slice(0, 16) || '',
    })
    setShowModal(true)
  }

  const handleOpenNew = () => {
    setEditingPost(null)
    setForm({ course: '', subject: 'Computer Science', topic: '', building: '', duration: '', time: '' })
    setShowModal(true)
  }

  const handleSave = async () => {
    setFormError('')
    if (!form.course || !form.topic || !form.building || !form.time || !form.duration) {
      setFormError('Please fill in all fields.')
      return
    }
    // Prevent creating a post in the past
    if (new Date(form.time) < new Date()) {
      setFormError('Please choose a future date and time.')
      return
    }
    setSaving(true)
    if (editingPost) {
      const { error } = await supabase.from('posts').update({ ...form }).eq('id', editingPost.id)
      if (!error) await fetchPosts()
    } else {
      const { error } = await supabase.from('posts').insert({ ...form, user_id: user.id, status: 'open' })
      if (!error) await fetchPosts()
    }
    setSaving(false)
    setShowModal(false)
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
                avatarColor={profile?.avatar_color}
              />
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <div className={styles.modalBackdrop} onClick={() => setShowModal(false)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>{editingPost ? 'Edit Session' : 'New Session'}</h2>
              <button className={styles.modalClose} onClick={() => setShowModal(false)}>✕</button>
            </div>
            <div className={styles.modalBody}>
              <label className={styles.fieldLabel}>Course</label>
              <input className={styles.fieldInput} value={form.course} onChange={e => setForm(f => ({ ...f, course: e.target.value }))} placeholder="e.g. CSE 3318 — Algorithms" />

              <label className={styles.fieldLabel}>Subject</label>
              <select className={styles.fieldInput} value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}>
                {Object.keys(SUBJECT_COLORS).map(s => <option key={s}>{s}</option>)}
              </select>

              <label className={styles.fieldLabel}>Topic / Description</label>
              <textarea className={styles.fieldTextarea} value={form.topic} onChange={e => setForm(f => ({ ...f, topic: e.target.value }))} placeholder="What will you be studying?" />

              <div className={styles.fieldRow}>
                <div>
                  <label className={styles.fieldLabel}>Location</label>
                  <input className={styles.fieldInput} value={form.building} onChange={e => setForm(f => ({ ...f, building: e.target.value }))} placeholder="Building & room" />
                </div>
                <div>
                  <label className={styles.fieldLabel}>Duration</label>
                  <input className={styles.fieldInput} value={form.duration} onChange={e => setForm(f => ({ ...f, duration: e.target.value }))} placeholder="e.g. 2 hours" />
                </div>
              </div>

              <label className={styles.fieldLabel}>Date & Time</label>
              <input
                className={styles.fieldInput}
                type="datetime-local"
                value={form.time}
                min={new Date().toISOString().slice(0, 16)}
                onChange={e => setForm(f => ({ ...f, time: e.target.value }))}
              />

              {formError && <p className={styles.formError}>⚠️ {formError}</p>}
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.cancelBtn} onClick={() => setShowModal(false)}>Cancel</button>
              <button className={styles.saveBtn} onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : editingPost ? 'Save Changes' : 'Post Session'}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
