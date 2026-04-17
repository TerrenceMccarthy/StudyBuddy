import EmptyState from './EmptyState'

/**
 * EmptyState Component Examples
 * 
 * This file demonstrates various use cases for the EmptyState component.
 */

// Example 1: No sessions found (with filter suggestion)
export function NoSessionsExample() {
  return (
    <EmptyState
      icon="📚"
      title="No sessions found"
      message="Try adjusting your filters to see more study sessions!"
    />
  )
}

// Example 2: No posts yet (with create action)
export function NoPostsExample() {
  const handleCreateSession = () => {
    console.log('Opening create session modal...')
  }

  return (
    <EmptyState
      icon="📝"
      title="No posts yet"
      message="Create your first study session to get started!"
      action={{
        label: 'Create Session',
        onClick: handleCreateSession
      }}
    />
  )
}

// Example 3: No activity (with call to action)
export function NoActivityExample() {
  const handleGetStarted = () => {
    console.log('Navigating to home page...')
  }

  return (
    <EmptyState
      icon="🎯"
      title="No activity yet"
      message="Post or join a session to get started!"
      action={{
        label: 'Browse Sessions',
        onClick: handleGetStarted
      }}
    />
  )
}

// Example 4: No matches
export function NoMatchesExample() {
  return (
    <EmptyState
      icon="🤝"
      title="No matches yet"
      message="You haven't joined any sessions yet. Browse available sessions to find study partners!"
    />
  )
}

// Example 5: Search no results
export function NoSearchResultsExample() {
  return (
    <EmptyState
      icon="🔍"
      title="No results found"
      message="Try different search terms or adjust your filters."
    />
  )
}
