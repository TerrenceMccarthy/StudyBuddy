/**
 * Tests for session status utilities
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getSessionStatus, STATUS_CONFIG } from './sessionStatus.js';

describe('getSessionStatus', () => {
  beforeEach(() => {
    // Mock current time to 2024-01-20T12:00:00Z
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-01-20T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should return stored status for future sessions', () => {
    const post = {
      time: '2024-01-25T19:00:00Z',
      status: 'open'
    };
    expect(getSessionStatus(post)).toBe('open');
  });

  it('should return expired for past open sessions', () => {
    const post = {
      time: '2024-01-15T19:00:00Z',
      status: 'open'
    };
    expect(getSessionStatus(post)).toBe('expired');
  });

  it('should return expired for past matched sessions', () => {
    const post = {
      time: '2024-01-15T19:00:00Z',
      status: 'matched'
    };
    expect(getSessionStatus(post)).toBe('expired');
  });

  it('should return closed for past closed sessions', () => {
    const post = {
      time: '2024-01-15T19:00:00Z',
      status: 'closed'
    };
    expect(getSessionStatus(post)).toBe('closed');
  });

  it('should return matched for future matched sessions', () => {
    const post = {
      time: '2024-01-25T19:00:00Z',
      status: 'matched'
    };
    expect(getSessionStatus(post)).toBe('matched');
  });

  it('should return closed for future closed sessions', () => {
    const post = {
      time: '2024-01-25T19:00:00Z',
      status: 'closed'
    };
    expect(getSessionStatus(post)).toBe('closed');
  });

  it('should handle null post gracefully', () => {
    expect(getSessionStatus(null)).toBe('open');
  });

  it('should handle undefined post gracefully', () => {
    expect(getSessionStatus(undefined)).toBe('open');
  });

  it('should handle missing time field', () => {
    const post = {
      status: 'open'
    };
    expect(getSessionStatus(post)).toBe('open');
  });

  it('should handle missing status field', () => {
    const post = {
      time: '2024-01-25T19:00:00Z'
    };
    expect(getSessionStatus(post)).toBe('open');
  });

  it('should handle invalid time gracefully', () => {
    const post = {
      time: 'invalid-date',
      status: 'open'
    };
    expect(getSessionStatus(post)).toBe('open');
  });
});

describe('STATUS_CONFIG', () => {
  it('should have configuration for all status types', () => {
    expect(STATUS_CONFIG).toHaveProperty('open');
    expect(STATUS_CONFIG).toHaveProperty('matched');
    expect(STATUS_CONFIG).toHaveProperty('closed');
    expect(STATUS_CONFIG).toHaveProperty('expired');
  });

  it('should have correct open status configuration', () => {
    expect(STATUS_CONFIG.open).toEqual({
      label: 'Open',
      color: '#4caf50',
      description: 'Available to join'
    });
  });

  it('should have correct matched status configuration', () => {
    expect(STATUS_CONFIG.matched).toEqual({
      label: 'Matched',
      color: '#2196f3',
      description: 'Has participants'
    });
  });

  it('should have correct closed status configuration', () => {
    expect(STATUS_CONFIG.closed).toEqual({
      label: 'Closed',
      color: '#9e9e9e',
      description: 'No longer accepting participants'
    });
  });

  it('should have correct expired status configuration', () => {
    expect(STATUS_CONFIG.expired).toEqual({
      label: 'Expired',
      color: '#f59e0b',
      description: 'Session time has passed'
    });
  });

  it('should have label property for each status', () => {
    Object.values(STATUS_CONFIG).forEach(config => {
      expect(config).toHaveProperty('label');
      expect(typeof config.label).toBe('string');
    });
  });

  it('should have color property for each status', () => {
    Object.values(STATUS_CONFIG).forEach(config => {
      expect(config).toHaveProperty('color');
      expect(typeof config.color).toBe('string');
      expect(config.color).toMatch(/^#[0-9a-f]{6}$/i);
    });
  });

  it('should have description property for each status', () => {
    Object.values(STATUS_CONFIG).forEach(config => {
      expect(config).toHaveProperty('description');
      expect(typeof config.description).toBe('string');
    });
  });
});
