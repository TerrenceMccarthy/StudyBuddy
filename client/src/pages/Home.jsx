import { useState } from 'react'
import { mockPosts } from '../data/mockData'
import PostCard from '../components/PostCard'
import styles from './Home.module.css'

const FILTERS = ["All", "Computer Science", "Mathematics", "Biology", "Chemistry", "English", "History"]

export default function Home({ onAccept }) {
  const [posts, setPosts] = useState(mockPosts)
  const [activeFilter, setActiveFilter] = useState("All")
  const [search, setSearch] = useState("")

  const filtered = posts.filter(p => {
    const matchFilter = activeFilter === "All" || p.subject === activeFilter
    const matchSearch = !search || p.topic.toLowerCase().includes(search.toLowerCase()) ||
      p.building.toLowerCase().includes(search.toLowerCase()) ||
      p.subject.toLowerCase().includes(search.toLowerCase())
    return matchFilter && matchSearch
  })

  const openCount = posts.filter(p => p.status === 'open').length

  return (
    <main className={styles.main}>
      <div className={styles.hero}>
        <div className={styles.heroInner}>
          <p className={styles.heroEyebrow}>📖 {openCount} open sessions near you</p>
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
            <option>Most recent</option>
            <option>Soonest first</option>
            <option>By subject</option>
          </select>
        </div>

        {filtered.length === 0 ? (
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
              />
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
