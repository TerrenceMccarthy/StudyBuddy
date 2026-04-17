import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useSessionActions } from './useSessionActions'
import { supabase } from '../lib/supabaseClient'

// Mock supabase
vi.mock('../lib/supabaseClient', () => ({
  supabase: {
    from: vi.fn(() => ({
      update: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ error: null }))
      })),
      delete: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ error: null }))
      }))
    }))
  }
}))

describe('useSessionActions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should initialize with default state', () => {
    const { result } = renderHook(() => useSessionActions())

    expect(result.current.showEditModal).toBe(false)
    expect(result.current.savingSession).toBe(false)
    expect(result.current.sessionFormError).toBe('')
    expect(result.current.editingSession).toBe(null)
  })

  it('should open edit modal with session data', () => {
    const { result } = renderHook(() => useSessionActions())

    const mockPost = {
      id: '123',
      course: 'CSE 3318',
      subject: 'Computer Science',
      topic: 'Algorithms',
      building: 'ERB',
      duration: '2 hours',
      time: '2026-12-01T10:00:00'
    }

    act(() => {
      result.current.handleEditSession(mockPost)
    })

    expect(result.current.showEditModal).toBe(true)
    expect(result.current.editingSession).toEqual(mockPost)
    expect(result.current.sessionForm.course).toBe('CSE 3318')
    expect(result.current.sessionForm.subject).toBe('Computer Science')
  })

  it('should close edit modal', () => {
    const { result } = renderHook(() => useSessionActions())

    const mockPost = {
      id: '123',
      course: 'CSE 3318',
      subject: 'Computer Science',
      topic: 'Algorithms',
      building: 'ERB',
      duration: '2 hours',
      time: '2026-12-01T10:00:00'
    }

    act(() => {
      result.current.handleEditSession(mockPost)
    })

    expect(result.current.showEditModal).toBe(true)

    act(() => {
      result.current.handleCancelEdit()
    })

    expect(result.current.showEditModal).toBe(false)
    expect(result.current.editingSession).toBe(null)
  })

  it('should validate required fields before saving', async () => {
    const { result } = renderHook(() => useSessionActions())

    const mockPost = {
      id: '123',
      course: '',
      subject: 'Computer Science',
      topic: '',
      building: '',
      duration: '',
      time: ''
    }

    act(() => {
      result.current.handleEditSession(mockPost)
    })

    await act(async () => {
      await result.current.handleSaveSession()
    })

    expect(result.current.sessionFormError).toBe('Please fill in all fields.')
  })

  it('should validate session time is in the future', async () => {
    const { result } = renderHook(() => useSessionActions())

    const pastDate = new Date()
    pastDate.setDate(pastDate.getDate() - 1)

    const mockPost = {
      id: '123',
      course: 'CSE 3318',
      subject: 'Computer Science',
      topic: 'Algorithms',
      building: 'ERB',
      duration: '2 hours',
      time: pastDate.toISOString()
    }

    act(() => {
      result.current.handleEditSession(mockPost)
    })

    await act(async () => {
      await result.current.handleSaveSession()
    })

    expect(result.current.sessionFormError).toContain('future')
  })

  it('should call onSuccess callback after successful save', async () => {
    const { result } = renderHook(() => useSessionActions())
    const onSuccess = vi.fn()

    const futureDate = new Date()
    futureDate.setDate(futureDate.getDate() + 1)

    const mockPost = {
      id: '123',
      course: 'CSE 3318',
      subject: 'Computer Science',
      topic: 'Algorithms',
      building: 'ERB',
      duration: '2 hours',
      time: futureDate.toISOString()
    }

    act(() => {
      result.current.handleEditSession(mockPost)
    })

    await act(async () => {
      await result.current.handleSaveSession(onSuccess)
    })

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalled()
    })
  })

  it('should perform optimistic delete', async () => {
    const { result } = renderHook(() => useSessionActions())
    const onOptimisticDelete = vi.fn()
    const onError = vi.fn()

    await act(async () => {
      await result.current.handleDeleteSession('123', onOptimisticDelete, onError)
    })

    expect(onOptimisticDelete).toHaveBeenCalledWith('123')
    expect(onError).not.toHaveBeenCalled()
  })

  it('should call onError if delete fails', async () => {
    const { result } = renderHook(() => useSessionActions())
    const onOptimisticDelete = vi.fn()
    const onError = vi.fn()

    // Mock delete failure
    vi.mocked(supabase.from).mockReturnValueOnce({
      delete: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ error: { message: 'Delete failed' } }))
      }))
    })

    await act(async () => {
      await result.current.handleDeleteSession('123', onOptimisticDelete, onError)
    })

    expect(onOptimisticDelete).toHaveBeenCalledWith('123')
    expect(onError).toHaveBeenCalled()
  })
})
