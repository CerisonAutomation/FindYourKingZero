import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {supabase} from '@/integrations/supabase/client';
import {useAuth} from './useAuth';
import {useToast} from './use-toast';

export type DataRequestType = 'export' | 'deletion' | 'rectification' | 'restriction';
export type DataRequestStatus = 'pending' | 'processing' | 'completed' | 'rejected' | 'cancelled';

export type DataRequest  = {
    id: string;
    user_id: string;
    request_type: DataRequestType;
    status: DataRequestStatus;
    requested_at: string;
    processed_at: string | null;
    notes: string | null;
    download_url: string | null;
    download_expires_at: string | null;
    scheduled_deletion_at: string | null;
}

export const useGDPR = () => {
    const {user} = useAuth();
    const {toast} = useToast();
    const queryClient = useQueryClient();

    // Get all data requests for current user
    const {data: dataRequests, isLoading} = useQuery({
        queryKey: ['data-requests', user?.id],
        queryFn: async () => {
            if (!user) return [];

            const {data, error} = await supabase
                .from('gdpr_data_requests')
                .select('*')
                .eq('user_id', user.id)
                .order('requested_at', {ascending: false});

            if (error) throw error;
            return data as DataRequest[];
        },
        enabled: !!user,
    });

    // Check if there's a pending deletion request
    const hasPendingDeletion = dataRequests?.some(
        r => r.request_type === 'deletion' && ['pending', 'processing'].includes(r.status)
    );

    // Get the scheduled deletion date if any
    const scheduledDeletionDate = dataRequests?.find(
        r => r.request_type === 'deletion' && r.scheduled_deletion_at
    )?.scheduled_deletion_at;

    // Request data export
    const requestDataExport = useMutation({
        mutationFn: async () => {
            if (!user) throw new Error('Not authenticated');

            const {data, error} = await supabase
                .from('gdpr_data_requests')
                .insert({
                    user_id: user.id,
                    request_type: 'export',
                })
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['data-requests', user?.id]});
            toast({
                title: 'Export Request Submitted',
                description: 'Your data export will be ready within 30 days. You will receive an email when it\'s available.',
            });
        },
        onError: (error: Error) => {
            toast({
                title: 'Request Failed',
                description: error.message,
                variant: 'destructive',
            });
        },
    });

    // Request account deletion (30-day grace period)
    const requestAccountDeletion = useMutation({
        mutationFn: async () => {
            if (!user) throw new Error('Not authenticated');

            // Calculate scheduled deletion date (30 days from now)
            const scheduledDate = new Date();
            scheduledDate.setDate(scheduledDate.getDate() + 30);

            const {data, error} = await supabase
                .from('gdpr_data_requests')
                .insert({
                    user_id: user.id,
                    request_type: 'deletion',
                    scheduled_deletion_at: scheduledDate.toISOString(),
                })
                .select()
                .single();

            if (error) throw error;

            // Update profile to mark deletion requested
            await supabase
                .from('profiles')
                .update({
                    account_deletion_requested_at: new Date().toISOString(),
                })
                .eq('user_id', user.id);

            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['data-requests', user?.id]});
            queryClient.invalidateQueries({queryKey: ['profile', user?.id]});
            toast({
                title: 'Account Deletion Scheduled',
                description: 'Your account will be permanently deleted in 30 days. You can cancel this request anytime before then.',
            });
        },
        onError: (error: Error) => {
            toast({
                title: 'Request Failed',
                description: error.message,
                variant: 'destructive',
            });
        },
    });

    // Cancel deletion request
    const cancelDeletionRequest = useMutation({
        mutationFn: async () => {
            if (!user) throw new Error('Not authenticated');

            const pendingDeletion = dataRequests?.find(
                r => r.request_type === 'deletion' && ['pending', 'processing'].includes(r.status)
            );

            if (!pendingDeletion) throw new Error('No pending deletion request found');

            const {data, error} = await supabase
                .from('gdpr_data_requests')
                .update({status: 'cancelled'})
                .eq('id', pendingDeletion.id)
                .select()
                .single();

            if (error) throw error;

            // Clear deletion request from profile
            await supabase
                .from('profiles')
                .update({
                    account_deletion_requested_at: null,
                })
                .eq('user_id', user.id);

            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['data-requests', user?.id]});
            queryClient.invalidateQueries({queryKey: ['profile', user?.id]});
            toast({
                title: 'Deletion Cancelled',
                description: 'Your account deletion request has been cancelled. Your account will remain active.',
            });
        },
        onError: (error: Error) => {
            toast({
                title: 'Cancellation Failed',
                description: error.message,
                variant: 'destructive',
            });
        },
    });

    return {
        dataRequests,
        isLoading,
        hasPendingDeletion,
        scheduledDeletionDate,
        requestDataExport: requestDataExport.mutate,
        requestAccountDeletion: requestAccountDeletion.mutate,
        cancelDeletionRequest: cancelDeletionRequest.mutate,
        isRequesting: requestDataExport.isPending || requestAccountDeletion.isPending,
    };
};
