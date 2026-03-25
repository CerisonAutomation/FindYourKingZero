/**
 * Test Setup Configuration
 * Global test utilities and mocks
 */

import {afterEach, vi} from 'vitest';
import {cleanup} from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock Supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
      signInWithOtp: vi.fn(),
      resetPasswordForEmail: vi.fn(),
      onAuthStateChange: vi.fn(),
      getSession: vi.fn(),
      updateUser: vi.fn(),
    },
    from: vi.fn(),
    storage: {
      from: vi.fn(),
    },
    realtime: {
      channel: vi.fn(),
      subscribe: vi.fn(),
    },
  },
}));

// Mock Trystero P2P
vi.mock('trystero', () => ({
  joinRoom: vi.fn(),
  makeAction: vi.fn(),
  selfId: 'test-peer-id',
}));

// Mock performance API
Object.defineProperty(window, 'performance', {
  writable: true,
  value: {
    ...global.performance,
    getEntriesByType: vi.fn(),
    mark: vi.fn(),
    measure: vi.fn(),
    navigation: {
      loadEventEnd: 1000,
      loadEventStart: 900,
      domContentLoadedEventEnd: 800,
      domContentLoadedEventStart: 700,
    },
  },
});

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock Web Crypto API
Object.defineProperty(global, 'crypto', {
  value: {
    randomBytes: vi.fn(() => Buffer.from('random')),
    createHash: vi.fn(() => ({
      update: vi.fn().mockReturnThis(),
      digest: vi.fn(() => Buffer.from('hash')),
    })),
    createCipheriv: vi.fn(() => ({
      update: vi.fn().mockReturnThis(),
      final: vi.fn(() => 'encrypted'),
      getAuthTag: vi.fn(() => Buffer.from('tag')),
    })),
    createDecipheriv: vi.fn(() => ({
      setAuthTag: vi.fn(),
      update: vi.fn().mockReturnThis(),
      final: vi.fn(() => 'decrypted'),
    })),
    scrypt: vi.fn((_password, _salt, _keylen, _options, callback) => {
      callback(null, Buffer.from('derived-key'));
    }),
  },
});

// Test utilities
export const createMockUser = (overrides = {}) => ({
  id: 'test-user-id',
  email: 'test@example.com',
  user_metadata: {
    display_name: 'Test User',
    avatar_url: 'https://example.com/avatar.jpg',
  },
  created_at: '2024-01-01T00:00:00Z',
  ...overrides,
});

export const createMockProfile = (overrides = {}) => ({
  id: 'test-profile-id',
  user_id: 'test-user-id',
  display_name: 'Test User',
  age: 25,
  bio: 'Test bio',
  avatar_url: 'https://example.com/avatar.jpg',
  location: 'SRID=4326;POINT(-122.4194 37.7749)',
  is_online: true,
  last_seen: '2024-01-01T00:00:00Z',
  ...overrides,
});

export const createMockMessage = (overrides = {}) => ({
  id: 'test-message-id',
  conversation_id: 'test-conversation-id',
  sender_id: 'test-user-id',
  content: 'Test message',
  message_type: 'text',
  created_at: '2024-01-01T00:00:00Z',
  metadata: {},
  is_p2p: false,
  ...overrides,
});

export const createMockConversation = (overrides = {}) => ({
  id: 'test-conversation-id',
  participant_one: 'test-user-id',
  participant_two: 'other-user-id',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  ...overrides,
});

// Cleanup after each test
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

// Global test timeout
vi.setConfig({ testTimeout: 10000 });
