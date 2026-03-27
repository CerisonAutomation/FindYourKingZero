/**
 * =============================================================================
 * VOICE FEATURE MODULE — Canonical Export Index v15.0
 * =============================================================================
 *
 * Single entry point for ALL voice functionality.
 *
 * Standards: 15/10 Legendary | Zero-Trust | WCAG 3.0 AAA
 *
 * @module features/voice
 * @version 15.0.0
 */

// Pages
export { default as VoicePage } from './pages/VoicePage';

// Hooks (re-exported from hooks directory)
export { useVoiceInput } from '@/hooks/useVoiceInput';
export { useAutoReply } from '@/hooks/voice/useAutoReply';