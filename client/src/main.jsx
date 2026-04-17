import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { UserProvider } from './context/UserContext'
import { ToastProvider } from './context/ToastContext'
import App from './App'
import './index.css'  // ← make sure this is still here!

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <UserProvider>
      <ToastProvider>
        <App />
      </ToastProvider>
    </UserProvider>
  </StrictMode>
)