import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useUser } from '../context/UserContext'
import DarkModeToggle from './DarkModeToggle'
import styles from './Navbar.module.css'

function getInitials(name) {
  if (!name) return '?'
  return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
}

export default function Navbar({ onCreatePost }) {
  const location = useLocation()
  const { user, profile, logout } = useUser()
  const [menuOpen, setMenuOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  // Close mobile menu on navigation
  useEffect(() => { setMobileOpen(false) }, [location.pathname])

  const fullName = profile?.full_name || user?.user_metadata?.full_name || user?.email || ''
  const initials = getInitials(fullName)
  const isActive = (path) => location.pathname === path

  return (
    <nav className={styles.nav}>
      <div className={styles.inner}>
        <a href="/" className={styles.logo}>
          <span className={styles.logoIcon}>📚</span>
          <span className={styles.logoText}>Study<em>Buddy</em></span>
        </a>

        {/* Desktop nav links */}
        <div className={styles.links}>
          <Link to="/" className={`${styles.link} ${isActive('/') ? styles.active : ''}`}>Browse</Link>
          <Link to="/posts" className={`${styles.link} ${isActive('/posts') ? styles.active : ''}`}>My Posts</Link>
          <Link to="/matches" className={`${styles.link} ${isActive('/matches') ? styles.active : ''}`}>Matches</Link>
        </div>

        <div className={styles.actions}>
          {/* Dark mode toggle */}
          <DarkModeToggle />

          {/* Desktop post button */}
          <button className={styles.postBtn} onClick={onCreatePost}>
            <span className={styles.plus}>+</span> Post a Session
          </button>

          {/* Avatar + dropdown */}
          <div className={styles.avatarWrap}>
            <button className={styles.avatarBtn} onClick={() => setMenuOpen(o => !o)}>
              {profile?.profile_picture_url ? (
                <img src={profile.profile_picture_url} alt={fullName} className={styles.avatarImg} />
              ) : (
                <div className={styles.avatar} style={{ background: profile?.avatar_color || undefined }}>{initials}</div>
              )}
            </button>
            {menuOpen && (
              <div className={styles.dropdown}>
                <Link to="/profile" className={styles.dropdownItem} onClick={() => setMenuOpen(false)}>
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

          {/* Hamburger — mobile only */}
          <button
            className={styles.hamburger}
            onClick={() => setMobileOpen(o => !o)}
            aria-label="Menu"
          >
            <span className={mobileOpen ? styles.barTop : ''} />
            <span className={mobileOpen ? styles.barMid : ''} />
            <span className={mobileOpen ? styles.barBot : ''} />
          </button>
        </div>
      </div>

      {/* Mobile dropdown menu */}
      {mobileOpen && (
        <div className={styles.mobileMenu}>
          <Link to="/" className={`${styles.mobileLink} ${isActive('/') ? styles.mobileLinkActive : ''}`} onClick={() => setMobileOpen(false)}>Browse</Link>
          <Link to="/posts" className={`${styles.mobileLink} ${isActive('/posts') ? styles.mobileLinkActive : ''}`} onClick={() => setMobileOpen(false)}>My Posts</Link>
          <Link to="/matches" className={`${styles.mobileLink} ${isActive('/matches') ? styles.mobileLinkActive : ''}`} onClick={() => setMobileOpen(false)}>Matches</Link>
          <button className={styles.mobilePostBtn} onClick={() => { onCreatePost(); setMobileOpen(false) }}>
            + Post a Session
          </button>
          <div className={styles.mobileDarkToggle}>
            <span className={styles.mobileDarkLabel}>Dark mode</span>
            <DarkModeToggle />
          </div>
        </div>
      )}
    </nav>
  )
}
