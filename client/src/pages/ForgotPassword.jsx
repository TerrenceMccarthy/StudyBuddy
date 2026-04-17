import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { validateEmail } from '../utils/validation'
import styles from './Auth.module.css'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    // Validate email
    const emailValidation = validateEmail(email)
    if (!emailValidation.valid) {
      setError(emailValidation.error)
      setLoading(false)
      return
    }

    // Request password reset
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`
    })

    setLoading(false)

    // Always show success message to prevent email enumeration
    if (resetError) {
      console.error('Password reset error:', resetError.message)
    }
    
    setSuccess(true)
  }

  if (success) {
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
            <span className={styles.confirmIcon}>✉️</span>
            <h1 className={styles.heading}>Check your email</h1>
            <p className={styles.sub}>
              If an account exists with that email, we've sent password reset instructions.
            </p>
          </div>

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
          <h1 className={styles.heading}>Reset your password</h1>
          <p className={styles.sub}>Enter your email and we'll send you reset instructions.</p>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
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

          {error && <p className={styles.error}>⚠️ {error}</p>}

          <button className={styles.submitBtn} type="submit" disabled={loading}>
            {loading ? 'Sending...' : 'Send Reset Link'}
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
