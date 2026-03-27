/**
 * Shared AI Offline Response Utilities
 * Consolidates offline response logic across AI components
 * 
 * This module provides centralized offline response handling to ensure
 * consistent behavior across all AI avatar components when offline.
 */

export interface OfflineResponseSet {
  greeting: string[];
  help: string[];
  fallback: string[];
}

export const DEFAULT_OFFLINE_RESPONSES: OfflineResponseSet = {
  greeting: [
    "Hello! I'm your AI assistant. How can I help you today?",
    "Hi there! Ready to help you find your perfect match.",
    "Welcome! I'm here to assist you with any questions.",
    "Hey! I'm here to help with your dating journey.",
  ],
  help: [
    "I can help you with: finding matches, profile suggestions, conversation tips, and app navigation.",
    "Try asking me about your profile, match recommendations, or dating advice.",
    "I can suggest profiles, help with icebreakers, or give you dating tips!",
  ],
  fallback: [
    "I'm currently in offline mode with limited responses. Try asking about help or say hello.",
    "Working offline. I can answer basic questions like greetings or general help.",
    "I'm in offline mode. Ask me simple questions about the app or dating advice.",
  ],
};

export type QueryCategory = 'greeting' | 'help' | 'fallback';

/**
 * Categorize a user query for offline response selection
 */
export function categorizeQuery(query: string): QueryCategory {
  const normalized = query.toLowerCase().trim();
  
  if (normalized.match(/^(hello|hi|hey|greetings|howdy|yo|sup)/)) {
    return 'greeting';
  }
  
  if (normalized.match(/help|what can you do|assist|support|what.*do/)) {
    return 'help';
  }
  
  return 'fallback';
}

/**
 * Get a random offline response based on query category
 */
export function getOfflineResponse(
  query: string,
  responseSet: OfflineResponseSet = DEFAULT_OFFLINE_RESPONSES
): string {
  const category = categorizeQuery(query);
  const responses = responseSet[category];
  return responses[Math.floor(Math.random() * responses.length)];
}

/**
 * Get all available offline response categories
 */
export function getOfflineResponseCategories(): QueryCategory[] {
  return ['greeting', 'help', 'fallback'];
}

/**
 * Check if a query can be handled with offline responses
 */
export function isOfflineHandleable(query: string): boolean {
  const category = categorizeQuery(query);
  return category !== 'fallback' || query.length < 100;
}
