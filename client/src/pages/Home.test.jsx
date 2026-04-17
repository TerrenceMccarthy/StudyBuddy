import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import Home from './Home'
import { supabase } from '../lib/supabaseClient'

// Mock Supabase client
vi.mock('../lib/supabaseClient', () => ({
  supabase: {
    from: vi.fn()
  }
}))

// Mock PostCard component
vi.mock('../components/PostCard', () => ({
  default: ({ post }) => <div data-testid="post-card">{post.course}</div>
}))

describe('Home - Expired Session Filtering', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should filter out expired sessions by querying only future sessions', async () => {
    const mockSelect = vi.fn().mockReturnThis()
    const mockEq = vi.fn().mockReturnThis()
    const mockGt = vi.fn().mockReturnThis()
    const mockOrder = vi.fn().mockResolvedValue({
      data: [
        {
          id: '1',
          course: 'CSE 101',
          subject: 'Computer Science',
          time: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
          status: 'open',
          profiles: { full_name: 'John Doe', avatar_color: '#ff0000' },
          matches: []
        }
      ],
      error: null
    })

    supabase.from.mockReturnValue({
      select: mockSelect,
      eq: mockEq,
      gt: mockGt,
      order: mockOrder
    })

    mockSelect.mockReturnValue({
      eq: mockEq,
      gt: mockGt,
      order: mockOrder
    })

    mockEq.mockReturnValue({
      gt: mockGt,
      order: mockOrder
    })

    mockGt.mockReturnValue({
      order: mockOrder
    })

    render(<Home onAccept={vi.fn()} refreshKey={0} />)

    await waitFor(() => {
      expect(supabase.from).toHaveBeenCalledWith('posts')
    })

    // Verify that gt() was called with current time to filter expired sessions
    await waitFor(() => {
      expect(mockGt).toHaveBeenCalledWith('time', expect.any(String))
    })

    // Verify the ISO string format is used
    const gtCall = mockGt.mock.calls[0]
    expect(gtCall[0]).toBe('time')
    expect(gtCall[1]).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)
  })

  it('should only display future sessions in the UI', async () => {
    const futureTime = new Date(Date.now() + 86400000).toISOString()
    
    const mockChain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      gt: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({
        data: [
          {
            id: '1',
            course: 'CSE 101',
            subject: 'Computer Science',
            time: futureTime,
            status: 'open',
            profiles: { full_name: 'John Doe', avatar_color: '#ff0000' },
            matches: []
          }
        ],
        error: null
      })
    }

    supabase.from.mockReturnValue(mockChain)

    render(<Home onAccept={vi.fn()} refreshKey={0} />)

    await waitFor(() => {
      expect(screen.getByText('CSE 101')).toBeInTheDocument()
    })

    // Verify only one session is displayed (the future one)
    const postCards = screen.getAllByTestId('post-card')
    expect(postCards).toHaveLength(1)
  })
})
