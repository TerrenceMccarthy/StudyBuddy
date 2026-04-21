import { render, screen } from '@testing-library/react'
import { vi } from 'vitest'
import PostCard from './PostCard'

vi.mock('../data/mockData', () => ({
  subjectColors: {
    'Computer Science': { bg: '#f0f0f0', text: '#333' }
  }
}))

vi.mock('../utils/time', () => ({
  formatSessionTime: () => 'Apr 20, 10:00 AM',
  timeAgo: () => 'Just now'
}))

const mockPost = {
  id: 1,
  topic: 'Study Session',
  notes: 'Review chapters 1 to 3',
  subject: 'Computer Science',
  building: 'Library',
  duration: '2 hours',
  created_at: new Date().toISOString(),
  time: new Date(Date.now() + 1000000).toISOString(),
}

test('renders PostCard with topic', () => {
  render(<PostCard post={mockPost} index={0} currentUser={{}} onAccept={() => {}} />)
  screen.debug()
  expect(screen.getByText('Study Session')).toBeInTheDocument()
})

test('renders location correctly', () => {
  render(<PostCard post={mockPost} index={0} currentUser={{}} onAccept={() => {}} />)
  expect(screen.getByText(/Library/)).toBeInTheDocument()
})

test('shows join button', () => {
  render(<PostCard post={mockPost} index={0} currentUser={{}} onAccept={() => {}} />)
  expect(screen.getByText('Join Session')).toBeInTheDocument()
})