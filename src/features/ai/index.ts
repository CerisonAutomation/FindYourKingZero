/**
 * =============================================================================
 * AI FEATURE MODULE — Canonical Export Index v15.0
 * =============================================================================
 *
 * Single entry point for ALL AI functionality.
 * Consolidates: AI Chat, Coaching, Matching, Icebreakers
 *
 * Standards: 15/10 Legendary | Zero-Trust | WCAG 3.0 AAA
 *
 * @module features/ai
 * @version 15.0.0
 */

// Pages
export { default as AIPage } from './pages/AIPage';

// Components (re-exported from components directory)
export { default as AIAvatarOrb } from '@/components/ai/AIAvatarOrb';
export { default as AIChat } from '@/components/ai/AIChat';
export { default as AICoachingPanel } from '@/components/AICoachingPanel';
export { default as AIFloatingButton } from '@/components/AIFloatingButton';
export { default as AIKing } from '@/components/AIKing';
export { default as MobileAIAvatar } from '@/components/ai/MobileAIAvatar';

// Hooks (re-exported from hooks directory)
export { useAI, useKeylessAI, useUnifiedAI } from '@/lib/ai/canonical';
export { useLocalAI } from '@/lib/ai';
export { useAI as useAIHook } from '@/hooks/useAI';