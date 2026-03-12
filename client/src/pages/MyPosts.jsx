import { useState } from 'react'
import styles from './MyPosts.module.css'

const MOCK_MY_POSTS = [
  {
    id: 1,
    course: 'CSE 4301 — Operating Systems',
    subject: 'Computer Science',
    topic: 'Memory management and page replacement algorithms.',
    building: 'Central Library, Study Room 4B',
    time: 'Today, 7:00 PM',
    duration: '2 hours',
    status: 'open',
    postedAgo: '10 min ago',
    participants: 0,
  },
  {
    id: 2,
    course: 'MATH 3310 — Linear Algebra',
    subject: 'Mathematics',
    topic: 'Eigenvalues, eigenvectors, and diagonalization.',
    building: 'Science Hall, Room 201',
    time: 'Tomorrow, 4:00 PM',
    duration: '1.5 hours',
    status: 'matched',
    postedAgo: '2 hrs ago',
    participants: 2,
  },
  {
    id: 3,
    course: 'HIST 2301 — World History',
    subject: 'History',
    topic: 'Cold War politics and post-WWII reconstruction.',
    building: 'Humanities Center, Coffee area',
    time: 'Fri, 2:00 PM',
    duration: '2 hours',
    status: 'closed',
    postedAgo: '3 days ago',
    participants: 3,
  },
  {
    id: 4,
    course: 'CHEM 2323 — Organic Chemistry I',
    subject: 'Chemistry',
    topic: 'Reaction mechanisms and stereochemistry practice.',
    building: 'Science Hall, Room 110',
    time: 'Sat, 11:00 AM',
    duration: '3 hours',
    status: 'open',
    postedAgo: 'Yesterday',
    participants: 1,
  },
]

const SUBJECT_COLORS = {
  'Computer Science': { bg: '#e8f4f0', text: '#2d7a6b' },
  'Mathematics':      { bg: '#fef3e2', text: '#c07d1e' },
  'Biology':          { bg: '#e9f5e9', text: '#2e7d32' },
  'Chemistry':        { bg: '#ede7f6', text: '#6a3fa0' },
  'English':          { bg: '#e3f2fd', text: '#1565c0' },
  'History':          { bg: '#fce4ec', text: '#b71c5a' },
}

const SUBJECT_INITIALS = {
  'Computer Science': 'CS',
  'Mathematics': 'MA',
  'Biology': 'BI',
  'Chemistry': 'CH',
  'English': 'EN',
  'History': 'HI',
}

const STATUS_CONFIG = {
  open:    { label: 'Open',    dot: '#4caf50', bg: '#e8f5e9', text: '#2e7d32' },
  matched: { label: 'Matched', dot: '#2196f3', bg: '#e3f2fd', text: '#1565c0' },
  closed:  { label: 'Closed',  dot: '#9e9e9e', bg: '#f5f5f5', text: '#616161' },
}

function PostCard({ post, onEdit, onDelete, onClose }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const subjectColor = SUBJECT_COLORS[post.subject] || { bg: '#f0f0f0', text: '#555' }
  const status = STATUS_CONFIG[post.status]

  return (
    <div className={`${styles.card} ${post.status === 'closed' ? styles.cardClosed : ''}`}>
      <div className={styles.cardHeader}>
        <div className={styles.avatarWrap}>
          <div className={styles.avatar} style={{ background: subjectColor.text }}>
            {SUBJECT_INITIALS[post.subject] || 'ME'}
          </div>
          <div className={styles.posterInfo}>
            <span className={styles.posterName}>You</span>
            <span className={styles.postedAgo}>{post.postedAgo}</span>
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
                <button onClick={() => { onEdit(post); setMenuOpen(false) }}>✏️ Edit</button>
                {post.status === 'open' && (
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
        <span>🕐 {post.time}</span>
        <span>⏱ {post.duration}</span>
      </div>

      <div className={styles.cardFooter}>
        <span className={styles.statusBadge} style={{ background: status.bg, color: status.text }}>
          <span className={styles.statusDot} style={{ background: status.dot }} />
          {status.label}
        </span>

        {post.status !== 'closed' && (
          <span className={styles.participants}>
            {post.participants} joined
          </span>
        )}
      </div>
    </div>
  )
}

export default function MyPosts() {
  const [posts, setPosts] = useState(MOCK_MY_POSTS)
  const [activeFilter, setActiveFilter] = useState('all')
  const [editingPost, setEditingPost] = useState(null)
  const [showModal, setShowModal] = useState(false)

  const FILTERS = [
    { key: 'all', label: 'All Posts' },
    { key: 'open', label: 'Open' },
    { key: 'matched', label: 'Matched' },
    { key: 'closed', label: 'Closed' },
  ]

  const filtered = posts.filter(p => activeFilter === 'all' || p.status === activeFilter)

  const stats = {
    total: posts.length,
    open: posts.filter(p => p.status === 'open').length,
    matched: posts.filter(p => p.status === 'matched').length,
    participants: posts.reduce((sum, p) => sum + p.participants, 0),
  }

  const handleDelete = (id) => setPosts(ps => ps.filter(p => p.id !== id))
  const handleClose = (id) => setPosts(ps => ps.map(p => p.id === id ? { ...p, status: 'closed' } : p))
  const handleEdit = (post) => { setEditingPost(post); setShowModal(true) }

  return (
    <main className={styles.main}>
      {/* Hero */}
      <div className={styles.hero}>
        <div className={styles.heroInner}>
          <p className={styles.heroEyebrow}>📋 Your study sessions</p>
          <h1 className={styles.heroTitle}>
            My<br /><em>Posts</em>
          </h1>
          <p className={styles.heroSub}>
            Track and manage the sessions you've created.
          </p>
        </div>
        <div className={styles.heroDecor} aria-hidden>
          <div className={styles.decorDot} style={{ top: '20%', left: '10%', animationDelay: '0s' }} />
          <div className={styles.decorDot} style={{ top: '60%', left: '20%', animationDelay: '0.8s' }} />
          <div className={styles.decorDot} style={{ top: '30%', right: '15%', animationDelay: '0.4s' }} />
          <div className={styles.decorDot} style={{ top: '70%', right: '8%', animationDelay: '1.2s' }} />
        </div>
      </div>

      {/* Stats Row */}
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
          <span className={styles.statNum} style={{ color: '#c07d1e' }}>{stats.participants}</span>
          <span className={styles.statLabel}>Participants</span>
        </div>
      </div>

      {/* Controls */}
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
        <button className={styles.newPostBtn} onClick={() => { setEditingPost(null); setShowModal(true) }}>
          + New Session
        </button>
      </div>

      {/* Feed */}
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
            <button className={styles.emptyAction} onClick={() => setShowModal(true)}>
              + Post a Session
            </button>
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
              />
            ))}
          </div>
        )}
      </div>

      {/* Edit / Create Modal */}
      {showModal && (
        <div className={styles.modalBackdrop} onClick={() => setShowModal(false)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>{editingPost ? 'Edit Session' : 'New Session'}</h2>
              <button className={styles.modalClose} onClick={() => setShowModal(false)}>✕</button>
            </div>
            <div className={styles.modalBody}>
              <label className={styles.fieldLabel}>Course</label>
              <input className={styles.fieldInput} defaultValue={editingPost?.course} placeholder="e.g. CSE 3318 — Algorithms" />

              <label className={styles.fieldLabel}>Subject</label>
              <select className={styles.fieldInput} defaultValue={editingPost?.subject}>
                {Object.keys(SUBJECT_COLORS).map(s => <option key={s}>{s}</option>)}
              </select>

              <label className={styles.fieldLabel}>Topic / Description</label>
              <textarea className={styles.fieldTextarea} defaultValue={editingPost?.topic} placeholder="What will you be studying?" />

              <div className={styles.fieldRow}>
                <div>
                  <label className={styles.fieldLabel}>Location</label>
                  <input className={styles.fieldInput} defaultValue={editingPost?.building} placeholder="Building & room" />
                </div>
                <div>
                  <label className={styles.fieldLabel}>Duration</label>
                  <input className={styles.fieldInput} defaultValue={editingPost?.duration} placeholder="e.g. 2 hours" />
                </div>
              </div>

              <label className={styles.fieldLabel}>Date & Time</label>
              <input className={styles.fieldInput} type="datetime-local" />
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.cancelBtn} onClick={() => setShowModal(false)}>Cancel</button>
              <button className={styles.saveBtn} onClick={() => setShowModal(false)}>
                {editingPost ? 'Save Changes' : 'Post Session'}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
