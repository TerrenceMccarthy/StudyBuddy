import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useUser } from '../context/UserContext'
import styles from './Navbar.module.css'

function getInitials(name) {
  if (!name) return '?'
  return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
}

export default function Navbar({ onCreatePost }) {
  const location = useLocation()
  const { user, profile, logout } = useUser()
  const [menuOpen, setMenuOpen] = useState(false)

  const fullName = user?.user_metadata?.full_name || user?.email || ''
  const initials = getInitials(fullName)

  const isActive = (path) => location.pathname === path

  return (
    <nav className={styles.nav}>
      <div className={styles.inner}>
        <a href="/" className={styles.logo}>
          <span className={styles.logoIcon}>📚</span>
          <span className={styles.logoText}>Study<em>Buddy</em></span>
        </a>

        <div className={styles.links}>
          <Link to="/" className={`${styles.link} ${isActive('/') ? styles.active : ''}`}>
            Browse
          </Link>
          <Link to="/posts" className={`${styles.link} ${isActive('/posts') ? styles.active : ''}`}>
            My Posts
          </Link>
          <Link to="/matches" className={`${styles.link} ${isActive('/matches') ? styles.active : ''}`}>
            Matches
          </Link>
        </div>

        <div className={styles.actions}>
          <button className={styles.postBtn} onClick={onCreatePost}>
            <span className={styles.plus}>+</span> Post a Session
          </button>

          <div className={styles.avatarWrap}>
            <button
              className={styles.avatarBtn}
              onClick={() => setMenuOpen(o => !o)}
            >
              <div className={styles.avatar} style={{ background: profile?.avatar_color || undefined }}>{initials}</div>
            </button>

            {menuOpen && (
              <div className={styles.dropdown}>
                <Link
                  to="/profile"
                  className={styles.dropdownItem}
                  onClick={() => setMenuOpen(false)}
                >
                  👤 Profile
                </Link>
                <button
                  className={`${styles.dropdownItem} ${styles.dropdownLogout}`}
                  onClick={() => { logout(); setMenuOpen(false) }}
                >
                  🚪 Log Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
