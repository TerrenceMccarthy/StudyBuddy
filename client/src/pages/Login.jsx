import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import styles from './Auth.module.css'

export default function Login({ onNavigateToRegister }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError(error.message)
    }
    // If successful, UserContext will automatically update
    // and your app can redirect to Home

    setLoading(false)
  }

  return (
    <div className={styles.page}>
      <div className={styles.heroDecor} aria-hidden>
        <div className={styles.decorDot} style={{ top: '10%', left: '5%', animationDelay: '0s' }} />
        <div className={styles.decorDot} style={{ top: '70%', left: '8%', animationDelay: '0.8s' }} />
        <div className={styles.decorDot} style={{ top: '20%', right: '6%', animationDelay: '0.4s' }} />
        <div className={styles.decorDot} style={{ top: '75%', right: '10%', animationDelay: '1.2s' }} />
      </div>

      <div className={styles.card}>
        <div className={styles.cardTop}>
          <div className={styles.logo}>📖 <span>Study</span><em>Buddy</em></div>
          <h1 className={styles.heading}>Welcome back</h1>
          <p className={styles.sub}>Sign in to find your next study session.</p>
        </div>

        <form className={styles.form} onSubmit={handleLogin}>
          <div className={styles.field}>
            <label className={styles.label}>Email</label>
            <input
              className={styles.input}
              type="email"
              placeholder="you@university.edu"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Password</label>
            <input
              className={styles.input}
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>

          {error && <p className={styles.error}>⚠️ {error}</p>}

          <button className={styles.submitBtn} type="submit" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className={styles.divider}><span>or</span></div>

        <p className={styles.switchText}>
          Don't have an account?{' '}
          <button className={styles.switchLink} onClick={onNavigateToRegister}>
            Sign up
          </button>
        </p>
      </div>
    </div>
  )
}
