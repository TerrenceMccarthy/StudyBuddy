import { useState } from 'react'
import { Link } from 'react-router-dom'
import styles from './Navbar.module.css'

export default function Navbar({ onCreatePost }) {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <nav className={styles.nav}>
      <div className={styles.inner}>
        <a href="/" className={styles.logo}>
          <span className={styles.logoIcon}>📚</span>
          <span className={styles.logoText}>Study<em>Buddy</em></span>
        </a>

        <div className={styles.links}>
          <Link to="/" className={`${styles.link} ${styles.active}`}>Browse</Link>
          <Link to="/posts" className={styles.link}>My Posts</Link>
          <Link to="/matches" className={styles.link}>Matches</Link>
        </div>

        <div className={styles.actions}>
          <button className={styles.postBtn} onClick={onCreatePost}>
            <span className={styles.plus}>+</span> Post a Session
          </button>
          <Link to="/profile" className={styles.avatarLink}>
            <div className={styles.avatar}>JD</div>
          </Link>
        </div>
      </div>
    </nav>
  )
}
