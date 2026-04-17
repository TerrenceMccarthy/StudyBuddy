/**
 * Session status utilities for StudyBuddy
 * Handles status calculation and configuration
 */

import { isExpired } from './time.js';

/**
 * Status configuration with colors and labels
 */
export const STATUS_CONFIG = {
  open: {
    label: 'Open',
    color: '#4caf50',
    description: 'Available to join'
  },
  matched: {
    label: 'Matched',
    color: '#2196f3',
    description: 'Has participants'
  },
  closed: {
    label: 'Closed',
    color: '#9e9e9e',
    description: 'No longer accepting participants'
  },
  expired: {
    label: 'Expired',
    color: '#f59e0b',
    description: 'Session time has passed'
  }
};

/**
 * Calculate the display status of a session
 * Expired status overrides stored status if session time has passed
 * 
 * @param {Object} post - Session post object
 * @param {string} post.time - ISO 8601 UTC timestamp of session
 * @param {string} post.status - Stored status ('open' | 'matched' | 'closed')
 * @returns {string} Display status ('open' | 'matched' | 'closed' | 'expired')
 * 
 * @example
 * const post = { time: '2024-01-15T19:00:00Z', status: 'open' };
 * const status = getSessionStatus(post); // Returns 'expired' if time has passed
 */
export function getSessionStatus(post) {
  if (!post) {
    return 'open';
  }

  // Expired overrides stored status (except for already closed sessions)
  if (post.time && isExpired(post.time) && post.status !== 'closed') {
    return 'expired';
  }

  return post.status || 'open';
}
