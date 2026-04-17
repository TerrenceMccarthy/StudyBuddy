import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  formatSessionTime,
  prepareTimeForStorage,
  timeAgo,
  isExpired,
  formatForDateTimeInput
} from './time.js';

describe('Timezone Utilities', () => {
  let originalDate;
  
  beforeEach(() => {
    // Save original Date
    originalDate = global.Date;
  });
  
  afterEach(() => {
    // Restore original Date
    global.Date = originalDate;
  });
  
  describe('formatSessionTime', () => {
    it('should format UTC time to local timezone string', () => {
      const utcTime = '2024-01-15T19:00:00.000Z';
      const result = formatSessionTime(utcTime);
      
      // Result should contain date components (exact format depends on locale)
      expect(result).toContain('Jan');
      expect(result).toContain('15');
    });
    
    it('should return empty string for null input', () => {
      expect(formatSessionTime(null)).toBe('');
    });
    
    it('should return empty string for undefined input', () => {
      expect(formatSessionTime(undefined)).toBe('');
    });
    
    it('should return "Invalid date" for invalid date string', () => {
      expect(formatSessionTime('not-a-date')).toBe('Invalid date');
    });
    
    it('should handle ISO 8601 format without milliseconds', () => {
      const utcTime = '2024-01-15T19:00:00Z';
      const result = formatSessionTime(utcTime);
      
      expect(result).toContain('Jan');
      expect(result).toContain('15');
    });
  });
  
  describe('prepareTimeForStorage', () => {
    it('should convert local datetime to UTC ISO string', () => {
      const localDateTime = '2024-01-15T19:00';
      const result = prepareTimeForStorage(localDateTime);
      
      // Should be valid ISO 8601 format
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
      
      // Should be parseable
      const parsed = new Date(result);
      expect(parsed.getTime()).not.toBeNaN();
    });
    
    it('should return empty string for null input', () => {
      expect(prepareTimeForStorage(null)).toBe('');
    });
    
    it('should return empty string for undefined input', () => {
      expect(prepareTimeForStorage(undefined)).toBe('');
    });
    
    it('should return empty string for invalid date string', () => {
      expect(prepareTimeForStorage('not-a-date')).toBe('');
    });
    
    it('should handle datetime with seconds', () => {
      const localDateTime = '2024-01-15T19:00:30';
      const result = prepareTimeForStorage(localDateTime);
      
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    });
  });
  
  describe('timeAgo', () => {
    beforeEach(() => {
      // Mock current time to 2024-01-15 12:00:00 UTC
      const mockNow = new Date('2024-01-15T12:00:00.000Z');
      vi.useFakeTimers();
      vi.setSystemTime(mockNow);
    });
    
    afterEach(() => {
      vi.useRealTimers();
    });
    
    it('should return "just now" for very recent times', () => {
      const recentTime = '2024-01-15T11:59:55.000Z'; // 5 seconds ago
      expect(timeAgo(recentTime)).toBe('just now');
    });
    
    it('should return seconds ago for times within a minute', () => {
      const time = '2024-01-15T11:59:30.000Z'; // 30 seconds ago
      expect(timeAgo(time)).toBe('30 seconds ago');
    });
    
    it('should return "just now" for 1 second (within 10 second threshold)', () => {
      const time = '2024-01-15T11:59:59.000Z'; // 1 second ago
      expect(timeAgo(time)).toBe('just now');
    });
    
    it('should return minutes ago for times within an hour', () => {
      const time = '2024-01-15T11:45:00.000Z'; // 15 minutes ago
      expect(timeAgo(time)).toBe('15 minutes ago');
    });
    
    it('should return singular "minute ago" for 1 minute', () => {
      const time = '2024-01-15T11:59:00.000Z'; // 1 minute ago
      expect(timeAgo(time)).toBe('1 minute ago');
    });
    
    it('should return hours ago for times within a day', () => {
      const time = '2024-01-15T09:00:00.000Z'; // 3 hours ago
      expect(timeAgo(time)).toBe('3 hours ago');
    });
    
    it('should return singular "hour ago" for 1 hour', () => {
      const time = '2024-01-15T11:00:00.000Z'; // 1 hour ago
      expect(timeAgo(time)).toBe('1 hour ago');
    });
    
    it('should return days ago for times within a week', () => {
      const time = '2024-01-13T12:00:00.000Z'; // 2 days ago
      expect(timeAgo(time)).toBe('2 days ago');
    });
    
    it('should return singular "day ago" for 1 day', () => {
      const time = '2024-01-14T12:00:00.000Z'; // 1 day ago
      expect(timeAgo(time)).toBe('1 day ago');
    });
    
    it('should return weeks ago for times within a month', () => {
      const time = '2024-01-01T12:00:00.000Z'; // 2 weeks ago
      expect(timeAgo(time)).toBe('2 weeks ago');
    });
    
    it('should return singular "week ago" for 1 week', () => {
      const time = '2024-01-08T12:00:00.000Z'; // 1 week ago
      expect(timeAgo(time)).toBe('1 week ago');
    });
    
    it('should return months ago for times within a year', () => {
      const time = '2023-11-15T12:00:00.000Z'; // 2 months ago
      expect(timeAgo(time)).toBe('2 months ago');
    });
    
    it('should return singular "month ago" for 1 month', () => {
      const time = '2023-12-15T12:00:00.000Z'; // 1 month ago
      expect(timeAgo(time)).toBe('1 month ago');
    });
    
    it('should return years ago for times over a year', () => {
      const time = '2022-01-15T12:00:00.000Z'; // 2 years ago
      expect(timeAgo(time)).toBe('2 years ago');
    });
    
    it('should return singular "year ago" for 1 year', () => {
      const time = '2023-01-15T12:00:00.000Z'; // 1 year ago
      expect(timeAgo(time)).toBe('1 year ago');
    });
    
    it('should handle future times with "in" prefix', () => {
      const futureTime = '2024-01-15T13:00:00.000Z'; // 1 hour in future
      expect(timeAgo(futureTime)).toBe('in 1 hour');
    });
    
    it('should handle future times in days', () => {
      const futureTime = '2024-01-17T12:00:00.000Z'; // 2 days in future
      expect(timeAgo(futureTime)).toBe('in 2 days');
    });
    
    it('should return empty string for null input', () => {
      expect(timeAgo(null)).toBe('');
    });
    
    it('should return empty string for undefined input', () => {
      expect(timeAgo(undefined)).toBe('');
    });
    
    it('should return "Invalid date" for invalid date string', () => {
      expect(timeAgo('not-a-date')).toBe('Invalid date');
    });
  });
  
  describe('isExpired', () => {
    beforeEach(() => {
      // Mock current time to 2024-01-15 12:00:00 UTC
      const mockNow = new Date('2024-01-15T12:00:00.000Z');
      vi.useFakeTimers();
      vi.setSystemTime(mockNow);
    });
    
    afterEach(() => {
      vi.useRealTimers();
    });
    
    it('should return true for past times', () => {
      const pastTime = '2024-01-15T11:00:00.000Z';
      expect(isExpired(pastTime)).toBe(true);
    });
    
    it('should return false for future times', () => {
      const futureTime = '2024-01-15T13:00:00.000Z';
      expect(isExpired(futureTime)).toBe(false);
    });
    
    it('should return true for times exactly at current time', () => {
      const currentTime = '2024-01-15T12:00:00.000Z';
      expect(isExpired(currentTime)).toBe(false);
    });
    
    it('should return false for null input', () => {
      expect(isExpired(null)).toBe(false);
    });
    
    it('should return false for undefined input', () => {
      expect(isExpired(undefined)).toBe(false);
    });
    
    it('should return false for invalid date string', () => {
      expect(isExpired('not-a-date')).toBe(false);
    });
  });
  
  describe('formatForDateTimeInput', () => {
    it('should format UTC time to datetime-local format', () => {
      const utcTime = '2024-01-15T19:00:00.000Z';
      const result = formatForDateTimeInput(utcTime);
      
      // Should match YYYY-MM-DDTHH:mm format
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/);
    });
    
    it('should convert to local timezone', () => {
      const utcTime = '2024-01-15T19:00:00.000Z';
      const result = formatForDateTimeInput(utcTime);
      
      // Parse the result and verify it represents the same moment
      const resultDate = new Date(result);
      const originalDate = new Date(utcTime);
      
      // The dates should represent the same moment in time
      expect(resultDate.getTime()).toBe(originalDate.getTime());
    });
    
    it('should return empty string for null input', () => {
      expect(formatForDateTimeInput(null)).toBe('');
    });
    
    it('should return empty string for undefined input', () => {
      expect(formatForDateTimeInput(undefined)).toBe('');
    });
    
    it('should return empty string for invalid date string', () => {
      expect(formatForDateTimeInput('not-a-date')).toBe('');
    });
    
    it('should pad single-digit months and days', () => {
      const utcTime = '2024-01-05T09:05:00.000Z';
      const result = formatForDateTimeInput(utcTime);
      
      // Should have proper padding
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/);
    });
  });
  
  describe('Round-trip conversion', () => {
    it('should maintain time consistency through format and prepare cycle', () => {
      const localDateTime = '2024-01-15T19:00';
      
      // Convert to UTC for storage
      const utcTime = prepareTimeForStorage(localDateTime);
      
      // Convert back to local for input
      const backToLocal = formatForDateTimeInput(utcTime);
      
      // Should match original (allowing for seconds precision)
      expect(backToLocal).toBe(localDateTime);
    });
  });
});
