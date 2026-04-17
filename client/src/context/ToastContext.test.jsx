import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ToastProvider, useToast } from './ToastContext'

// Test component that uses the toast hook
function TestComponent() {
  const { showToast } = useToast()
  
  return (
    <div>
      <button onClick={() => showToast('Success message', 'success')}>
        Show Success
      </button>
      <button onClick={() => showToast('Error message', 'error')}>
        Show Error
      </button>
      <button onClick={() => showToast('Info message', 'info')}>
        Show Info
      </button>
    </div>
  )
}

describe('ToastContext', () => {
  it('provides showToast function', async () => {
    const user = userEvent.setup()
    
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    )
    
    const button = screen.getByText('Show Success')
    await user.click(button)
    
    expect(screen.getByText('Success message')).toBeInTheDocument()
  })

  it('displays multiple toasts simultaneously', async () => {
    const user = userEvent.setup()
    
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    )
    
    await user.click(screen.getByText('Show Success'))
    await user.click(screen.getByText('Show Error'))
    
    expect(screen.getByText('Success message')).toBeInTheDocument()
    expect(screen.getByText('Error message')).toBeInTheDocument()
  })

  it('removes toast when dismissed', async () => {
    const user = userEvent.setup()
    
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    )
    
    await user.click(screen.getByText('Show Success'))
    expect(screen.getByText('Success message')).toBeInTheDocument()
    
    const dismissButtons = screen.getAllByLabelText('Dismiss notification')
    await user.click(dismissButtons[0])
    
    expect(screen.queryByText('Success message')).not.toBeInTheDocument()
  })

  it('auto-removes success toast after 3 seconds', async () => {
    const user = userEvent.setup()
    
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    )
    
    await user.click(screen.getByText('Show Success'))
    expect(screen.getByText('Success message')).toBeInTheDocument()
    
    // Wait for auto-dismiss (3 seconds + buffer)
    await waitFor(() => {
      expect(screen.queryByText('Success message')).not.toBeInTheDocument()
    }, { timeout: 4000 })
  })

  it('does not auto-remove error toast', async () => {
    const user = userEvent.setup()
    
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    )
    
    await user.click(screen.getByText('Show Error'))
    expect(screen.getByText('Error message')).toBeInTheDocument()
    
    // Wait 3.5 seconds - error toast should still be there
    await new Promise(resolve => setTimeout(resolve, 3500))
    
    expect(screen.getByText('Error message')).toBeInTheDocument()
  })

  it('throws error when useToast is used outside provider', () => {
    // Suppress console.error for this test
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
    
    expect(() => {
      render(<TestComponent />)
    }).toThrow('useToast must be used within a ToastProvider')
    
    consoleError.mockRestore()
  })
})
