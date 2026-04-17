/**
 * LoadingSpinner Example Usage
 * 
 * This file demonstrates how to use the LoadingSpinner component
 * in different scenarios throughout the application.
 */

import LoadingSpinner from './LoadingSpinner'

// Example 1: Basic usage with default message
function Example1() {
  return <LoadingSpinner />
}

// Example 2: Custom message
function Example2() {
  return <LoadingSpinner message="Fetching sessions..." />
}

// Example 3: Small spinner
function Example3() {
  return <LoadingSpinner size="small" message="Loading..." />
}

// Example 4: Large spinner
function Example4() {
  return <LoadingSpinner size="large" message="Processing..." />
}

// Example 5: No message
function Example5() {
  return <LoadingSpinner message="" />
}

// Example 6: In a page component
function SessionsPage() {
  const [loading, setLoading] = useState(true)
  const [sessions, setSessions] = useState([])

  useEffect(() => {
    async function fetchSessions() {
      setLoading(true)
      const data = await fetchSessionsFromAPI()
      setSessions(data)
      setLoading(false)
    }
    fetchSessions()
  }, [])

  if (loading) {
    return <LoadingSpinner message="Loading sessions..." />
  }

  return (
    <div>
      {sessions.map(session => (
        <SessionCard key={session.id} session={session} />
      ))}
    </div>
  )
}

// Example 7: In a modal or overlay
function ModalWithLoading() {
  const [isProcessing, setIsProcessing] = useState(false)

  return (
    <div className="modal">
      {isProcessing ? (
        <LoadingSpinner message="Saving changes..." />
      ) : (
        <form>
          {/* Form content */}
        </form>
      )}
    </div>
  )
}

export { Example1, Example2, Example3, Example4, Example5, SessionsPage, ModalWithLoading }
