/**
 * =============================================================================
 * AI LIBRARY — Canonical Export Index v15.0
 * =============================================================================
 *
 * Single entry point for ALL AI-related utilities and engines.
 * Consolidates: LocalAI, ChatAI, ML Services, AI Matching, Elite AI, Infermax
 *
 * Standards: 15/10 Legendary | Zero-Trust | WCAG 3.0 AAA
 *
 * @module lib/ai
 * @version 15.0.0
 */

// Core AI Engines
export { LocalAI, getLocalAI } from './LocalAI';
export { ChatAI } from './ChatAI';
export { AIBrain } from './AIBrain';

// Advanced AI Engines
export { EliteAIEngine } from './EliteAIEngine';
export { InfermaxAIEngine } from './InfermaxAIEngine';
export { AIMatchingEngine } from './AIMatchingEngine';

// ML & Services
export { MLServices } from './MLServices';

// Client & APIs
export { AIClient } from './client';
export { OpenRouterClient } from './openrouter';

// Offline Support
export { offlineResponses } from './offlineResponses';

// Canonical AI (Unified)
export { CanonicalAI } from './canonical';

// Types
export type { LocalAIStatus, GenerateOptions, IntentType } from './LocalAI';
export type { ChatMessage, MessageType } from './ChatAI';

// React Hook
export { useLocalAI } from './useLocalAI';
