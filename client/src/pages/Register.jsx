import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import styles from './Auth.module.css'

const ALLOWED_DOMAINS = ['mavs.uta.edu', 'uta.edu']

const SUBJECTS = ["Computer Science", "Mathematics", "Biology", "Chemistry", "English", "History", "Physics", "Economics"]
const YEARS = ["Freshman", "Sophomore", "Junior", "Senior", "Graduate"]
const STUDY_STYLES = ["Collaborative", "Silent", "Mixed", "Discussion-based"]

const SUBJECT_COLORS = {
  'Computer Science': { bg: '#e8f4f0', text: '#2d7a6b' },
  'Mathematics':      { bg: '#fef3e2', text: '#c07d1e' },
  'Biology':          { bg: '#e9f5e9', text: '#2e7d32' },
  'Chemistry':        { bg: '#ede7f6', text: '#6a3fa0' },
  'English':          { bg: '#e3f2fd', text: '#1565c0' },
  'History':          { bg: '#fce4ec', text: '#b71c5a' },
  'Physics':          { bg: '#fff3e0', text: '#e65100' },
  'Economics':        { bg: '#f3e5f5', text: '#6a1b9a' },
}

export default function Register({ onNavigateToLogin }) {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [verified, setVerified] = useState(false)

  const [form, setForm] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    major: '',
    year: 'Freshman',
    university: 'University of Texas at Arlington',
    bio: '',
    subjects: [],
    studyStyle: 'Collaborative',
  })

  const update = (field, value) => setForm(f => ({ ...f, [field]: value }))

  const toggleSubject = (s) => {
    setForm(f => ({
      ...f,
      subjects: f.subjects.includes(s)
        ? f.subjects.filter(x => x !== s)
        : [...f.subjects, s]
    }))
  }

  const handleNext = (e) => {
    e.preventDefault()
    setError('')

    if (step === 1) {
      const domain = form.email.split('@')[1]
      if (!ALLOWED_DOMAINS.includes(domain)) {
        setError('You must use a UTA email address (@mavs.uta.edu or @uta.edu) to register.')
        return
      }
      if (form.password.length < 6) {
        setError('Password must be at least 6 characters.')
        return
      }
      if (form.password !== form.confirmPassword) {
        setError('Passwords do not match.')
        return
      }
    }

    if (step === 2 && !form.name.trim()) {
      setError('Please enter your name.')
      return
    }

    setStep(s => s + 1)
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { error: signUpError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: {
          full_name: form.name,
          major: form.major,
          year: form.year,
          university: form.university,
          bio: form.bio,
          subjects: form.subjects,
          study_style: form.studyStyle,
        }
      }
    })

    if (signUpError) {
      setError(signUpError.message)
      setLoading(false)
      return
    }

    setVerified(true)
    setLoading(false)
  }

  const STEPS = ['Account', 'Profile', 'Preferences']

  // ── Email verification screen ──────────────────────────
  if (verified) {
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
            <div className={styles.confirmIcon}>📬</div>
            <h1 className={styles.heading}>Check your email</h1>
            <p className={styles.sub}>
              We sent a verification link to{' '}
              <strong style={{ color: '#1a1a1a' }}>{form.email}</strong>.
              <br /><br />
              Click the link to activate your account and start studying!
            </p>
          </div>
          <p className={styles.switchText}>
            Wrong email?{' '}
            <button
              className={styles.switchLink}
              onClick={() => { setVerified(false); setStep(1) }}
            >
              Go back
            </button>
          </p>
        </div>
      </div>
    )
  }

  // ── Main register form ─────────────────────────────────
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
          <h1 className={styles.heading}>Create your account</h1>
          <p className={styles.sub}>UTA students only — use your Mav email.</p>
        </div>

        {/* Step Indicator */}
        <div className={styles.stepRow}>
          {STEPS.map((label, i) => (
            <div key={label} className={styles.stepItem}>
              <div
                className={`${styles.stepCircle} ${
                  step > i + 1 ? styles.stepDone : step === i + 1 ? styles.stepActive : ''
                }`}
              >
                {step > i + 1 ? '✓' : i + 1}
              </div>
              <span className={`${styles.stepLabel} ${step === i + 1 ? styles.stepLabelActive : ''}`}>
                {label}
              </span>
            </div>
          ))}
          <div className={styles.stepLine} />
        </div>

        {/* Step 1 — Account */}
        {step === 1 && (
          <form className={styles.form} onSubmit={handleNext}>
            <div className={styles.field}>
              <label className={styles.label}>UTA Email</label>
              <input
                className={styles.input}
                type="email"
                placeholder="yourname@mavs.uta.edu"
                value={form.email}
                onChange={e => update('email', e.target.value)}
                required
              />
              <span className={styles.fieldHint}>Must be a @mavs.uta.edu or @uta.edu address</span>
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Password</label>
              <input
                className={styles.input}
                type="password"
                placeholder="Min. 6 characters"
                value={form.password}
                onChange={e => update('password', e.target.value)}
                required
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Confirm Password</label>
              <input
                className={styles.input}
                type="password"
                placeholder="••••••••"
                value={form.confirmPassword}
                onChange={e => update('confirmPassword', e.target.value)}
                required
              />
            </div>
            {error && <p className={styles.error}>⚠️ {error}</p>}
            <button className={styles.submitBtn} type="submit">Continue →</button>
          </form>
        )}

        {/* Step 2 — Profile */}
        {step === 2 && (
          <form className={styles.form} onSubmit={handleNext}>
            <div className={styles.field}>
              <label className={styles.label}>Full Name</label>
              <input
                className={styles.input}
                type="text"
                placeholder="Your name"
                value={form.name}
                onChange={e => update('name', e.target.value)}
                required
              />
            </div>
            <div className={styles.fieldRow}>
              <div className={styles.field}>
                <label className={styles.label}>Major</label>
                <input
                  className={styles.input}
                  type="text"
                  placeholder="e.g. Computer Science"
                  value={form.major}
                  onChange={e => update('major', e.target.value)}
                />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Year</label>
                <select
                  className={styles.input}
                  value={form.year}
                  onChange={e => update('year', e.target.value)}
                >
                  {YEARS.map(y => <option key={y}>{y}</option>)}
                </select>
              </div>
            </div>
            <div className={styles.field}>
              <label className={styles.label}>
                Bio <span className={styles.optional}>(optional)</span>
              </label>
              <textarea
                className={styles.textarea}
                placeholder="Tell other Mavs a bit about yourself..."
                value={form.bio}
                onChange={e => update('bio', e.target.value)}
              />
            </div>
            {error && <p className={styles.error}>⚠️ {error}</p>}
            <div className={styles.btnRow}>
              <button type="button" className={styles.backBtn} onClick={() => setStep(1)}>← Back</button>
              <button className={styles.submitBtn} type="submit">Continue →</button>
            </div>
          </form>
        )}

        {/* Step 3 — Preferences */}
        {step === 3 && (
          <form className={styles.form} onSubmit={handleRegister}>
            <div className={styles.field}>
              <label className={styles.label}>Subjects you study</label>
              <div className={styles.chipGroup}>
                {SUBJECTS.map(s => {
                  const active = form.subjects.includes(s)
                  const c = SUBJECT_COLORS[s] || { bg: '#f0f0f0', text: '#555' }
                  return (
                    <button
                      key={s}
                      type="button"
                      className={styles.chipBtn}
                      style={active ? { background: c.bg, color: c.text, borderColor: c.text } : {}}
                      onClick={() => toggleSubject(s)}
                    >
                      {s}
                    </button>
                  )
                })}
              </div>
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Study Style</label>
              <div className={styles.chipGroup}>
                {STUDY_STYLES.map(s => (
                  <button
                    key={s}
                    type="button"
                    className={`${styles.chipBtn} ${form.studyStyle === s ? styles.chipActive : ''}`}
                    onClick={() => update('studyStyle', s)}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
            {error && <p className={styles.error}>⚠️ {error}</p>}
            <div className={styles.btnRow}>
              <button type="button" className={styles.backBtn} onClick={() => setStep(2)}>← Back</button>
              <button className={styles.submitBtn} type="submit" disabled={loading}>
                {loading ? 'Creating account...' : 'Create Account'}
              </button>
            </div>
          </form>
        )}

        <p className={styles.switchText}>
          Already have an account?{' '}
          <button className={styles.switchLink} onClick={onNavigateToLogin}>Sign in</button>
        </p>
      </div>
    </div>
  )
}
