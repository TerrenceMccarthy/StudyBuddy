import { useState } from 'react'
import styles from './Matches.module.css'

const MOCK_MATCHES = [
  {
    id: 1,
    course: 'CSE 3318 — Algorithms & Data Structures',
    subject: 'Computer Science',
    topic: 'Focusing on graph traversal and dynamic programming. Bring your notes!',
    building: 'Central Library, Study Room 4B',
    time: 'Today, 7:00 PM',
    duration: '2 hours',
    host: { name: 'Marcus T.', initials: 'MT', color: '#2d7a6b' },
    matchedAgo: '12 min ago',
    participants: 3,
    status: 'upcoming',
    messages: 2,
  },
  {
    id: 2,
    course: 'BIOL 2457 — Anatomy & Physiology',
    subject: 'Biology',
    topic: 'Cramming for the practical exam next week. Flashcards and diagrams.',
    building: 'Health Sciences Bldg, Lounge 3',
    time: 'Today, 9:00 PM',
    duration: '3 hours',
    host: { name: 'Leila R.', initials: 'LR', color: '#2e7d32' },
    matchedAgo: '1 hr ago',
    participants: 4,
    status: 'upcoming',
    messages: 0,
  },
  {
    id: 3,
    course: 'HIST 3301 — U.S. History Since 1865',
    subject: 'History',
    topic: 'Essay prep — Reconstruction era through the Gilded Age.',
    building: 'Humanities Center, Coffee area',
    time: 'Fri, 1:00 PM',
    duration: '2 hours',
    host: { name: 'David K.', initials: 'DK', color: '#b71c5a' },
    matchedAgo: '3 hrs ago',
    participants: 2,
    status: 'upcoming',
    messages: 5,
  },
  {
    id: 4,
    course: 'MATH 2326 — Calculus III',
    subject: 'Mathematics',
    topic: 'Working through multivariable integrals and vector fields. All levels welcome.',
    building: 'Science Hall, Room 201',
    time: 'Wed, 3:30 PM',
    duration: '1.5 hours',
    host: { name: 'Priya S.', initials: 'PS', color: '#c07d1e' },
    matchedAgo: '2 days ago',
    participants: 5,
    status: 'completed',
    messages: 0,
  },
  {
    id: 5,
    course: 'ENGL 2331 — British Literature',
    subject: 'English',
    topic: 'Close reading of Paradise Lost. Discussion-based — come ready to talk.',
    building: 'Humanities Center, Reading Room',
    time: 'Thu, 4:00 PM',
    duration: '1.5 hours',
    host: { name: 'Aiden F.', initials: 'AF', color: '#1565c0' },
    matchedAgo: '2 days ago',
    participants: 3,
    status: 'completed',
    messages: 0,
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

const STATUS_CONFIG = {
  upcoming:  { label: 'Upcoming',  dot: '#4caf50', bg: '#e8f5e9', text: '#2e7d32' },
  completed: { label: 'Completed', dot: '#9e9e9e', bg: '#f5f5f5', text: '#616161' },
}

function MatchCard({ match, onMessage, onLeave }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const subjectColor = SUBJECT_COLORS[match.subject] || { bg: '#f0f0f0', text: '#555' }
  const status = STATUS_CONFIG[match.status]

  return (
    <div className={`${styles.card} ${match.status === 'completed' ? styles.cardDim : ''}`}>
      <div className={styles.cardHeader}>
        <div className={styles.avatarWrap}>
          <div className={styles.avatar} style={{ background: match.host.color }}>
            {match.host.initials}
          </div>
          <div className={styles.posterInfo}>
            <span className={styles.posterName}>{match.host.name}</span>
            <span className={styles.postedAgo}>{match.matchedAgo}</span>
          </div>
        </div>
        <div className={styles.headerRight}>
          <span
            className={styles.subjectBadge}
            style={{ background: subjectColor.bg, color: subjectColor.text }}
          >
            {match.subject}
          </span>
          <div className={styles.menuWrap}>
            <button className={styles.menuBtn} onClick={() => setMenuOpen(o => !o)}>···</button>
            {menuOpen && (
              <div className={styles.menu}>
                <button onClick={() => { onMessage(match); setMenuOpen(false) }}>
                  💬 Message Host
                </button>
                <button onClick={() => { setMenuOpen(false) }}>
                  📋 View Details
                </button>
                {match.status === 'upcoming' && (
                  <button
                    className={styles.menuLeave}
                    onClick={() => { onLeave(match.id); setMenuOpen(false) }}
                  >
                    🚪 Leave Session
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <h3 className={styles.courseTitle}>{match.course}</h3>

      <div className={styles.topicBox}>
        <p className={styles.topicText}>{match.topic}</p>
      </div>

      <div className={styles.meta}>
        <span>📍 {match.building}</span>
        <span>🕐 {match.time}</span>
        <span>⏱ {match.duration}</span>
      </div>

      <div className={styles.cardFooter}>
        <span
          className={styles.statusBadge}
          style={{ background: status.bg, color: status.text }}
        >
          <span className={styles.statusDot} style={{ background: status.dot }} />
          {status.label}
        </span>

        <div className={styles.footerActions}>
          <span className={styles.participants}>
            👥 {match.participants} joined
          </span>
          {match.status === 'upcoming' && (
            <button
              className={styles.msgBtn}
              onClick={() => onMessage(match)}
            >
              {match.messages > 0 && (
                <span className={styles.msgBadge}>{match.messages}</span>
              )}
              💬
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

function MessageModal({ match, onClose }) {
  const [msg, setMsg] = useState('')
  const [sent, setSent] = useState([
    { from: 'them', text: 'Hey! Looking forward to the session.', time: '10:30 AM' },
    { from: 'me', text: 'Same! I\'ll bring my notes on graph traversal.', time: '10:32 AM' },
  ])

  const handleSend = () => {
    if (!msg.trim()) return
    setSent(s => [...s, { from: 'me', text: msg, time: 'Now' }])
    setMsg('')
  }

  if (!match) return null

  return (
    <div className={styles.modalBackdrop} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <div className={styles.modalTitleRow}>
            <div className={styles.avatar} style={{ background: match.host.color, width: 32, height: 32, fontSize: '0.65rem' }}>
              {match.host.initials}
            </div>
            <div>
              <p className={styles.modalTitle}>{match.host.name}</p>
              <p className={styles.modalSub}>{match.course}</p>
            </div>
          </div>
          <button className={styles.modalClose} onClick={onClose}>✕</button>
        </div>

        <div className={styles.chatBody}>
          {sent.map((m, i) => (
            <div key={i} className={`${styles.bubble} ${m.from === 'me' ? styles.bubbleMe : styles.bubbleThem}`}>
              <p className={styles.bubbleText}>{m.text}</p>
              <span className={styles.bubbleTime}>{m.time}</span>
            </div>
          ))}
        </div>

        <div className={styles.chatInput}>
          <input
            className={styles.chatField}
            placeholder="Type a message..."
            value={msg}
            onChange={e => setMsg(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
          />
          <button className={styles.sendBtn} onClick={handleSend}>Send</button>
        </div>
      </div>
    </div>
  )
}

export default function Matches() {
  const [matches, setMatches] = useState(MOCK_MATCHES)
  const [activeFilter, setActiveFilter] = useState('all')
  const [messagingMatch, setMessagingMatch] = useState(null)

  const FILTERS = [
    { key: 'all', label: 'All' },
    { key: 'upcoming', label: 'Upcoming' },
    { key: 'completed', label: 'Completed' },
  ]

  const filtered = matches.filter(m => activeFilter === 'all' || m.status === activeFilter)

  const stats = {
    total: matches.length,
    upcoming: matches.filter(m => m.status === 'upcoming').length,
    completed: matches.filter(m => m.status === 'completed').length,
    unread: matches.reduce((sum, m) => sum + m.messages, 0),
  }

  const handleLeave = (id) => setMatches(ms => ms.filter(m => m.id !== id))

  return (
    <main className={styles.main}>
      {/* Hero */}
      <div className={styles.hero}>
        <div className={styles.heroInner}>
          <p className={styles.heroEyebrow}>🤝 {stats.upcoming} upcoming session{stats.upcoming !== 1 ? 's' : ''}</p>
          <h1 className={styles.heroTitle}>
            My<br /><em>Matches</em>
          </h1>
          <p className={styles.heroSub}>
            Sessions you've joined — connect, show up, and study together.
          </p>
        </div>
        <div className={styles.heroDecor} aria-hidden>
          <div className={styles.decorDot} style={{ top: '20%', left: '10%', animationDelay: '0s' }} />
          <div className={styles.decorDot} style={{ top: '60%', left: '20%', animationDelay: '0.8s' }} />
          <div className={styles.decorDot} style={{ top: '30%', right: '15%', animationDelay: '0.4s' }} />
          <div className={styles.decorDot} style={{ top: '70%', right: '8%', animationDelay: '1.2s' }} />
        </div>
      </div>

      {/* Stats */}
      <div className={styles.statsRow}>
        <div className={styles.statCard}>
          <span className={styles.statNum}>{stats.total}</span>
          <span className={styles.statLabel}>Total Matches</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statNum} style={{ color: '#2d7a6b' }}>{stats.upcoming}</span>
          <span className={styles.statLabel}>Upcoming</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statNum} style={{ color: '#888' }}>{stats.completed}</span>
          <span className={styles.statLabel}>Completed</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statNum} style={{ color: '#c07d1e' }}>{stats.unread}</span>
          <span className={styles.statLabel}>Unread Msgs</span>
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
      </div>

      {/* Feed */}
      <div className={styles.content}>
        <div className={styles.feedHeader}>
          <span className={styles.feedCount}>
            {filtered.length} match{filtered.length !== 1 ? 'es' : ''}
            {activeFilter !== 'all' ? ` · ${FILTERS.find(f => f.key === activeFilter)?.label}` : ''}
          </span>
          <select className={styles.sortSelect}>
            <option>Soonest first</option>
            <option>Most recent</option>
            <option>By subject</option>
          </select>
        </div>

        {filtered.length === 0 ? (
          <div className={styles.empty}>
            <span className={styles.emptyIcon}>🤝</span>
            <p className={styles.emptyTitle}>No matches yet</p>
            <p className={styles.emptySub}>Browse open sessions and join one to get started!</p>
          </div>
        ) : (
          <div className={styles.grid}>
            {filtered.map(match => (
              <MatchCard
                key={match.id}
                match={match}
                onMessage={setMessagingMatch}
                onLeave={handleLeave}
              />
            ))}
          </div>
        )}
      </div>

      {messagingMatch && (
        <MessageModal
          match={messagingMatch}
          onClose={() => setMessagingMatch(null)}
        />
      )}
    </main>
  )
}
