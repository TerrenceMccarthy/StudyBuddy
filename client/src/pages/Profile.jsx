import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useUser } from '../context/UserContext'
import { getSessionStatus } from '../utils/sessionStatus'
import { useSessionActions } from '../hooks/useSessionActions'
import { validateImageFile } from '../utils/validation'
import styles from './Profile.module.css'

const AVATAR_COLORS = [
  '#2d7a6b', '#1565c0', '#6a3fa0', '#b71c5a',
  '#c07d1e', '#e65100', '#2e7d32', '#37474f',
  '#00838f', '#ad1457', '#4527a0', '#283593',
]

const SUBJECTS = ["Computer Science", "Mathematics", "Biology", "Chemistry", "English", "History", "Physics", "Economics"]
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const STUDY_STYLES = ['Collaborative', 'Silent', 'Mixed', 'Discussion-based']
const YEARS = ['Freshman', 'Sophomore', 'Junior', 'Senior', 'Graduate']

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

const SUBJECTS_LIST = ["Computer Science", "Mathematics", "Biology", "Chemistry", "English", "History", "Physics", "Economics"]

function getInitials(name) {
  if (!name) return '?'
  return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
}

function timeAgo(dateStr) {
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000)
  if (diff < 60) return 'Just now'
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)} hr${Math.floor(diff / 3600) > 1 ? 's' : ''} ago`
  if (diff < 604800) return `${Math.floor(diff / 86400)} day${Math.floor(diff / 86400) > 1 ? 's' : ''} ago`
  return new Date(dateStr).toLocaleDateString()
}

function StarRating({ rating }) {
  return (
    <span className={styles.stars}>
      {[1, 2, 3, 4, 5].map(i => (
        <span key={i} style={{ color: i <= Math.round(rating) ? '#c07d1e' : '#ddd' }}>★</span>
      ))}
    </span>
  )
}

export default function Profile() {
  const { user, refreshProfile } = useUser()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [draft, setDraft] = useState({})
  const [activeTab, setActiveTab] = useState('activity')
  const [activity, setActivity] = useState([])
  const [stats, setStats] = useState({ hosted: 0, joined: 0 })
  const [openMenuId, setOpenMenuId] = useState(null) // Track which menu is open
  const [uploadingPicture, setUploadingPicture] = useState(false)
  const [picturePreview, setPicturePreview] = useState(null)
  const [pictureError, setPictureError] = useState(null)
  
  // Use centralized session actions hook
  const {
    showEditModal,
    sessionForm,
    savingSession,
    sessionFormError,
    handleEditSession,
    handleSaveSession,
    handleDeleteSession,
    handleCancelEdit,
    setSessionForm,
  } = useSessionActions()

  // ── Fetch profile ──────────────────────────────────────
  const fetchProfile = async () => {
    setLoading(true)

    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profileData) setProfile(profileData)

    // Fetch hosted posts with full data for editing
    const { data: hostedPosts } = await supabase
      .from('posts')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10)

    // Fetch joined sessions
    const { data: joinedMatches } = await supabase
      .from('matches')
      .select('id, created_at, posts(course, subject, time, status)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10)

    // Merge and sort activity
    const hostedActivity = (hostedPosts || []).map(p => ({
      type: 'hosted',
      id: p.id,
      course: p.course,
      subject: p.subject,
      created_at: p.created_at,
      time: p.time,
      status: p.status,
      // Include full post data for editing
      fullPost: p,
    }))

    const joinedActivity = (joinedMatches || []).map(m => ({
      type: 'joined',
      course: m.posts?.course,
      subject: m.posts?.subject,
      created_at: m.created_at,
      time: m.posts?.time,
      status: m.posts?.status,
    }))

    const merged = [...hostedActivity, ...joinedActivity]
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 8)

    setActivity(merged)
    setStats({
      hosted: hostedPosts?.length || 0,
      joined: joinedMatches?.length || 0,
    })

    setLoading(false)
  }

  useEffect(() => { fetchProfile() }, [user])

  // ── Save profile ───────────────────────────────────────
  const handleSave = async () => {
    setSaving(true)
    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: draft.full_name,
        major: draft.major,
        year: draft.year,
        bio: draft.bio,
        subjects: draft.subjects,
        study_style: draft.study_style,
        availability: draft.availability,
        avatar_color: draft.avatar_color,
      })
      .eq('id', user.id)

    if (!error) {
      setProfile(draft)
      setEditing(false)
      refreshProfile()
    }
    setSaving(false)
  }

  // ── Profile picture upload ─────────────────────────────
  const handlePictureSelect = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file
    const validation = validateImageFile(file)
    if (!validation.valid) {
      setPictureError(validation.error)
      setPicturePreview(null)
      return
    }

    // Clear error and show preview
    setPictureError(null)
    const reader = new FileReader()
    reader.onloadend = () => {
      setPicturePreview(reader.result)
    }
    reader.readAsDataURL(file)

    // Store file for upload
    setDraft(d => ({ ...d, pictureFile: file }))
  }

  const uploadProfilePicture = async (file) => {
    if (!file) return null

    try {
      setUploadingPicture(true)

      // Generate unique filename
      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}-${Date.now()}.${fileExt}`
      const filePath = `${fileName}`

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('profile-pictures')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) throw uploadError

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('profile-pictures')
        .getPublicUrl(filePath)

      // Update profile with picture URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ profile_picture_url: urlData.publicUrl })
        .eq('id', user.id)

      if (updateError) throw updateError

      setUploadingPicture(false)
      return urlData.publicUrl
    } catch (error) {
      console.error('Error uploading profile picture:', error)
      setPictureError('Failed to upload image. Please try again.')
      setUploadingPicture(false)
      return null
    }
  }

  const handleSaveWithPicture = async () => {
    setSaving(true)

    // Upload picture if selected
    let pictureUrl = profile?.profile_picture_url
    if (draft.pictureFile) {
      const uploadedUrl = await uploadProfilePicture(draft.pictureFile)
      if (uploadedUrl) {
        pictureUrl = uploadedUrl
      }
    }

    // Update profile
    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: draft.full_name,
        major: draft.major,
        year: draft.year,
        bio: draft.bio,
        subjects: draft.subjects,
        study_style: draft.study_style,
        availability: draft.availability,
        avatar_color: draft.avatar_color,
      })
      .eq('id', user.id)

    if (!error) {
      setProfile({ ...draft, profile_picture_url: pictureUrl })
      setEditing(false)
      setPicturePreview(null)
      setPictureError(null)
      refreshProfile()
    }
    setSaving(false)
  }

  const toggleSubject = (s) => {
    setDraft(d => ({
      ...d,
      subjects: (d.subjects || []).includes(s)
        ? d.subjects.filter(x => x !== s)
        : [...(d.subjects || []), s]
    }))
  }

  const toggleDay = (day) => {
    setDraft(d => ({
      ...d,
      availability: (d.availability || []).includes(day)
        ? d.availability.filter(x => x !== day)
        : [...(d.availability || []), day]
    }))
  }

  // ── Session editing handlers ───────────────────────────
  const handleEdit = (item) => {
    if (!item.fullPost) return
    handleEditSession(item.fullPost)
  }

  const handleSaveEdit = async () => {
    await handleSaveSession(fetchProfile)
  }

  const handleDelete = async (sessionId) => {
    // Optimistic UI update - remove from activity immediately
    const optimisticDelete = (id) => {
      setActivity(prev => prev.filter(item => item.id !== id))
    }

    // If delete fails, refresh from database
    const onError = () => {
      fetchProfile()
    }

    await handleDeleteSession(sessionId, optimisticDelete, onError)
  }

  if (loading) {
    return (
      <main className={styles.main}>
        <div className={styles.loadingWrap}>
          <p className={styles.loadingText}>Loading profile...</p>
        </div>
      </main>
    )
  }

  const name = profile?.full_name || user?.email || 'Maverick'
  const initials = getInitials(name)
  const availability = profile?.availability || []

  return (
    <main className={styles.main}>
      {/* Hero */}
      <div className={styles.hero}>
        <div className={styles.heroDecor} aria-hidden>
          <div className={styles.decorDot} style={{ top: '20%', left: '10%', animationDelay: '0s' }} />
          <div className={styles.decorDot} style={{ top: '60%', left: '20%', animationDelay: '0.8s' }} />
          <div className={styles.decorDot} style={{ top: '30%', right: '15%', animationDelay: '0.4s' }} />
          <div className={styles.decorDot} style={{ top: '70%', right: '8%', animationDelay: '1.2s' }} />
        </div>

        <div className={styles.profileHeader}>
          <div className={styles.avatarBlock}>
            {profile?.profile_picture_url ? (
              <img 
                src={profile.profile_picture_url} 
                alt={name}
                className={styles.avatarLarge}
                onError={(e) => {
                  // Fallback to initials on error
                  e.target.style.display = 'none'
                  e.target.nextSibling.style.display = 'flex'
                }}
              />
            ) : null}
            <div 
              className={styles.avatarLarge} 
              style={{ 
                background: profile?.avatar_color || '#2d7a6b',
                display: profile?.profile_picture_url ? 'none' : 'flex'
              }}
            >
              {initials}
            </div>
            <div className={styles.avatarStatus} />
          </div>

          <div className={styles.profileMeta}>
            <div className={styles.profileNameRow}>
              <div>
                <h1 className={styles.profileName}>{name}</h1>
                <p className={styles.profileHandle}>{user?.email}</p>
              </div>
              <button
                className={styles.editBtn}
                onClick={() => { setDraft({ ...profile }); setEditing(true) }}
              >
                ✏️ Edit Profile
              </button>
            </div>

            <p className={styles.profileUniversity}>
              🎓 {profile?.year && `${profile.year} · `}{profile?.major && `${profile.major} · `}
              {profile?.university || 'University of Texas at Arlington'}
            </p>

            <p className={styles.profileBio}>
              {profile?.bio || 'No bio yet — click Edit Profile to add one!'}
            </p>

            <div className={styles.profileTags}>
              {(profile?.subjects || []).map(s => {
                const c = SUBJECT_COLORS[s] || { bg: '#f0f0f0', text: '#555' }
                return (
                  <span key={s} className={styles.subjectTag} style={{ background: c.bg, color: c.text }}>
                    {s}
                  </span>
                )
              })}
              {profile?.study_style && (
                <span className={styles.styleTag}>📚 {profile.study_style}</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className={styles.statsBar}>
        <div className={styles.statItem}>
          <span className={styles.statNum}>{stats.hosted + stats.joined}</span>
          <span className={styles.statLabel}>Total Sessions</span>
        </div>
        <div className={styles.statDivider} />
        <div className={styles.statItem}>
          <span className={styles.statNum}>{stats.hosted}</span>
          <span className={styles.statLabel}>Hosted</span>
        </div>
        <div className={styles.statDivider} />
        <div className={styles.statItem}>
          <span className={styles.statNum}>{stats.joined}</span>
          <span className={styles.statLabel}>Joined</span>
        </div>
        <div className={styles.statDivider} />
        <div className={styles.statItem}>
          <span className={styles.statNum}>{user?.email?.split('@')[1] === 'mavs.uta.edu' ? '🤠' : '🎓'}</span>
          <span className={styles.statLabel}>Mav verified</span>
        </div>
      </div>

      {/* Availability Strip */}
      {availability.length > 0 && (
        <div className={styles.availSection}>
          <span className={styles.availLabel}>Available:</span>
          <div className={styles.availDays}>
            {DAYS.map(day => (
              <span
                key={day}
                className={`${styles.dayChip} ${availability.includes(day) ? styles.dayActive : ''}`}
              >
                {day}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === 'activity' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('activity')}
        >
          Recent Activity
        </button>
      </div>

      {/* Activity */}
      <div className={styles.tabContent}>
        {activity.length === 0 ? (
          <div className={styles.empty}>
            <span className={styles.emptyIcon}>📭</span>
            <p className={styles.emptyTitle}>No activity yet</p>
            <p className={styles.emptySub}>Post or join a session to get started!</p>
          </div>
        ) : (
          <div className={styles.activityList}>
            {activity.map((item, i) => {
              const c = SUBJECT_COLORS[item.subject] || { bg: '#f0f0f0', text: '#555' }
              const displayStatus = getSessionStatus({ time: item.time, status: item.status })
              const isExpired = displayStatus === 'expired'
              const canEdit = item.type === 'hosted' && !isExpired
              const menuOpen = openMenuId === item.id
              
              return (
                <div key={i} className={styles.activityRow}>
                  <div
                    className={styles.activityIcon}
                    style={{ background: item.type === 'hosted' ? '#e8f4f0' : '#fef3e2' }}
                  >
                    {item.type === 'hosted' ? '📋' : '🤝'}
                  </div>
                  <div className={styles.activityInfo}>
                    <p className={styles.activityCourse}>{item.course}</p>
                    <p className={styles.activityMeta}>
                      <span>{item.type === 'hosted' ? 'You hosted' : 'You joined'}</span>
                      <span className={styles.dot}>·</span>
                      <span>{timeAgo(item.created_at)}</span>
                      {isExpired && (
                        <>
                          <span className={styles.dot}>·</span>
                          <span className={styles.expiredLabel}>Expired</span>
                        </>
                      )}
                    </p>
                  </div>
                  <span className={styles.activityBadge} style={{ background: c.bg, color: c.text }}>
                    {item.subject}
                  </span>
                  {item.type === 'hosted' && (
                    <div className={styles.menuWrap}>
                      <button 
                        className={styles.menuBtn}
                        onClick={() => setOpenMenuId(menuOpen ? null : item.id)}
                        title="Actions"
                      >
                        ···
                      </button>
                      {menuOpen && (
                        <div className={styles.menu}>
                          {canEdit && (
                            <button onClick={() => { handleEdit(item); setOpenMenuId(null) }}>
                              ✏️ Edit
                            </button>
                          )}
                          <button 
                            className={styles.menuDelete}
                            onClick={() => { handleDelete(item.id); setOpenMenuId(null) }}
                          >
                            🗑 Delete
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editing && (
        <div className={styles.modalBackdrop} onClick={() => setEditing(false)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Edit Profile</h2>
              <button className={styles.modalClose} onClick={() => setEditing(false)}>✕</button>
            </div>

            <div className={styles.modalBody}>
              <label className={styles.fieldLabel}>Profile Picture</label>
              <div className={styles.pictureUploadSection}>
                <div className={styles.picturePreviewWrap}>
                  {picturePreview || profile?.profile_picture_url ? (
                    <img 
                      src={picturePreview || profile.profile_picture_url} 
                      alt="Profile preview"
                      className={styles.picturePreview}
                      onError={(e) => {
                        e.target.style.display = 'none'
                        e.target.nextSibling.style.display = 'flex'
                      }}
                    />
                  ) : null}
                  <div 
                    className={styles.picturePreviewFallback}
                    style={{ 
                      background: draft.avatar_color || profile?.avatar_color || '#2d7a6b',
                      display: (picturePreview || profile?.profile_picture_url) ? 'none' : 'flex'
                    }}
                  >
                    {getInitials(draft.full_name || profile?.full_name || user?.email || '')}
                  </div>
                </div>
                <div className={styles.pictureUploadControls}>
                  <input
                    type="file"
                    id="picture-upload"
                    accept="image/*"
                    onChange={handlePictureSelect}
                    className={styles.pictureInput}
                  />
                  <label htmlFor="picture-upload" className={styles.pictureUploadBtn}>
                    {uploadingPicture ? 'Uploading...' : 'Choose Image'}
                  </label>
                  <p className={styles.pictureHint}>Max 5MB • JPG, PNG, GIF</p>
                  {pictureError && <p className={styles.pictureError}>{pictureError}</p>}
                </div>
              </div>

              <label className={styles.fieldLabel}>Display Name</label>
              <input
                className={styles.fieldInput}
                value={draft.full_name || ''}
                onChange={e => setDraft(d => ({ ...d, full_name: e.target.value }))}
              />

              <label className={styles.fieldLabel}>Bio</label>
              <textarea
                className={styles.fieldTextarea}
                value={draft.bio || ''}
                onChange={e => setDraft(d => ({ ...d, bio: e.target.value }))}
                placeholder="Tell other Mavs about yourself..."
              />

              <div className={styles.fieldRow}>
                <div>
                  <label className={styles.fieldLabel}>Major</label>
                  <input
                    className={styles.fieldInput}
                    value={draft.major || ''}
                    onChange={e => setDraft(d => ({ ...d, major: e.target.value }))}
                  />
                </div>
                <div>
                  <label className={styles.fieldLabel}>Year</label>
                  <select
                    className={styles.fieldInput}
                    value={draft.year || ''}
                    onChange={e => setDraft(d => ({ ...d, year: e.target.value }))}
                  >
                    {YEARS.map(y => <option key={y}>{y}</option>)}
                  </select>
                </div>
              </div>

              <label className={styles.fieldLabel}>Study Style</label>
              <div className={styles.chipGroup}>
                {STUDY_STYLES.map(s => (
                  <button
                    key={s}
                    type="button"
                    className={`${styles.chipBtn} ${draft.study_style === s ? styles.chipActive : ''}`}
                    onClick={() => setDraft(d => ({ ...d, study_style: s }))}
                  >
                    {s}
                  </button>
                ))}
              </div>

              <label className={styles.fieldLabel}>Subjects</label>
              <div className={styles.chipGroup}>
                {SUBJECTS.map(s => {
                  const active = (draft.subjects || []).includes(s)
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

              <label className={styles.fieldLabel}>Availability</label>
              <div className={styles.chipGroup}>
                {DAYS.map(day => (
                  <button
                    key={day}
                    type="button"
                    className={`${styles.chipBtn} ${(draft.availability || []).includes(day) ? styles.chipActive : ''}`}
                    onClick={() => toggleDay(day)}
                  >
                    {day}
                  </button>
                ))}
              </div>

              <label className={styles.fieldLabel}>Icon Color</label>
              <div className={styles.colorPicker}>
                {AVATAR_COLORS.map(color => (
                  <button
                    key={color}
                    type="button"
                    className={styles.colorSwatch}
                    style={{ background: color, outline: draft.avatar_color === color ? `3px solid ${color}` : 'none', outlineOffset: '2px' }}
                    onClick={() => setDraft(d => ({ ...d, avatar_color: color }))}
                    aria-label={color}
                  />
                ))}
              </div>
              {(draft.avatar_color || profile?.avatar_color) && (
                <div className={styles.colorPreview}>
                  <div className={styles.colorPreviewAvatar} style={{ background: draft.avatar_color || profile?.avatar_color }}>
                    {getInitials(draft.full_name || profile?.full_name || user?.email || '')}
                  </div>
                  <span className={styles.colorPreviewLabel}>Preview</span>
                </div>
              )}
            </div>

            <div className={styles.modalFooter}>
              <button className={styles.cancelBtn} onClick={() => setEditing(false)}>Cancel</button>
              <button className={styles.saveBtn} onClick={handleSaveWithPicture} disabled={saving || uploadingPicture}>
                {saving || uploadingPicture ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Session Modal */}
      {showEditModal && (
        <div className={styles.modalBackdrop} onClick={handleCancelEdit}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Edit Session</h2>
              <button className={styles.modalClose} onClick={handleCancelEdit}>✕</button>
            </div>

            <div className={styles.modalBody}>
              <label className={styles.fieldLabel}>Course</label>
              <input 
                className={styles.fieldInput} 
                value={sessionForm.course} 
                onChange={e => setSessionForm(f => ({ ...f, course: e.target.value }))} 
                placeholder="e.g. CSE 3318 — Algorithms" 
              />

              <label className={styles.fieldLabel}>Subject</label>
              <select 
                className={styles.fieldInput} 
                value={sessionForm.subject} 
                onChange={e => setSessionForm(f => ({ ...f, subject: e.target.value }))}
              >
                {SUBJECTS_LIST.map(s => <option key={s}>{s}</option>)}
              </select>

              <label className={styles.fieldLabel}>Topic / Description</label>
              <textarea 
                className={styles.fieldTextarea} 
                value={sessionForm.topic} 
                onChange={e => setSessionForm(f => ({ ...f, topic: e.target.value }))} 
                placeholder="What will you be studying?" 
              />

              <div className={styles.fieldRow}>
                <div>
                  <label className={styles.fieldLabel}>Location</label>
                  <input 
                    className={styles.fieldInput} 
                    value={sessionForm.building} 
                    onChange={e => setSessionForm(f => ({ ...f, building: e.target.value }))} 
                    placeholder="Building & room" 
                  />
                </div>
                <div>
                  <label className={styles.fieldLabel}>Duration</label>
                  <input 
                    className={styles.fieldInput} 
                    value={sessionForm.duration} 
                    onChange={e => setSessionForm(f => ({ ...f, duration: e.target.value }))} 
                    placeholder="e.g. 2 hours" 
                  />
                </div>
              </div>

              <label className={styles.fieldLabel}>Date & Time</label>
              <input
                className={styles.fieldInput}
                type="datetime-local"
                value={sessionForm.time}
                min={new Date().toISOString().slice(0, 16)}
                onChange={e => setSessionForm(f => ({ ...f, time: e.target.value }))}
              />

              {sessionFormError && <p className={styles.formError}>⚠️ {sessionFormError}</p>}
            </div>

            <div className={styles.modalFooter}>
              <button className={styles.cancelBtn} onClick={handleCancelEdit}>Cancel</button>
              <button className={styles.saveBtn} onClick={handleSaveEdit} disabled={savingSession}>
                {savingSession ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
