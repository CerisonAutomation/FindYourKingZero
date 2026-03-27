/**
 * =============================================================================
 * TEST UTILITIES — Enterprise-Grade Testing Infrastructure
 * =============================================================================
 *
 * Shared testing utilities for unit, integration, and E2E tests.
 *
 * Standards: 15/10 Legendary | Zero-Trust | Enterprise Production
 *
 * @module tests/utils
 * @version 15.0.0
 */

import {vi} from 'vitest';
import {render, RenderOptions} from '@testing-library/react';
import {ReactElement} from 'react';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';

// =============================================================================
// MOCK FACTORIES
// =============================================================================

export const createMockUser = (overrides = {}) => ({
  id: 'test-user-id',
  email: 'test@example.com',
  created_at: new Date().toISOString(),
  ...overrides,
});

export const createMockProfile = (overrides = {}) => ({
  id: 'test-profile-id',
  user_id: 'test-user-id',
  display_name: 'Test User',
  age: 25,
  bio: 'Test bio',
  photos: [],
  is_verified: false,
  is_online: true,
  last_seen: new Date().toISOString(),
  ...overrides,
});

export const createMockMessage = (overrides = {}) => ({
  id: 'test-message-id',
  content: 'Test message',
  sender_id: 'test-sender-id',
  receiver_id: 'test-receiver-id',
  created_at: new Date().toISOString(),
  read_at: null,
  ...overrides,
});

export const createMockConversation = (overrides = {}) => ({
  id: 'test-conversation-id',
  participant_ids: ['user-1', 'user-2'],
  last_message: createMockMessage(),
  unread_count: 0,
  updated_at: new Date().toISOString(),
  ...overrides,
});

// =============================================================================
// RENDER HELPERS
// =============================================================================

const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      staleTime: 0,
    },
  },
});

export function renderWithProviders(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  const queryClient = createTestQueryClient();
  
  const Wrapper = ({children}: {children: React.ReactNode}) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
  
  return render(ui, {wrapper: Wrapper, ...options});
}

// =============================================================================
// MOCK HELPERS
// =============================================================================

export const mockLocalStorage = () => {
  const store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      Object.keys(store).forEach(key => delete store[key]);
    }),
  };
};

export const mockMatchMedia = (matches = false) => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(query => ({
      matches,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
};

export const mockIntersectionObserver = () => {
  class MockIntersectionObserver {
    observe = vi.fn();
    disconnect = vi.fn();
    unobserve = vi.fn();
  }
  
  Object.defineProperty(window, 'IntersectionObserver', {
    writable: true,
    value: MockIntersectionObserver,
  });
};

export const mockResizeObserver = () => {
  class MockResizeObserver {
    observe = vi.fn();
    disconnect = vi.fn();
    unobserve = vi.fn();
  }
  
  Object.defineProperty(window, 'ResizeObserver', {
    writable: true,
    value: MockResizeObserver,
  });
};

// =============================================================================
// ASSERTION HELPERS
// =============================================================================

export const assertElementVisible = (element: HTMLElement) => {
  expect(element).toBeInTheDocument();
  expect(element).toBeVisible();
};

export const assertElementHidden = (element: HTMLElement | null) => {
  if (element) {
    expect(element).not.toBeVisible();
  }
};

export const waitForAsync = (ms = 0) => 
  new Promise(resolve => setTimeout(resolve, ms));

// =============================================================================
// PERFORMANCE TESTING
// =============================================================================

export const measureRenderTime = async (
  renderFn: () => void,
  maxMs: number = 16
): Promise<boolean> => {
  const start = performance.now();
  renderFn();
  const end = performance.now();
  const duration = end - start;
  
  if (duration > maxMs) {
    console.warn(`Render took ${duration}ms, exceeding ${maxMs}ms budget`);
    return false;
  }
  
  return true;
};

// =============================================================================
// ACCESSIBILITY TESTING
// =============================================================================

export const assertAccessible = (element: HTMLElement) => {
  expect(element).toHaveAttribute('role');
};

export const assertFocusable = (element: HTMLElement) => {
  expect(element).toHaveAttribute('tabindex');
  element.focus();
  expect(element).toHaveFocus();
};

export const assertHasLabel = (element: HTMLElement, label: string) => {
  expect(element).toHaveAccessibleName(label);
};
