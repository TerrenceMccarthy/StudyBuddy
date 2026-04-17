import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import CreatePostModal from './CreatePostModal'

describe('CreatePostModal', () => {
  it('displays validation error when submitting with past date/time', async () => {
    const mockOnSubmit = vi.fn()
    const mockOnClose = vi.fn()

    render(
      <CreatePostModal 
        onClose={mockOnClose} 
        onSubmit={mockOnSubmit} 
      />
    )

    // Fill in required fields
    fireEvent.change(screen.getByPlaceholderText(/CSE 3318/i), {
      target: { value: 'CSE 3318' }
    })
    
    const selects = screen.getAllByRole('combobox')
    fireEvent.change(selects[0], {
      target: { value: 'Computer Science' }
    })
    
    fireEvent.change(screen.getByPlaceholderText(/Central Library/i), {
      target: { value: 'Central Library' }
    })

    // Set a past date and time
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const pastDate = yesterday.toISOString().split('T')[0]
    
    const inputs = screen.getAllByRole('textbox')
    const dateInput = document.querySelector('input[type="date"]')
    const timeInput = document.querySelector('input[type="time"]')
    
    fireEvent.change(dateInput, {
      target: { value: pastDate }
    })
    
    fireEvent.change(timeInput, {
      target: { value: '10:00' }
    })

    // Submit the form
    const submitButton = screen.getByRole('button', { name: /post session/i })
    fireEvent.click(submitButton)

    // Wait for validation error to appear
    await waitFor(() => {
      expect(screen.getByText(/please choose a future date and time/i)).toBeInTheDocument()
    })

    // Verify onSubmit was not called
    expect(mockOnSubmit).not.toHaveBeenCalled()
  })

  it('allows submission with future date/time', async () => {
    const mockOnSubmit = vi.fn().mockResolvedValue(undefined)
    const mockOnClose = vi.fn()

    render(
      <CreatePostModal 
        onClose={mockOnClose} 
        onSubmit={mockOnSubmit} 
      />
    )

    // Fill in required fields
    fireEvent.change(screen.getByPlaceholderText(/CSE 3318/i), {
      target: { value: 'CSE 3318' }
    })
    
    const selects = screen.getAllByRole('combobox')
    fireEvent.change(selects[0], {
      target: { value: 'Computer Science' }
    })
    
    fireEvent.change(screen.getByPlaceholderText(/Central Library/i), {
      target: { value: 'Central Library' }
    })

    // Set a future date and time
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const futureDate = tomorrow.toISOString().split('T')[0]
    
    const dateInput = document.querySelector('input[type="date"]')
    const timeInput = document.querySelector('input[type="time"]')
    
    fireEvent.change(dateInput, {
      target: { value: futureDate }
    })
    
    fireEvent.change(timeInput, {
      target: { value: '14:00' }
    })

    // Submit the form
    const submitButton = screen.getByRole('button', { name: /post session/i })
    fireEvent.click(submitButton)

    // Wait for onSubmit to be called
    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalled()
    })

    // Verify no validation error is shown
    expect(screen.queryByText(/please choose a future date and time/i)).not.toBeInTheDocument()
  })

  it('clears validation error when resubmitting', async () => {
    const mockOnSubmit = vi.fn()
    const mockOnClose = vi.fn()

    render(
      <CreatePostModal 
        onClose={mockOnClose} 
        onSubmit={mockOnSubmit} 
      />
    )

    // Fill in required fields with past date
    fireEvent.change(screen.getByPlaceholderText(/CSE 3318/i), {
      target: { value: 'CSE 3318' }
    })
    
    const selects = screen.getAllByRole('combobox')
    fireEvent.change(selects[0], {
      target: { value: 'Computer Science' }
    })
    
    fireEvent.change(screen.getByPlaceholderText(/Central Library/i), {
      target: { value: 'Central Library' }
    })

    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const pastDate = yesterday.toISOString().split('T')[0]
    
    const dateInput = document.querySelector('input[type="date"]')
    const timeInput = document.querySelector('input[type="time"]')
    
    fireEvent.change(dateInput, {
      target: { value: pastDate }
    })
    
    fireEvent.change(timeInput, {
      target: { value: '10:00' }
    })

    // Submit with past date
    fireEvent.click(screen.getByRole('button', { name: /post session/i }))

    // Wait for error
    await waitFor(() => {
      expect(screen.getByText(/please choose a future date and time/i)).toBeInTheDocument()
    })

    // Update to future date
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const futureDate = tomorrow.toISOString().split('T')[0]
    
    fireEvent.change(dateInput, {
      target: { value: futureDate }
    })

    // Submit again
    fireEvent.click(screen.getByRole('button', { name: /post session/i }))

    // Error should be cleared
    await waitFor(() => {
      expect(screen.queryByText(/please choose a future date and time/i)).not.toBeInTheDocument()
    })
  })
})
