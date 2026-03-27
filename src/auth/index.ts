/**
 * =============================================================================
 * AUTH MODULE — Canonical Export Index
 * =============================================================================
 *
 * Single entry point for ALL authentication functionality.
 * Import everything auth-related from this module.
 *
 * @example
 * ```tsx
 * import { AuthProvider, useAuth, ProtectedRoute } from '@/auth';
 * import { authService, biometricAuth } from '@/auth';
 * ```
 */

// Core exports from canonical auth system
export {
  // Providers & Context
  AuthProvider,
  AuthContext,

  // Hooks
  useAuth,
  useAuthStatus,
  useRequireAuth,
  useAuthStore,
  useAuthSessionQuery,
  useSignInMutation,
  useSignOutMutation,

  // Route Guards
  ProtectedRoute,
  PublicRoute,
  RoleRoute,

  // Services
  authService,
  biometricAuth,
  BiometricAuthService,

  // Client
  supabase,

  // Utilities
  classifyAuthError,

  // Constants & Config
  authQueryKeys,
} from './canonical';

// Types
export type {
  UserRole,
  UserPermissions,
  SubscriptionTier,
  AuthErrorCode,
  ClassifiedAuthError,
  AuthState,
  BiometricResult,
  RouteGuardConfig,
  AuthContextType,
} from './canonical';

// Default export
export { default } from './canonical';
