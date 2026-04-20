import { useTheme } from '../context/ThemeContext'
import styles from './DarkModeToggle.module.css'

export default function DarkModeToggle() {
  const { darkMode, toggleDarkMode } = useTheme()

  return (
    <button
      className={styles.toggle}
      onClick={toggleDarkMode}
      aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
      title={darkMode ? 'Light mode' : 'Dark mode'}
    >
      <span className={styles.track}>
        <span className={styles.thumb}>
          {darkMode ? '🌙' : '☀️'}
        </span>
      </span>
    </button>
  )
}
