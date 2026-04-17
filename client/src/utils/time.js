/**
 * Timezone and time formatting utilities for StudyBuddy
 * Handles conversion between UTC (storage) and local timezone (display)
 */

/**
 * Format a UTC timestamp for display in the user's local timezone
 * @param {string} utcTime - ISO 8601 UTC timestamp
 * @returns {string} Formatted time string in local timezone
 * 
 * Example output: "Mon, Jan 15, 7:00 PM CST"
 */
export function formatSessionTime(utcTime) {
  if (!utcTime) return '';
  
  try {
    const date = new Date(utcTime);
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      console.error('Invalid date:', utcTime);
      return 'Invalid date';
    }
    
    return date.toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      timeZoneName: 'short'
    });
  } catch (error) {
    console.error('Error formatting time:', error);
    return 'Invalid date';
  }
}

/**
 * Convert local datetime input to UTC ISO string for storage
 * @param {string} localDateTime - Local datetime string from input (e.g., "2024-01-15T19:00")
 * @returns {string} ISO 8601 UTC timestamp
 * 
 * Example: "2024-01-15T19:00" (local) -> "2024-01-16T01:00:00.000Z" (UTC)
 */
export function prepareTimeForStorage(localDateTime) {
  if (!localDateTime) return '';
  
  try {
    const date = new Date(localDateTime);
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      console.error('Invalid date:', localDateTime);
      return '';
    }
    
    return date.toISOString();
  } catch (error) {
    console.error('Error preparing time for storage:', error);
    return '';
  }
}

/**
 * Display relative time (e.g., "2 hours ago", "in 3 days")
 * @param {string} utcTime - ISO 8601 UTC timestamp
 * @returns {string} Relative time string
 * 
 * Examples: "just now", "5 minutes ago", "in 2 hours", "3 days ago"
 */
export function timeAgo(utcTime) {
  if (!utcTime) return '';
  
  try {
    const date = new Date(utcTime);
    const now = new Date();
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      console.error('Invalid date:', utcTime);
      return 'Invalid date';
    }
    
    const diffMs = date.getTime() - now.getTime();
    const diffSec = Math.floor(Math.abs(diffMs) / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);
    const diffWeek = Math.floor(diffDay / 7);
    const diffMonth = Math.floor(diffDay / 30);
    const diffYear = Math.floor(diffDay / 365);
    
    const isPast = diffMs < 0;
    const prefix = isPast ? '' : 'in ';
    const suffix = isPast ? ' ago' : '';
    
    // Just now (within 10 seconds)
    if (diffSec < 10) {
      return 'just now';
    }
    
    // Seconds
    if (diffSec < 60) {
      return `${prefix}${diffSec} second${diffSec !== 1 ? 's' : ''}${suffix}`;
    }
    
    // Minutes
    if (diffMin < 60) {
      return `${prefix}${diffMin} minute${diffMin !== 1 ? 's' : ''}${suffix}`;
    }
    
    // Hours
    if (diffHour < 24) {
      return `${prefix}${diffHour} hour${diffHour !== 1 ? 's' : ''}${suffix}`;
    }
    
    // Days
    if (diffDay < 7) {
      return `${prefix}${diffDay} day${diffDay !== 1 ? 's' : ''}${suffix}`;
    }
    
    // Weeks
    if (diffWeek < 4) {
      return `${prefix}${diffWeek} week${diffWeek !== 1 ? 's' : ''}${suffix}`;
    }
    
    // Months
    if (diffMonth < 12) {
      return `${prefix}${diffMonth} month${diffMonth !== 1 ? 's' : ''}${suffix}`;
    }
    
    // Years
    return `${prefix}${diffYear} year${diffYear !== 1 ? 's' : ''}${suffix}`;
  } catch (error) {
    console.error('Error calculating time ago:', error);
    return 'Invalid date';
  }
}

/**
 * Check if a session time is in the past (expired)
 * @param {string} utcTime - ISO 8601 UTC timestamp
 * @returns {boolean} True if the time has passed
 */
export function isExpired(utcTime) {
  if (!utcTime) return false;
  
  try {
    const sessionTime = new Date(utcTime);
    const now = new Date();
    
    // Check if date is valid
    if (isNaN(sessionTime.getTime())) {
      console.error('Invalid date:', utcTime);
      return false;
    }
    
    return sessionTime < now;
  } catch (error) {
    console.error('Error checking if expired:', error);
    return false;
  }
}

/**
 * Format datetime-local input value from UTC timestamp
 * Used for populating edit forms with existing session times
 * @param {string} utcTime - ISO 8601 UTC timestamp
 * @returns {string} Datetime-local format string (YYYY-MM-DDTHH:mm)
 */
export function formatForDateTimeInput(utcTime) {
  if (!utcTime) return '';
  
  try {
    const date = new Date(utcTime);
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      console.error('Invalid date:', utcTime);
      return '';
    }
    
    // Format as YYYY-MM-DDTHH:mm in local timezone
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  } catch (error) {
    console.error('Error formatting for input:', error);
    return '';
  }
}
