/**
 * AuthRoutes.tsx — Authentication-based route protection components
 * 
 * Features:
 * - ProtectedRoute: Only accessible to authenticated users
 * - PublicRoute: Only accessible to non-authenticated users (hides marketing when signed in)
 * - Loading states with skeleton UI
 * - Automatic redirects with location state preservation
 * 
 * Best Practices from:
 * - React Router protected routes: https://ui.dev/react-router-protected-routes-authentication
 * - Robin Wieruch patterns: https://www.robinwieruch.de/react-router-private-routes/
 */

import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { motion } from 'framer-motion';

// Loading skeleton for auth state check
function AuthLoadingSkeleton() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center gap-4"
      >
        <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
        <p className="text-sm text-muted-foreground">Loading...</p>
      </motion.div>
    </div>
  );
}

interface ProtectedRouteProps {
  children: ReactNode;
  fallback?: ReactNode;
  redirectTo?: string;
}

/**
 * ProtectedRoute — Only renders children if user is authenticated
 * Unauthenticated users are redirected to login
 * 
 * @example
 * <ProtectedRoute>
 *   <Dashboard />
 * </ProtectedRoute>
 */
export function ProtectedRoute({
  children,
  fallback,
  redirectTo = '/connect',
}: ProtectedRouteProps) {
  const { user, isLoading, isInitialized } = useAuth();
  const location = useLocation();

  // Show loading state while initializing
  if (!isInitialized || isLoading) {
    return fallback ? <>{fallback}</> : <AuthLoadingSkeleton />;
  }

  // Redirect unauthenticated users to login
  // Preserve the location they tried to access for post-login redirect
  if (!user) {
    return (
      <Navigate
        to={redirectTo}
        replace
        state={{ from: location.pathname + location.search }}
      />
    );
  }

  return <>{children}</>;
}

interface PublicRouteProps {
  children: ReactNode;
  fallback?: ReactNode;
  redirectTo?: string;
  /**
   * If true, authenticated users CAN access this route
   * (e.g., public pages that also work when logged in)
   */
  allowAuthenticated?: boolean;
}

/**
 * PublicRoute — For routes that should hide when user is signed in
 * Default behavior: Redirects authenticated users to the app
 * 
 * Use cases:
 * - Landing/marketing pages (hide when signed in)
 * - Login page (redirect to app if already logged in)
 * - Sign up page (redirect to app if already logged in)
 * 
 * @example
 * // Hide landing page when signed in
 * <PublicRoute>
 *   <HomePage />
 * </PublicRoute>
 * 
 * // Allow both authenticated and non-authenticated
 * <PublicRoute allowAuthenticated>
 *   <PricingPage />
 * </PublicRoute>
 */
export function PublicRoute({
  children,
  fallback,
  redirectTo = '/app',
  allowAuthenticated = false,
}: PublicRouteProps) {
  const { user, isLoading, isInitialized } = useAuth();
  const location = useLocation();

  // Show loading state while initializing
  if (!isInitialized || isLoading) {
    return fallback ? <>{fallback}</> : <AuthLoadingSkeleton />;
  }

  // If user is authenticated and we don't allow authenticated access,
  // redirect them to the app
  if (user && !allowAuthenticated) {
    // Check if there's a "from" state (previous attempted URL)
    const from = location.state?.from;
    return <Navigate to={from || redirectTo} replace />;
  }

  return <>{children}</>;
}

interface AuthGuardProps {
  children: ReactNode;
  requireAuth: boolean;
  redirectTo?: string;
}

/**
 * AuthGuard — Flexible auth guard that can require or forbid authentication
 * 
 * @example
 * <AuthGuard requireAuth={true}>
 *   <PrivateContent />
 * </AuthGuard>
 * 
 * <AuthGuard requireAuth={false}>
 *   <PublicOnlyContent />
 * </AuthGuard>
 */
export function AuthGuard({
  children,
  requireAuth,
  redirectTo = requireAuth ? '/connect' : '/app',
}: AuthGuardProps) {
  const { user, isLoading, isInitialized } = useAuth();
  const location = useLocation();

  if (!isInitialized || isLoading) {
    return <AuthLoadingSkeleton />;
  }

  const isAuthenticated = !!user;

  if (requireAuth && !isAuthenticated) {
    return (
      <Navigate
        to={redirectTo}
        replace
        state={{ from: location.pathname + location.search }}
      />
    );
  }

  if (!requireAuth && isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
}

// Role-based access control (if you have roles in your app)
interface RoleRouteProps {
  children: ReactNode;
  allowedRoles: string[];
  fallback?: ReactNode;
  redirectTo?: string;
}

/**
 * RoleRoute — Restrict access based on user roles
 * 
 * @example
 * <RoleRoute allowedRoles={['admin', 'moderator']}>
 *   <AdminPanel />
 * </RoleRoute>
 */
export function RoleRoute({
  children,
  allowedRoles,
  fallback,
  redirectTo = '/app',
}: RoleRouteProps) {
  const { user, isLoading, isInitialized } = useAuth();

  if (!isInitialized || isLoading) {
    return fallback ? <>{fallback}</> : <AuthLoadingSkeleton />;
  }

  // Get user role from user metadata (adjust based on your auth setup)
  const userRole = user?.user_metadata?.role as string | undefined;

  if (!user || !userRole || !allowedRoles.includes(userRole)) {
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
}

export default ProtectedRoute;
