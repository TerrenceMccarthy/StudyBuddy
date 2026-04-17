import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import ShareModal from './ShareModal'
import { ToastProvider } from '../context/ToastContext'

// Mock clipboard API
Object.assign(navigator, {
  clipboard: {
    writeText: vi.fn(() => Promise.resolve()),
  },
})

describe('ShareModal', () => {
  const mockSession = {
    id: 'test-session-id',
    course: 'CSE 3318',
    topic: 'Algorithms',
    building: 'Central Library',
    duration: '2 hours',
  }

  const mockOnClose = vi.fn()

  const renderShareModal = () => {
    return render(
      <ToastProvider>
        <ShareModal session={mockSession} onClose={mockOnClose} />
      </ToastProvider>
    )
  }

  it('renders share modal with session information', () => {
    renderShareModal()
    
    expect(screen.getByText('Share Session')).toBeInTheDocument()
    expect(screen.getByText('CSE 3318')).toBeInTheDocument()
    expect(screen.getByText(/Central Library/)).toBeInTheDocument()
  })

  it('displays share URL with session ID', () => {
    renderShareModal()
    
    const urlInput = screen.getByDisplayValue(/\/session\/test-session-id/)
    expect(urlInput).toBeInTheDocument()
  })

  it('copies link to clipboard when copy button is clicked', async () => {
    renderShareModal()
    
    const copyButton = screen.getByText('Copy Link')
    fireEvent.click(copyButton)
    
    await waitFor(() => {
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
        expect.stringContaining('/session/test-session-id')
      )
    })
  })

  it('closes modal when close button is clicked', () => {
    renderShareModal()
    
    const closeButton = screen.getByLabelText('Close')
    fireEvent.click(closeButton)
    
    expect(mockOnClose).toHaveBeenCalled()
  })

  it('closes modal when overlay is clicked', () => {
    const { container } = renderShareModal()
    
    const overlay = container.querySelector('[class*="overlay"]')
    fireEvent.click(overlay)
    
    expect(mockOnClose).toHaveBeenCalled()
  })
})
