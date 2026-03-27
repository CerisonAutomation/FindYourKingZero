/**
 * =============================================================================
 * AUTH COMPONENTS — Compatibility Redirect
 * =============================================================================
 * 
 * This barrel file re-exports all auth components and utilities from the
 * canonical auth system at @/auth. Import from @/auth directly for new code.
 * 
 * @module components/auth
 * @version 15.0.0
 */

// Re-export all auth components and hooks from canonical source
export {
  AuthProvider,
  useAuth,
  useAuthStatus,
  useRequireAuth,
  useAuthStore,
  AuthContext,
  ProtectedRoute,
  PublicRoute,
  RoleRoute,
  authService,
  biometricAuth,
  BiometricAuthService,
  supabase,
  classifyAuthError,
  authQueryKeys,
  useAuthSessionQuery,
  useSignInMutation,
  useSignOutMutation,
} from '@/auth';

export type {
  AuthContextType,
  AuthState,
  UserRole,
  UserPermissions,
  SubscriptionTier,
  AuthErrorCode,
  ClassifiedAuthError,
  BiometricResult,
  RouteGuardConfig,
} from '@/auth';