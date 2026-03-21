import {useState} from 'react';
import {supabase} from '@/integrations/supabase/client';
import {useAuth} from './useAuth';
import {useToast} from './use-toast';

export type SubscriptionPlan  = {
    id: string;
    name: string;
    price: number;
    features: string[];
    popular?: boolean;
}

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
    {
        id: 'basic',
        name: 'Basic',
        price: 9.99,
        features: [
            'Unlimited messaging',
            'See who viewed you',
            'Basic filters',
            '10 daily likes',
        ],
    },
    {
        id: 'premium',
        name: 'Premium',
        price: 19.99,
        popular: true,
        features: [
            'All Basic features',
            'Priority in search',
            'Read receipts',
            'Advanced filters',
            'Unlimited likes',
            'Undo last swipe',
        ],
    },
    {
        id: 'vip',
        name: 'VIP',
        price: 49.99,
        features: [
            'All Premium features',
            'Verified badge',
            'Featured profile',
            'AI assistant',
            'Priority support',
            'Incognito mode',
            'See who liked you',
        ],
    },
];

export const usePayments = () => {
    const [isLoading, setIsLoading] = useState(false);
    const {user} = useAuth();
    const {toast} = useToast();

    const createCheckout = async (planId: string) => {
        if (!user) {
            toast({
                title: 'Please sign in',
                description: 'You need to be logged in to subscribe.',
                variant: 'destructive',
            });
            return null;
        }

        setIsLoading(true);
        try {
            const {data, error} = await supabase.functions.invoke('create-checkout', {
                body: {
                    planId,
                    userId: user.id,
                    successUrl: `${window.location.origin}/app?payment=success`,
                    cancelUrl: `${window.location.origin}/app?payment=cancelled`,
                },
            });

            if (error) throw error;

            if (data.url) {
                window.location.href = data.url;
            }

            return data;
        } catch (error) {
            console.error('Checkout error:', error);
            toast({
                title: 'Payment Error',
                description: 'Could not start checkout. Please try again.',
                variant: 'destructive',
            });
            return null;
        } finally {
            setIsLoading(false);
        }
    };

    const createBookingPayment = async (bookingId: string, amount: number) => {
        setIsLoading(true);
        try {
            const {data, error} = await supabase.functions.invoke('create-booking-payment', {
                body: {bookingId, amount},
            });

            if (error) throw error;

            return data;
        } catch (error) {
            console.error('Payment error:', error);
            toast({
                title: 'Payment Error',
                description: 'Could not process payment. Please try again.',
                variant: 'destructive',
            });
            return null;
        } finally {
            setIsLoading(false);
        }
    };

    return {
        isLoading,
        plans: SUBSCRIPTION_PLANS,
        createCheckout,
        createBookingPayment,
    };
};
