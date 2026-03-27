/**
 * =============================================================================
 * VERIFICATION FEATURE MODULE — Canonical Export Index v15.0
 * =============================================================================
 *
 * Single entry point for ALL verification functionality.
 *
 * Standards: 15/10 Legendary | Zero-Trust | WCAG 3.0 AAA
 *
 * @module features/verification
 * @version 15.0.0
 */

// Pages
export { default as VerificationPage } from './pages/VerificationPage';

// Hooks (re-exported from hooks directory)
export { useVerification } from '@/hooks/useVerification';