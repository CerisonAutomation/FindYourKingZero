/**
 * =============================================================================
 * useAuth — Canonical Re-export
 * =============================================================================
 * 
 * This file is a canonical re-export from the unified auth system.
 * All auth logic lives in: src/lib/auth/index.tsx
 * 
 * @deprecated Direct imports from this file. Use `@/lib/auth` instead.
 * @see src/lib/auth/index.tsx
 */

// Re-export everything from the canonical auth module
export {
  AuthProvider,
  useAuth,
  AuthContext,
  BiometricAuth,
  useBiometricAuth,
  authService,
  classifyAuthError,
  AuthErrorCode,
  supabase,
  supabaseAuth,
  ProtectedRoute,
  PublicRoute,
  AuthGuard,
  RoleRoute,
  type AuthContextValue,
  type AuthState,
  type ClassifiedAuthError,
  type UserRole,
  type UserPermissions,
  type BiometricResult,
  type ProtectedRouteProps,
  type PublicRouteProps,
  type AuthGuardProps,
  type RoleRouteProps,
} from '@/lib/auth';