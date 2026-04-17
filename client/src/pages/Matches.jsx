import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useUser } from '../context/UserContext'
import styles from './Matches.module.css'

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

function getInitials(name) {
  if (!name) return '?'
  return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
}

function getAvatarColor(str) {
  const colors = ['#2d7a6b', '#c07d1e', '#2e7d32', '#6a3fa0', '#1565c0', '#b71c5a']
  let hash = 0
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash)
  return colors[Math.abs(hash) % colors.length]
}

function getStatus(sessionTime) {
  return new Date(sessionTime) > new Date() ? 'upcoming' : 'completed'
}

function MatchCard({ match, onMessage, onLeave }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const post = match.posts
  const hostName = post?.profiles?.full_name || 'Unknown'
  const hostAvatarColor = post?.profiles?.avatar_color || getAvatarColor(hostName)
  const profilePictureUrl = post?.profiles?.profile_picture_url || null
  const subjectColor = SUBJECT_COLORS[post?.subject] || { bg: '#f0f0f0', text: '#555' }
  const status = STATUS_CONFIG[getStatus(post?.time)]

  return (
    <div className={`${styles.card} ${getStatus(post?.time) === 'completed' ? styles.cardDim : ''}`}>
      <div className={styles.cardHeader}>
        <div className={styles.avatarWrap}>
          {profilePictureUrl ? (
            <img 
              src={profilePictureUrl} 
              alt={hostName}
              className={styles.avatar}
              onError={(e) => {
                e.target.style.display = 'none'
                e.target.nextSibling.style.display = 'flex'
              }}
            />
          ) : null}
          <div className={styles.avatar} style={{ 
            background: hostAvatarColor,
            display: profilePictureUrl ? 'none' : 'flex'
          }}>
            {getInitials(hostName)}
          </div>
          <div className={styles.posterInfo}>
            <span className={styles.posterName}>{hostName}</span>
            <span className={styles.postedAgo}>{timeAgo(match.created_at)}</span>
          </div>
        </div>
        <div className={styles.headerRight}>
          <span
            className={styles.subjectBadge}
            style={{ background: subjectColor.bg, color: subjectColor.text }}
          >
            {post?.subject}
          </span>
          <div className={styles.menuWrap}>
            <button className={styles.menuBtn} onClick={() => setMenuOpen(o => !o)}>···</button>
            {menuOpen && (
              <div className={styles.menu}>
                <button onClick={() => { onMessage(match); setMenuOpen(false) }}>
                  💬 Message Host
                </button>
                <button onClick={() => setMenuOpen(false)}>
                  📋 View Details
                </button>
                {getStatus(post?.time) === 'upcoming' && (
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

      <h3 className={styles.courseTitle}>{post?.course}</h3>

      <div className={styles.topicBox}>
        <p className={styles.topicText}>{post?.topic}</p>
      </div>

      <div className={styles.meta}>
        <span>📍 {post?.building}</span>
        <span>🕐 {formatTime(post?.time)}</span>
        <span>⏱ {post?.duration}</span>
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
            👥 {post?.matches?.[0]?.count || 0} joined
          </span>
          {getStatus(post?.time) === 'upcoming' && (
            <button className={styles.msgBtn} onClick={() => onMessage(match)}>
              💬
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

function MessageModal({ match, onClose }) {
  const { user } = useUser()
  const [msg, setMsg] = useState('')
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [posting, setPosting] = useState(false)

  const postId = match?.posts?.id

  const fetchMessages = async () => {
    const { data, error } = await supabase
      .from('messages')
      .select('id, text, created_at, sender_id')
      .eq('post_id', postId)
      .order('created_at', { ascending: true })

    if (error) { console.error('fetch messages error:', error); setLoading(false); return }

    // Fetch sender names separately to avoid FK join issues
    const senderIds = [...new Set((data || []).map(m => m.sender_id))]
    let nameMap = {}
    if (senderIds.length > 0) {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', senderIds)
      ;(profiles || []).forEach(p => { nameMap[p.id] = p.full_name })
    }

    setMessages((data || []).map(m => ({ ...m, senderName: nameMap[m.sender_id] || 'Unknown' })))
    setLoading(false)
  }

  useEffect(() => {
    if (!postId) return
    fetchMessages()
  }, [postId])

  const handleSend = async () => {
    if (!msg.trim() || !user) return
    setPosting(true)
    const text = msg.trim()
    setMsg('')
    const { error } = await supabase.from('messages').insert({ post_id: postId, sender_id: user.id, text })
    if (error) { console.error('send message error:', error); setMsg(text) }
    await fetchMessages()
    setPosting(false)
  }

  if (!match) return null
  const post = match.posts
  const hostName = post?.profiles?.full_name || 'Host'
  const hostAvatarColor = post?.profiles?.avatar_color || getAvatarColor(hostName)
  const profilePictureUrl = post?.profiles?.profile_picture_url || null

  return (
    <div className={styles.modalBackdrop} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <div className={styles.modalTitleRow}>
            {profilePictureUrl ? (
              <img 
                src={profilePictureUrl} 
                alt={hostName}
                className={styles.avatar}
                style={{ width: 32, height: 32, fontSize: '0.65rem' }}
                onError={(e) => {
                  e.target.style.display = 'none'
                  e.target.nextSibling.style.display = 'flex'
                }}
              />
            ) : null}
            <div className={styles.avatar} style={{ 
              background: hostAvatarColor, 
              width: 32, 
              height: 32, 
              fontSize: '0.65rem',
              display: profilePictureUrl ? 'none' : 'flex'
            }}>
              {getInitials(hostName)}
            </div>
            <div>
              <p className={styles.modalTitle}>{hostName}</p>
              <p className={styles.modalSub}>{post?.course}</p>
            </div>
          </div>
          <button className={styles.modalClose} onClick={onClose}>✕</button>
        </div>

        <div className={styles.chatBody}>
          {loading ? (
            <p className={styles.chatEmpty}>Loading messages...</p>
          ) : messages.length === 0 ? (
            <p className={styles.chatEmpty}>No messages yet. Say hi! 👋</p>
          ) : (
            messages.map((m) => {
              const isMe = m.sender_id === user?.id
              return (
                <div key={m.id} className={`${styles.bubble} ${isMe ? styles.bubbleMe : styles.bubbleThem}`}>
                  {!isMe && (
                    <span className={styles.bubbleName}>{m.senderName}</span>
                  )}
                  <p className={styles.bubbleText}>{m.text}</p>
                  <span className={styles.bubbleTime}>
                    {new Date(m.created_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                  </span>
                </div>
              )
            })
          )}
        </div>

        <div className={styles.chatInput}>
          <input
            className={styles.chatField}
            placeholder="Type a message..."
            value={msg}
            onChange={e => setMsg(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
          />
          <button className={styles.sendBtn} onClick={handleSend} disabled={posting}>
            {posting ? '...' : 'Post'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function Matches() {
  const { user } = useUser()
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState('all')
  const [messagingMatch, setMessagingMatch] = useState(null)

  const FILTERS = [
    { key: 'all', label: 'All' },
    { key: 'upcoming', label: 'Upcoming' },
    { key: 'completed', label: 'Completed' },
  ]

  // ── Fetch user's matches ───────────────────────────────
  const fetchMatches = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('matches')
      .select(`
        id,
        created_at,
        posts (
          id,
          course,
          subject,
          topic,
          building,
          time,
          duration,
          status,
          user_id,
          profiles ( full_name, avatar_color, profile_picture_url ),
          matches ( count )
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (!error) setMatches(data)
    setLoading(false)
  }

  useEffect(() => { fetchMatches() }, [user])

  const filtered = matches.filter(m => {
    const status = getStatus(m.posts?.time)
    return activeFilter === 'all' || status === activeFilter
  })

  const stats = {
    total: matches.length,
    upcoming: matches.filter(m => getStatus(m.posts?.time) === 'upcoming').length,
    completed: matches.filter(m => getStatus(m.posts?.time) === 'completed').length,
  }

  const handleLeave = async (matchId) => {
    await supabase.from('matches').delete().eq('id', matchId)
    setMatches(ms => ms.filter(m => m.id !== matchId))
  }

  if (loading) {
    return (
      <main className={styles.main}>
        <div className={styles.loadingWrap}>
          <p className={styles.loadingText}>Loading your matches...</p>
        </div>
      </main>
    )
  }

  return (
    <main className={styles.main}>
      {/* Hero */}
      <div className={styles.hero}>
        <div className={styles.heroInner}>
          <p className={styles.heroEyebrow}>🤝 {stats.upcoming} upcoming session{stats.upcoming !== 1 ? 's' : ''}</p>
          <h1 className={styles.heroTitle}>My<br /><em>Matches</em></h1>
          <p className={styles.heroSub}>Sessions you've joined — connect, show up, and study together.</p>
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
