import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { validatePassword } from '../utils/validation'
import styles from './Auth.module.css'

export default function ResetPassword() {
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [tokenError, setTokenError] = useState(false)

  useEffect(() => {
    // Check if we have a valid session (from the reset link)
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        setTokenError(true)
      }
    }
    checkSession()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    // Validate password
    const passwordValidation = validatePassword(password)
    if (!passwordValidation.valid) {
      setError(passwordValidation.error)
      setLoading(false)
      return
    }

    // Check passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    // Update password
    const { error: updateError } = await supabase.auth.updateUser({
      password: password
    })

    setLoading(false)

    if (updateError) {
      if (updateError.message.includes('expired') || updateError.message.includes('invalid')) {
        setTokenError(true)
      } else {
        setError(updateError.message)
      }
      return
    }

    // Success - redirect to login
    navigate('/login')
  }

  if (tokenError) {
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
            <span className={styles.confirmIcon}>⚠️</span>
            <h1 className={styles.heading}>Invalid or expired link</h1>
            <p className={styles.sub}>
              This password reset link is invalid or has expired. Please request a new one.
            </p>
          </div>

          <a href="/forgot-password" className={styles.submitBtn} style={{ textAlign: 'center', display: 'block', textDecoration: 'none' }}>
            Request New Link
          </a>

          <p className={styles.switchText}>
            Remember your password?{' '}
            <a href="/login" className={styles.switchLink}>
              Sign in
            </a>
          </p>
        </div>
      </div>
    )
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
          <div className={styles.logo}><span>Study</span><em>Buddy</em></div>
          <h1 className={styles.heading}>Create new password</h1>
          <p className={styles.sub}>Enter a new password for your account.</p>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.field}>
            <label className={styles.label}>New Password</label>
            <input
              className={styles.input}
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
            <p className={styles.fieldHint}>Must be at least 8 characters</p>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Confirm Password</label>
            <input
              className={styles.input}
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          {error && <p className={styles.error}>⚠️ {error}</p>}

          <button className={styles.submitBtn} type="submit" disabled={loading}>
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>

        <p className={styles.switchText}>
          Remember your password?{' '}
          <a href="/login" className={styles.switchLink}>
            Sign in
          </a>
        </p>
      </div>
    </div>
  )
}
