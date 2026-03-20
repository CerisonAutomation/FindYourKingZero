import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {supabase} from '@/integrations/supabase/client';
import {useAuth} from './useAuth';

export type ConsentType =
    | 'essential_cookies'
    | 'analytics_cookies'
    | 'marketing_cookies'
    | 'personalization_cookies'
    | 'data_processing'
    | 'age_verification'
    | 'terms_of_service'
    | 'privacy_policy';

export interface ConsentRecord {
    id: string;
    user_id: string;
    consent_type: ConsentType;
    consent_given: boolean;
    consent_version: string;
    given_at: string;
    withdrawn_at: string | null;
}

export interface ConsentState {
    essential_cookies: boolean;
    analytics_cookies: boolean;
    marketing_cookies: boolean;
    personalization_cookies: boolean;
    data_processing: boolean;
    age_verification: boolean;
    terms_of_service: boolean;
    privacy_policy: boolean;
}

const CONSENT_VERSION = '1.0';

export const useConsent = () => {
    const {user} = useAuth();
    const queryClient = useQueryClient();

    // Get current consent state
    const {data: consentRecords, isLoading} = useQuery({
        queryKey: ['consent-records', user?.id],
        queryFn: async () => {
            if (!user) return [];

            const {data, error} = await supabase
                .from('gdpr_consent_records')
                .select('*')
                .eq('user_id', user.id)
                .is('withdrawn_at', null)
                .order('given_at', {ascending: false});

            if (error) throw error;
            return data as ConsentRecord[];
        },
        enabled: !!user,
    });

    // Get consent state as object
    const getConsentState = (): ConsentState => {
        const state: ConsentState = {
            essential_cookies: true, // Always true - essential
            analytics_cookies: false,
            marketing_cookies: false,
            personalization_cookies: false,
            data_processing: false,
            age_verification: false,
            terms_of_service: false,
            privacy_policy: false,
        };

        if (consentRecords) {
            consentRecords.forEach(record => {
                if (record.consent_given && !record.withdrawn_at) {
                    state[record.consent_type] = true;
                }
            });
        }

        return state;
    };

    // Check if specific consent is given
    const hasConsent = (type: ConsentType): boolean => {
        if (type === 'essential_cookies') return true;
        return consentRecords?.some(
            r => r.consent_type === type && r.consent_given && !r.withdrawn_at
        ) || false;
    };

    // Record new consent
    const recordConsent = useMutation({
        mutationFn: async ({
                               type,
                               given
                           }: {
            type: ConsentType;
            given: boolean;
        }) => {
            if (!user) throw new Error('Not authenticated');

            const {data, error} = await supabase
                .from('gdpr_consent_records')
                .insert({
                    user_id: user.id,
                    consent_type: type,
                    consent_given: given,
                    consent_version: CONSENT_VERSION,
                    user_agent: navigator.userAgent,
                })
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['consent-records', user?.id]});
        },
    });

    // Record multiple consents at once
    const recordMultipleConsents = useMutation({
        mutationFn: async (consents: Partial<ConsentState>) => {
            if (!user) throw new Error('Not authenticated');

            const records = Object.entries(consents).map(([type, given]) => ({
                user_id: user.id,
                consent_type: type as ConsentType,
                consent_given: given,
                consent_version: CONSENT_VERSION,
                user_agent: navigator.userAgent,
            }));

            const {data, error} = await supabase
                .from('gdpr_consent_records')
                .insert(records)
                .select();

            if (error) throw error;

            // Update profile GDPR consent date
            await supabase
                .from('profiles')
                .update({
                    gdpr_consent_date: new Date().toISOString(),
                    marketing_consent: consents.marketing_cookies || false,
                    data_processing_consent: consents.data_processing || false,
                })
                .eq('user_id', user.id);

            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['consent-records', user?.id]});
            queryClient.invalidateQueries({queryKey: ['profile', user?.id]});
        },
    });

    // Withdraw consent
    const withdrawConsent = useMutation({
        mutationFn: async (type: ConsentType) => {
            if (!user) throw new Error('Not authenticated');

            // Find the active consent record
            const activeRecord = consentRecords?.find(
                r => r.consent_type === type && r.consent_given && !r.withdrawn_at
            );

            if (!activeRecord) return null;

            const {data, error} = await supabase
                .from('gdpr_consent_records')
                .update({withdrawn_at: new Date().toISOString()})
                .eq('id', activeRecord.id)
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['consent-records', user?.id]});
        },
    });

    return {
        consentRecords,
        isLoading,
        getConsentState,
        hasConsent,
        recordConsent: recordConsent.mutate,
        recordMultipleConsents: recordMultipleConsents.mutate,
        withdrawConsent: withdrawConsent.mutate,
        isRecording: recordConsent.isPending || recordMultipleConsents.isPending,
    };
};

// Cookie consent hook for non-authenticated users (localStorage based)
export const useCookieConsent = () => {
    const STORAGE_KEY = 'fyk_cookie_consent';

    const getStoredConsent = (): Partial<ConsentState> | null => {
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored ? JSON.parse(stored) : null;
    };

    const saveConsent = (consents: Partial<ConsentState>) => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
            ...consents,
            timestamp: new Date().toISOString(),
            version: CONSENT_VERSION,
        }));
    };

    const hasGivenConsent = (): boolean => {
        return !!getStoredConsent();
    };

    const clearConsent = () => {
        localStorage.removeItem(STORAGE_KEY);
    };

    return {
        getStoredConsent,
        saveConsent,
        hasGivenConsent,
        clearConsent,
    };
};
