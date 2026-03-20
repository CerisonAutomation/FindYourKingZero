import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {supabase} from '@/integrations/supabase/client';
import {useAuth} from './useAuth';
import {useEffect} from 'react';
import {useToast} from './use-toast';

export interface Notification {
    id: string;
    user_id: string;
    type: string;
    title: string;
    body: string | null;
    data: Record<string, unknown> | null;
    is_read: boolean;
    created_at: string;
}

export const useNotifications = () => {
    const {user} = useAuth();
    const {toast} = useToast();
    const queryClient = useQueryClient();

    const {data: notifications = [], isLoading} = useQuery({
        queryKey: ['notifications', user?.id],
        queryFn: async () => {
            if (!user) return [];

            const {data, error} = await supabase
                .from('notifications')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', {ascending: false})
                .limit(50);

            if (error) throw error;
            return data as Notification[];
        },
        enabled: !!user,
    });

    // Subscribe to new notifications in realtime
    useEffect(() => {
        if (!user) return;

        const channel = supabase
            .channel('notifications-realtime')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'notifications',
                    filter: `user_id=eq.${user.id}`,
                },
                (payload) => {
                    const notification = payload.new as Notification;
                    queryClient.invalidateQueries({queryKey: ['notifications']});

                    // Show toast for new notification
                    toast({
                        title: notification.title,
                        description: notification.body || undefined,
                    });
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user, queryClient, toast]);

    const markAsRead = useMutation({
        mutationFn: async (notificationId: string) => {
            const {error} = await supabase
                .from('notifications')
                .update({is_read: true})
                .eq('id', notificationId);

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['notifications']});
        },
    });

    const markAllAsRead = useMutation({
        mutationFn: async () => {
            if (!user) throw new Error('Not authenticated');

            const {error} = await supabase
                .from('notifications')
                .update({is_read: true})
                .eq('user_id', user.id)
                .eq('is_read', false);

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['notifications']});
        },
    });

    const deleteNotification = useMutation({
        mutationFn: async (notificationId: string) => {
            const {error} = await supabase
                .from('notifications')
                .delete()
                .eq('id', notificationId);

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['notifications']});
        },
    });

    const unreadCount = notifications.filter((n) => !n.is_read).length;

    return {
        notifications,
        isLoading,
        unreadCount,
        markAsRead: markAsRead.mutate,
        markAllAsRead: markAllAsRead.mutate,
        deleteNotification: deleteNotification.mutate,
    };
};

// Hook for registering push notifications
export const usePushNotifications = () => {
    const {user} = useAuth();
    const {toast} = useToast();

    const registerPush = async () => {
        if (!user) return;
        if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
            toast({
                title: 'Push notifications not supported',
                description: 'Your browser does not support push notifications.',
                variant: 'destructive',
            });
            return;
        }

        try {
            const permission = await Notification.requestPermission();
            if (permission !== 'granted') {
                toast({
                    title: 'Permission denied',
                    description: 'Please enable notifications in your browser settings.',
                    variant: 'destructive',
                });
                return;
            }

            // Register service worker
            const registration = await navigator.serviceWorker.register('/sw.js');

            // Get push subscription
            const subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(
                    import.meta.env.VITE_VAPID_PUBLIC_KEY || ''
                ),
            });

            // Save subscription to database
            const {error} = await supabase.from('push_subscriptions').insert({
                user_id: user.id,
                endpoint: subscription.endpoint,
                p256dh: arrayBufferToBase64(subscription.getKey('p256dh')),
                auth_key: arrayBufferToBase64(subscription.getKey('auth')),
            });

            if (error && !error.message.includes('duplicate')) throw error;

            toast({
                title: 'Notifications enabled! 🔔',
                description: 'You will now receive push notifications.',
            });
        } catch (error) {
            console.error('Push registration error:', error);
            toast({
                title: 'Error',
                description: 'Could not enable push notifications.',
                variant: 'destructive',
            });
        }
    };

    return {registerPush};
};

// Helper functions
function urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
        .replace(/-/g, '+')
        .replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length) as Uint8Array<ArrayBuffer>;
    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

function arrayBufferToBase64(buffer: ArrayBuffer | null): string {
    if (!buffer) return '';
    const bytes = new Uint8Array(buffer as ArrayBuffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
}
