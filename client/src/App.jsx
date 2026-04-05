import { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useUser } from './context/UserContext'
import { supabase } from './lib/supabaseClient'
import { checkForSpam } from './lib/spamDetection'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Profile from './pages/Profile'
import MyPosts from './pages/MyPosts'
import Matches from './pages/Matches'
import Login from './pages/Login'
import Register from './pages/Register'
import CreatePostModal from './components/CreatePostModal'
import AcceptModal from './components/AcceptModal'

function ProtectedRoute({ children }) {
  const { user } = useUser()
  if (!user) return <Navigate to="/login" replace />
  return children
}

function GuestRoute({ children }) {
  const { user } = useUser()
  if (user) return <Navigate to="/" replace />
  return children
}

function AppContent() {
  const { user } = useUser()
  const [showCreate, setShowCreate] = useState(false)
  const [acceptPost, setAcceptPost] = useState(null)
  const [spamError, setSpamError] = useState('')
  const [homeRefreshKey, setHomeRefreshKey] = useState(0)

  const handleCreateSubmit = async (form) => {
    if (!user) return

    setSpamError('')

    // ── Run spam checks before saving ─────────────────
    const spam = await checkForSpam(user.id, form)
    if (!spam.ok) {
      setSpamError(spam.reason)
      return // keep modal open so user sees the error
    }

    const combinedTime = form.date && form.time
      ? new Date(`${form.date}T${form.time}`).toISOString()
      : null

    const { error } = await supabase.from('posts').insert({
      user_id:  user.id,
      course:   form.topic,
      subject:  form.subject,
      topic:    form.notes || '',
      building: form.room ? `${form.building}, ${form.room}` : form.building,
      time:     combinedTime,
      duration: form.duration,
      status:   'open',
    })

    if (error) {
      console.error('Error creating post:', error.message)
      return
    }

    setShowCreate(false)
    setHomeRefreshKey(k => k + 1)
  }

  const handleAcceptConfirm = async (postId) => {
    if (!user) return
    const { error } = await supabase.from('matches').insert({
      post_id: postId,
      user_id: user.id,
    })
    if (error) console.error('Error joining session:', error.message)
  }

  return (
    <>
      <Routes>
        {/* Guest only routes */}
        <Route path="/login" element={<GuestRoute><Login onNavigateToRegister={() => window.location.href = '/register'} /></GuestRoute>} />
        <Route path="/register" element={<GuestRoute><Register onNavigateToLogin={() => window.location.href = '/login'} /></GuestRoute>} />

        {/* Protected routes */}
        <Route path="/" element={<ProtectedRoute><Navbar onCreatePost={() => { setSpamError(''); setShowCreate(true) }} /><Home onAccept={setAcceptPost} refreshKey={homeRefreshKey} /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Navbar onCreatePost={() => { setSpamError(''); setShowCreate(true) }} /><Profile /></ProtectedRoute>} />
        <Route path="/posts" element={<ProtectedRoute><Navbar onCreatePost={() => { setSpamError(''); setShowCreate(true) }} /><MyPosts /></ProtectedRoute>} />
        <Route path="/matches" element={<ProtectedRoute><Navbar onCreatePost={() => { setSpamError(''); setShowCreate(true) }} /><Matches /></ProtectedRoute>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {showCreate && (
        <CreatePostModal
          onClose={() => { setShowCreate(false); setSpamError('') }}
          onSubmit={handleCreateSubmit}
          spamError={spamError}
        />
      )}

      {acceptPost && (
        <AcceptModal
          post={acceptPost}
          onClose={() => setAcceptPost(null)}
          onConfirm={async (postId) => {
            await handleAcceptConfirm(postId)
            setAcceptPost(null)
          }}
        />
      )}
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  )
}
