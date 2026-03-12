import { useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'  // Add this import for routing
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Profile from './pages/Profile'  // Add this import for the new Profile page
import MyPosts from './pages/MyPosts'
import CreatePostModal from './components/CreatePostModal'
import AcceptModal from './components/AcceptModal'

export default function App() {
  const [showCreate, setShowCreate] = useState(false)
  const [acceptPost, setAcceptPost] = useState(null)

  const handleCreateSubmit = (form) => {
    console.log('New post:', form)
    // Will wire to backend later
  }

  const handleAcceptConfirm = (postId) => {
    console.log('Accepted post:', postId)
    // Will wire to backend later
  }

  return (
    <BrowserRouter>  {/* Wrap the entire app in BrowserRouter for routing */}
      <Navbar onCreatePost={() => setShowCreate(true)} />
      
      <Routes>  {/* Define routes for each page */}
        <Route path="/" element={<Home onAccept={setAcceptPost} />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/posts" element={<MyPosts />} />
        {/* Add more routes here as needed, e.g., <Route path="/settings" element={<Settings />} /> */}
      </Routes>

      {showCreate && (
        <CreatePostModal
          onClose={() => setShowCreate(false)}
          onSubmit={handleCreateSubmit}
        />
      )}

      {acceptPost && (
        <AcceptModal
          post={acceptPost}
          onClose={() => setAcceptPost(null)}
          onConfirm={handleAcceptConfirm}
        />
      )}
    </BrowserRouter>
  )
}