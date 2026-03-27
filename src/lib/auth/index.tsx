/**
 * =============================================================================
 * AUTH RE-EXPORT — Canonical Source Delegation
 * =============================================================================
 *
 * This file delegates to the TRUE canonical auth source at /src/auth/canonical.tsx
 * This eliminates the duplicate auth system issue.
 *
 * @deprecated Import directly from '@/auth' instead
 * @see /src/auth/canonical.tsx — The ONE and ONLY auth source
 */

// Re-export EVERYTHING from the true canonical auth source
export * from '@/auth/canonical';
export { default } from '@/auth/canonical';
