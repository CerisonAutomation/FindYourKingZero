import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {supabase} from '@/integrations/supabase/client';
import {useAuth} from './useAuth';
import {useToast} from './use-toast';

export type VerificationType = 'age' | 'photo' | 'id' | 'video' | 'phone';
export type VerificationStatus = 'pending' | 'approved' | 'rejected' | 'expired';

export type VerificationRequest  = {
    id: string;
    user_id: string;
    verification_type: VerificationType;
    status: VerificationStatus;
    submitted_at: string;
    reviewed_at: string | null;
    reviewer_notes: string | null;
    metadata: Record<string, unknown>;
}

export const useVerification = () => {
    const {user} = useAuth();
    const {toast} = useToast();
    const queryClient = useQueryClient();

    // Get all verification requests for current user
    const {data: verificationRequests, isLoading} = useQuery({
        queryKey: ['verification-requests', user?.id],
        queryFn: async () => {
            if (!user) return [];

            const {data, error} = await supabase
                .from('verification_requests')
                .select('*')
                .eq('user_id', user.id)
                .order('submitted_at', {ascending: false});

            if (error) throw error;
            return data as VerificationRequest[];
        },
        enabled: !!user,
    });

    // Get verification status for a specific type
    const getVerificationStatus = (type: VerificationType): VerificationStatus | null => {
        const request = verificationRequests?.find(r => r.verification_type === type);
        return request?.status || null;
    };

    // Check if a verification type is approved
    const isVerified = (type: VerificationType): boolean => {
        return getVerificationStatus(type) === 'approved';
    };

    // Submit a new verification request
    const submitVerification = useMutation({
        mutationFn: async ({
                               type,
                               metadata
                           }: {
            type: VerificationType;
            metadata?: Record<string, unknown>;
        }) => {
            if (!user) throw new Error('Not authenticated');

            const {data, error} = await supabase
                .from('verification_requests')
                .insert([{
                    user_id: user.id,
                    verification_type: type,
                    metadata: (metadata || {}) as Record<string, string | number | boolean | null>,
                }])
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({queryKey: ['verification-requests', user?.id]});
            toast({
                title: 'Verification Submitted',
                description: `Your ${variables.type} verification is being processed.`,
            });
        },
        onError: (error: Error) => {
            toast({
                title: 'Verification Failed',
                description: error.message,
                variant: 'destructive',
            });
        },
    });

    // Upload verification document
    const uploadDocument = async (
        requestId: string,
        documentType: 'selfie' | 'id_front' | 'id_back' | 'video' | 'pose_photo',
        file: File
    ) => {
        if (!user) throw new Error('Not authenticated');

        const fileExt = file.name.split('.').pop();
        const filePath = `${user.id}/${requestId}/${documentType}.${fileExt}`;

        // Upload to storage
        const {error: uploadError} = await supabase.storage
            .from('verification-documents')
            .upload(filePath, file, {upsert: true});

        if (uploadError) throw uploadError;

        // Record in database
        const {error: dbError} = await supabase
            .from('verification_documents')
            .insert({
                request_id: requestId,
                document_type: documentType,
                storage_path: filePath,
            });

        if (dbError) throw dbError;

        return filePath;
    };

    // Submit age verification with date of birth
    const submitAgeVerification = useMutation({
        mutationFn: async (dateOfBirth: Date) => {
            if (!user) throw new Error('Not authenticated');

            // Calculate age
            const today = new Date();
            const birthDate = new Date(dateOfBirth);
            let age = today.getFullYear() - birthDate.getFullYear();
            const monthDiff = today.getMonth() - birthDate.getMonth();
            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                age--;
            }

            if (age < 18) {
                throw new Error('You must be at least 18 years old to use this service.');
            }

            // Update profile with DOB
            const {error: profileError} = await supabase
                .from('profiles')
                .update({
                    date_of_birth: dateOfBirth.toISOString().split('T')[0],
                    age: age,
                })
                .eq('user_id', user.id);

            if (profileError) throw profileError;

            // Create verification request
            const {data, error} = await supabase
                .from('verification_requests')
                .insert([{
                    user_id: user.id,
                    verification_type: 'age',
                    status: 'approved',
                    metadata: {declared_age: age, declared_dob: dateOfBirth.toISOString()},
                    reviewed_at: new Date().toISOString(),
                }])
                .select()
                .single();

            if (error) throw error;

            // Update profile verification status
            await supabase
                .from('profiles')
                .update({
                    age_verified: true,
                    age_verified_at: new Date().toISOString(),
                })
                .eq('user_id', user.id);

            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['verification-requests', user?.id]});
            queryClient.invalidateQueries({queryKey: ['profile', user?.id]});
            toast({
                title: 'Age Verified',
                description: 'Your age has been verified successfully.',
            });
        },
        onError: (error: Error) => {
            toast({
                title: 'Age Verification Failed',
                description: error.message,
                variant: 'destructive',
            });
        },
    });

    return {
        verificationRequests,
        isLoading,
        getVerificationStatus,
        isVerified,
        submitVerification: submitVerification.mutate,
        submitAgeVerification: submitAgeVerification.mutate,
        uploadDocument,
        isSubmitting: submitVerification.isPending || submitAgeVerification.isPending,
    };
};
