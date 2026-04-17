import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import EmptyState from './EmptyState'

describe('EmptyState', () => {
  it('renders icon, title, and message', () => {
    render(
      <EmptyState
        icon="📚"
        title="No sessions found"
        message="Try adjusting your filters!"
      />
    )

    expect(screen.getByText('📚')).toBeInTheDocument()
    expect(screen.getByText('No sessions found')).toBeInTheDocument()
    expect(screen.getByText('Try adjusting your filters!')).toBeInTheDocument()
  })

  it('renders without action button when action prop is not provided', () => {
    render(
      <EmptyState
        icon="📚"
        title="No sessions found"
        message="Try adjusting your filters!"
      />
    )

    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('renders action button when action prop is provided', () => {
    const mockOnClick = vi.fn()
    
    render(
      <EmptyState
        icon="📝"
        title="No posts yet"
        message="Create your first study session!"
        action={{
          label: 'Create Session',
          onClick: mockOnClick
        }}
      />
    )

    const button = screen.getByRole('button', { name: 'Create Session' })
    expect(button).toBeInTheDocument()
  })

  it('calls action onClick handler when button is clicked', async () => {
    const user = userEvent.setup()
    const mockOnClick = vi.fn()
    
    render(
      <EmptyState
        icon="📝"
        title="No posts yet"
        message="Create your first study session!"
        action={{
          label: 'Create Session',
          onClick: mockOnClick
        }}
      />
    )

    const button = screen.getByRole('button', { name: 'Create Session' })
    await user.click(button)

    expect(mockOnClick).toHaveBeenCalledTimes(1)
  })

  it('displays friendly encouraging message', () => {
    render(
      <EmptyState
        icon="🎯"
        title="No activity yet"
        message="Post or join a session to get started!"
      />
    )

    expect(screen.getByText('Post or join a session to get started!')).toBeInTheDocument()
  })
})
