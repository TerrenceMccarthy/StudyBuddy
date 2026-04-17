import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Toast from './Toast'

describe('Toast Component', () => {
  let onDismissMock
  
  beforeEach(() => {
    onDismissMock = vi.fn()
    vi.useFakeTimers()
  })
  
  afterEach(() => {
    vi.restoreAllMocks()
    vi.useRealTimers()
  })

  it('renders success toast with message', () => {
    render(
      <Toast 
        id={1} 
        message="Operation successful!" 
        type="success" 
        onDismiss={onDismissMock} 
      />
    )
    
    expect(screen.getByText('Operation successful!')).toBeInTheDocument()
    expect(screen.getByText('✓')).toBeInTheDocument()
  })

  it('renders error toast with message', () => {
    render(
      <Toast 
        id={2} 
        message="An error occurred" 
        type="error" 
        onDismiss={onDismissMock} 
      />
    )
    
    expect(screen.getByText('An error occurred')).toBeInTheDocument()
    expect(screen.getAllByText('✕')).toHaveLength(2) // Icon and dismiss button
  })

  it('renders info toast with message', () => {
    render(
      <Toast 
        id={3} 
        message="Information message" 
        type="info" 
        onDismiss={onDismissMock} 
      />
    )
    
    expect(screen.getByText('Information message')).toBeInTheDocument()
    expect(screen.getByText('ℹ')).toBeInTheDocument()
  })

  it('auto-dismisses success toast after 3 seconds', () => {
    render(
      <Toast 
        id={1} 
        message="Success!" 
        type="success" 
        onDismiss={onDismissMock} 
      />
    )
    
    expect(onDismissMock).not.toHaveBeenCalled()
    
    vi.advanceTimersByTime(3000)
    
    expect(onDismissMock).toHaveBeenCalledWith(1)
  })

  it('auto-dismisses info toast after 3 seconds', () => {
    render(
      <Toast 
        id={2} 
        message="Info!" 
        type="info" 
        onDismiss={onDismissMock} 
      />
    )
    
    expect(onDismissMock).not.toHaveBeenCalled()
    
    vi.advanceTimersByTime(3000)
    
    expect(onDismissMock).toHaveBeenCalledWith(2)
  })

  it('does not auto-dismiss error toast', () => {
    render(
      <Toast 
        id={3} 
        message="Error!" 
        type="error" 
        onDismiss={onDismissMock} 
      />
    )
    
    vi.advanceTimersByTime(5000)
    
    expect(onDismissMock).not.toHaveBeenCalled()
  })

  it('calls onDismiss when dismiss button is clicked', async () => {
    vi.useRealTimers() // Use real timers for user interaction
    const user = userEvent.setup()
    
    render(
      <Toast 
        id={1} 
        message="Test message" 
        type="success" 
        onDismiss={onDismissMock} 
      />
    )
    
    const dismissButton = screen.getByLabelText('Dismiss notification')
    await user.click(dismissButton)
    
    expect(onDismissMock).toHaveBeenCalledWith(1)
  })
})
