import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import Profile from './Profile'
import { supabase } from '../lib/supabaseClient'

// Mock UserContext
vi.mock('../context/UserContext', () => ({
  useUser: vi.fn(() => ({
    user: {
      id: 'user-123',
      email: 'test@mavs.uta.edu'
    },
    refreshProfile: vi.fn()
  }))
}))

// Mock Supabase
vi.mock('../lib/supabaseClient', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(),
          order: vi.fn(() => ({
            limit: vi.fn()
          }))
        }))
      })),
      update: vi.fn(() => ({
        eq: vi.fn()
      }))
    }))
  }
}))

const renderWithRouter = (component) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  )
}

describe('Profile - Expired Session Display', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should display expired label for sessions with past time', async () => {
    const pastTime = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() // 1 day ago
    
    // Mock profile data
    const mockProfileData = {
      id: 'user-123',
      full_name: 'Test User',
      email: 'test@mavs.uta.edu'
    }

    // Mock hosted posts with expired session
    const mockHostedPosts = [
      {
        id: 'post-1',
        course: 'CSE 3318',
        subject: 'Computer Science',
        created_at: pastTime,
        time: pastTime,
        status: 'open'
      }
    ]

    // Mock joined matches
    const mockJoinedMatches = []

    // Setup mock responses
    supabase.from.mockImplementation((table) => {
      if (table === 'profiles') {
        return {
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              single: vi.fn(() => Promise.resolve({ data: mockProfileData, error: null }))
            }))
          }))
        }
      }
      if (table === 'posts') {
        return {
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              order: vi.fn(() => ({
                limit: vi.fn(() => Promise.resolve({ data: mockHostedPosts, error: null }))
              }))
            }))
          }))
        }
      }
      if (table === 'matches') {
        return {
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              order: vi.fn(() => ({
                limit: vi.fn(() => Promise.resolve({ data: mockJoinedMatches, error: null }))
              }))
            }))
          }))
        }
      }
    })

    renderWithRouter(<Profile />)

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('CSE 3318')).toBeInTheDocument()
    })

    // Check that expired label is displayed
    await waitFor(() => {
      expect(screen.getByText('Expired')).toBeInTheDocument()
    })
  })

  it('should not display expired label for future sessions', async () => {
    const futureTime = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 1 day from now
    
    const mockProfileData = {
      id: 'user-123',
      full_name: 'Test User',
      email: 'test@mavs.uta.edu'
    }

    const mockHostedPosts = [
      {
        id: 'post-1',
        course: 'CSE 3318',
        subject: 'Computer Science',
        created_at: new Date().toISOString(),
        time: futureTime,
        status: 'open'
      }
    ]

    const mockJoinedMatches = []

    supabase.from.mockImplementation((table) => {
      if (table === 'profiles') {
        return {
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              single: vi.fn(() => Promise.resolve({ data: mockProfileData, error: null }))
            }))
          }))
        }
      }
      if (table === 'posts') {
        return {
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              order: vi.fn(() => ({
                limit: vi.fn(() => Promise.resolve({ data: mockHostedPosts, error: null }))
              }))
            }))
          }))
        }
      }
      if (table === 'matches') {
        return {
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              order: vi.fn(() => ({
                limit: vi.fn(() => Promise.resolve({ data: mockJoinedMatches, error: null }))
              }))
            }))
          }))
        }
      }
    })

    renderWithRouter(<Profile />)

    await waitFor(() => {
      expect(screen.getByText('CSE 3318')).toBeInTheDocument()
    })

    // Expired label should not be present
    expect(screen.queryByText('Expired')).not.toBeInTheDocument()
  })
})

