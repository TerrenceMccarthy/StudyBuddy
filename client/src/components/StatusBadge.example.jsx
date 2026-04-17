/**
 * StatusBadge Component Usage Examples
 * 
 * This file demonstrates how to use the StatusBadge component
 * in different scenarios across the application.
 */

import StatusBadge from './StatusBadge.jsx'

// Example 1: Basic usage with different statuses
function BasicUsageExample() {
  return (
    <div>
      <StatusBadge status="open" />
      <StatusBadge status="matched" />
      <StatusBadge status="closed" />
      <StatusBadge status="expired" />
    </div>
  )
}

// Example 2: With participant count
function WithCountExample() {
  return (
    <div>
      <StatusBadge status="matched" count={3} />
      <StatusBadge status="open" count={1} />
    </div>
  )
}

// Example 3: In a session card
function SessionCardExample({ session }) {
  return (
    <div className="session-card">
      <h3>{session.course}</h3>
      <StatusBadge 
        status={session.status} 
        count={session.participant_count} 
      />
    </div>
  )
}

// Example 4: Dynamic status based on session data
function DynamicStatusExample({ session }) {
  // Use getSessionStatus to calculate display status
  const displayStatus = getSessionStatus(session)
  
  return (
    <StatusBadge 
      status={displayStatus} 
      count={session.matches?.length} 
    />
  )
}

export { 
  BasicUsageExample, 
  WithCountExample, 
  SessionCardExample, 
  DynamicStatusExample 
}
