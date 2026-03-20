import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {supabase} from '@/integrations/supabase/client';
import {useAuth} from './useAuth';
import {useToast} from './use-toast';
import {REPORT_REASONS} from '@/lib/constants';

export interface Report {
    id: string;
    reporter_id: string;
    reported_id: string;
    reason: string;
    details: string | null;
    status: 'pending' | 'reviewed' | 'resolved';
    created_at: string;
}

export function useReports() {
    const {user} = useAuth();
    const queryClient = useQueryClient();
    const {toast} = useToast();

    // Get reports submitted by user
    const {data: reports, isLoading} = useQuery({
        queryKey: ['reports', user?.id],
        queryFn: async () => {
            if (!user) return [];

            const {data, error} = await supabase
                .from('reports')
                .select('*')
                .eq('reporter_id', user.id)
                .order('created_at', {ascending: false});

            if (error) throw error;
            return data as Report[];
        },
        enabled: !!user,
    });

    // Submit report mutation
    const submitReport = useMutation({
        mutationFn: async ({
                               reportedId,
                               reason,
                               details,
                           }: {
            reportedId: string;
            reason: string;
            details?: string;
        }) => {
            if (!user) throw new Error('Not authenticated');

            // Validate reason
            if (!REPORT_REASONS.includes(reason as any)) {
                throw new Error('Invalid report reason');
            }

            // Check for existing report
            const {data: existing} = await supabase
                .from('reports')
                .select('id')
                .eq('reporter_id', user.id)
                .eq('reported_id', reportedId)
                .eq('status', 'pending')
                .single();

            if (existing) {
                throw new Error('You have already reported this user');
            }

            const {error} = await supabase
                .from('reports')
                .insert({
                    reporter_id: user.id,
                    reported_id: reportedId,
                    reason,
                    details: details?.trim() || null,
                });

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['reports', user?.id]});
            toast({
                title: 'Report submitted',
                description: 'Thank you for your report. We will review it shortly.',
            });
        },
        onError: (error: Error) => {
            toast({
                title: 'Error',
                description: error.message,
                variant: 'destructive',
            });
        },
    });

    // Check if user has been reported
    const hasReported = (userId: string): boolean => {
        return reports?.some((report) => report.reported_id === userId) || false;
    };

    return {
        reports: reports || [],
        isLoading,
        submitReport: submitReport.mutate,
        isSubmitting: submitReport.isPending,
        hasReported,
        reportReasons: REPORT_REASONS,
    };
}
