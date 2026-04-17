import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useUser } from '../context/UserContext'
import PostCard from '../components/PostCard'
import styles from './Home.module.css'

const FILTERS = ["All", "Computer Science", "Mathematics", "Biology", "Chemistry", "English", "History", "Business", "Psychology", "Physics", "Medical", "Arts"]

export default function Home({ onAccept, onShare, refreshKey }) {
  const { profile } = useUser()
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState("All")
  const [search, setSearch] = useState("")

  const fetchPosts = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('posts')
      .select(`
        *,
        profiles ( full_name, avatar_color, profile_picture_url ),
        matches ( count )
      `)
      .eq('status', 'open')
      .gt('time', new Date().toISOString())   // ← only future sessions
      .order('time', { ascending: true })      // ← soonest first by default

    if (!error) {
      const withCount = data.map(p => ({
        ...p,
        match_count: p.matches?.[0]?.count || 0,
        host_name: p.profiles?.full_name || 'Unknown',
        host_avatar_color: p.profiles?.avatar_color || null,
        profile_picture_url: p.profiles?.profile_picture_url || null,
      }))
      setPosts(withCount)
    }
    setLoading(false)
  }

  useEffect(() => { fetchPosts() }, [refreshKey])

  const handleModeratorDelete = async (post) => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token

      if (!token) {
        alert('Authentication required')
        return
      }

      const response = await fetch(`http://localhost:5000/api/moderation/sessions/${post.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        // Remove from local state
        setPosts(prev => prev.filter(p => p.id !== post.id))
        alert('Session deleted successfully')
      } else {
        const error = await response.json()
        alert(`Failed to delete session: ${error.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Error deleting session:', error)
      alert('Failed to delete session')
    }
  }

  const handleModeratorClose = async (post) => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token

      if (!token) {
        alert('Authentication required')
        return
      }

      const response = await fetch(`http://localhost:5000/api/moderation/sessions/${post.id}/close`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        // Update local state
        setPosts(prev => prev.map(p => 
          p.id === post.id ? { ...p, status: 'closed' } : p
        ))
        alert('Session closed successfully')
      } else {
        const error = await response.json()
        alert(`Failed to close session: ${error.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Error closing session:', error)
      alert('Failed to close session')
    }
  }

  const filtered = posts.filter(p => {
    const matchFilter = activeFilter === "All" || p.subject === activeFilter
    const matchSearch = !search ||
      p.topic.toLowerCase().includes(search.toLowerCase()) ||
      p.building.toLowerCase().includes(search.toLowerCase()) ||
      p.subject.toLowerCase().includes(search.toLowerCase()) ||
      p.course.toLowerCase().includes(search.toLowerCase())
    return matchFilter && matchSearch
  })

  const openCount = posts.length

  return (
    <main className={styles.main}>
      <div className={styles.hero}>
        <div className={styles.heroInner}>
          <p className={styles.heroEyebrow}>📖 {openCount} open session{openCount !== 1 ? 's' : ''} near you</p>
          <h1 className={styles.heroTitle}>
            Find your<br /><em>study buddy</em>
          </h1>
          <p className={styles.heroSub}>
            Connect with fellow students, share knowledge, and ace your exams together.
          </p>
        </div>
        <div className={styles.heroDecor} aria-hidden>
          <div className={styles.decorDot} style={{ top: '20%', left: '10%', animationDelay: '0s' }} />
          <div className={styles.decorDot} style={{ top: '60%', left: '20%', animationDelay: '0.8s' }} />
          <div className={styles.decorDot} style={{ top: '30%', right: '15%', animationDelay: '0.4s' }} />
          <div className={styles.decorDot} style={{ top: '70%', right: '8%', animationDelay: '1.2s' }} />
        </div>
      </div>

      <div className={styles.controls}>
        <div className={styles.searchWrap}>
          <span className={styles.searchIcon}>🔍</span>
          <input
            className={styles.searchInput}
            type="text"
            placeholder="Search by course, topic, or location..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && (
            <button className={styles.clearSearch} onClick={() => setSearch('')}>✕</button>
          )}
        </div>

        <div className={styles.filters}>
          {FILTERS.map(f => (
            <button
              key={f}
              className={`${styles.filterBtn} ${activeFilter === f ? styles.filterActive : ''}`}
              onClick={() => setActiveFilter(f)}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.feedHeader}>
          <span className={styles.feedCount}>
            {filtered.length} session{filtered.length !== 1 ? 's' : ''}
            {activeFilter !== 'All' ? ` in ${activeFilter}` : ''}
          </span>
          <select className={styles.sortSelect}>
            <option>Soonest first</option>
            <option>Most recent</option>
            <option>By subject</option>
          </select>
        </div>

        {loading ? (
          <div className={styles.empty}>
            <span className={styles.emptyIcon}>⏳</span>
            <p className={styles.emptyTitle}>Loading sessions...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className={styles.empty}>
            <span className={styles.emptyIcon}>🔎</span>
            <p className={styles.emptyTitle}>No sessions found</p>
            <p className={styles.emptySub}>Try adjusting your filters or be the first to post one!</p>
          </div>
        ) : (
          <div className={styles.grid}>
            {filtered.map((post, i) => (
              <PostCard
                key={post.id}
                post={post}
                index={i}
                onAccept={onAccept}
                onShare={onShare}
                currentUser={profile}
                onModeratorDelete={handleModeratorDelete}
                onModeratorClose={handleModeratorClose}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
