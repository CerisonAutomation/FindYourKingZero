/**
 * =============================================================================
 * AI COMPONENTS — Canonical Export Index v15.0
 * =============================================================================
 *
 * Single entry point for ALL AI-related components.
 * Consolidates: Avatar, Chat, Neural, Match, Profile Optimization, Wake Word
 *
 * Standards: 15/10 Legendary | Zero-Trust | WCAG 3.0 AAA
 *
 * @module components/ai
 * @version 15.0.0
 */

// Avatar Components
export { AIAvatarOrb } from './AIAvatarOrb';
export { MobileAIAvatar } from './MobileAIAvatar';
export { NeuralAvatar } from './NeuralAvatar';

// Chat & Interaction
export { AIChat } from './AIChat';
export { IcebreakerPanel } from './IcebreakerPanel';
export { EliteAIAssistant } from './EliteAIAssistant';

// AI Features
export { AIMatchBadge } from './AIMatchBadge';
export { ProfileOptimizerPanel } from './ProfileOptimizerPanel';
export { WakeWordSettings } from './WakeWordSettings';

// Types
export type { MobileAIAvatarProps } from './MobileAIAvatar';
export type { NeuralAvatarProps, AvatarState } from './NeuralAvatar';
export type { ChatMessage, MessageType } from './AIChat';
export type { WakeWordSettingsProps } from './WakeWordSettings';

// Default export - Mobile-first AI Avatar
export { MobileAIAvatar as default } from './MobileAIAvatar';
