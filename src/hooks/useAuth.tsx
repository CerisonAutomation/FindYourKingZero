import {createContext, ReactNode, useContext, useEffect, useState} from 'react';
import {Session, User, AuthError} from '@supabase/supabase-js';
import {supabase} from '@/integrations/supabase/client';
import {log} from '@/lib/enterprise/Logger';

interface AuthContextType {
    user: User | null;
    session: Session | null;
    isLoading: boolean;
    isInitialized: boolean;
    error: AuthError | null;
    signOut: () => Promise<void>;
    signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
    signUp: (email: string, password: string, displayName: string) => Promise<{ error: AuthError | null }>;
    signInWithMagicLink: (email: string) => Promise<{ error: AuthError | null }>;
    resetPassword: (email: string) => Promise<{ error: AuthError | null }>;
    clearError: () => void;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    session: null,
    isLoading: false,
    isInitialized: false,
    error: null,
    signOut: async () => {},
    signIn: async () => ({ error: null }),
    signUp: async () => ({ error: null }),
    signInWithMagicLink: async () => ({ error: null }),
    resetPassword: async () => ({ error: null }),
    clearError: () => {},
});

export const AuthProvider = ({children}: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false);
    const [error, setError] = useState<AuthError | null>(null);

    const clearError = () => setError(null);

    const handleError = (error: AuthError | null) => {
        setError(error);
        if (error) {
            log.error('AUTH', 'Authentication error occurred', error);
        }
    };

    useEffect(() => {
        // Set up auth state listener FIRST
        const {data: {subscription}} = supabase.auth.onAuthStateChange(
            async (event, session) => {
                log.info('AUTH', 'Auth state changed', {
                    event,
                    userId: session?.user?.id,
                    hasSession: !!session
                });

                setSession(session);
                setUser(session?.user ?? null);
                setIsLoading(false);
                setIsInitialized(true);

                // Clear any previous errors on successful auth change
                if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
                    clearError();
                }

                // Update online status when auth changes
                if (session?.user && (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED')) {
                    // Don't wait for this to complete to avoid blocking UI
                    updateOnlineStatus(session.user.id, true).catch((error) => {
                        log.warn('AUTH', 'Failed to update online status', error);
                    });
                }
            }
        );

        // THEN check for existing session
        const initializeAuth = async () => {
            try {
                const {data: {session}, error} = await supabase.auth.getSession();

                if (error) {
                    handleError(error);
                } else {
                    setSession(session);
                    setUser(session?.user ?? null);

                    // Update online status for existing session
                    if (session?.user) {
                        updateOnlineStatus(session.user.id, true).catch(console.error);
                    }
                }
            } catch (err) {
                log.error('AUTH', 'Error initializing auth', err as Error);
                handleError(err as AuthError);
            } finally {
                setIsLoading(false);
                setIsInitialized(true);
            }
        };

        initializeAuth();

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    const updateOnlineStatus = async (userId: string, isOnline: boolean) => {
        try {
            await supabase
                .from('profiles')
                .update({
                    is_online: isOnline,
                    last_seen: new Date().toISOString()
                })
                .eq('user_id', userId);
        } catch (error) {
            log.error('AUTH', 'Error updating online status', error as Error);
        }
    };

    const signOut = async () => {
        setIsLoading(true);
        clearError();

        try {
            if (user) {
                await updateOnlineStatus(user.id, false);
            }
            const {error} = await supabase.auth.signOut();

            if (error) {
                handleError(error);
            }
        } catch (err) {
            handleError(err as AuthError);
        } finally {
            setIsLoading(false);
        }
    };

    const signIn = async (email: string, password: string) => {
        setIsLoading(true);
        clearError();

        try {
            const {error} = await supabase.auth.signInWithPassword({email, password});
            handleError(error);
            return { error };
        } catch (err) {
            const authError = err as AuthError;
            handleError(authError);
            return { error: authError };
        } finally {
            setIsLoading(false);
        }
    };

    const signUp = async (email: string, password: string, displayName: string) => {
        setIsLoading(true);
        clearError();

        try {
            const {error} = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {display_name: displayName},
                    emailRedirectTo: `${window.location.origin}/auth/callback`,
                },
            });
            handleError(error);
            return { error };
        } catch (err) {
            const authError = err as AuthError;
            handleError(authError);
            return { error: authError };
        } finally {
            setIsLoading(false);
        }
    };

    const signInWithMagicLink = async (email: string) => {
        setIsLoading(true);
        clearError();

        try {
            const {error} = await supabase.auth.signInWithOtp({
                email,
                options: {emailRedirectTo: `${window.location.origin}/auth/callback`},
            });
            handleError(error);
            return { error };
        } catch (err) {
            const authError = err as AuthError;
            handleError(authError);
            return { error: authError };
        } finally {
            setIsLoading(false);
        }
    };

    const resetPassword = async (email: string) => {
        setIsLoading(true);
        clearError();

        try {
            const {error} = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/auth/reset-password`,
            });
            handleError(error);
            return { error };
        } catch (err) {
            const authError = err as AuthError;
            handleError(authError);
            return { error: authError };
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AuthContext.Provider value={{
            user,
            session,
            isLoading,
            isInitialized,
            error,
            signOut,
            signIn,
            signUp,
            signInWithMagicLink,
            resetPassword,
            clearError
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
