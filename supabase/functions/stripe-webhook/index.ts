import {serve} from "https://deno.land/std@0.168.0/http/server.ts";
import {createClient} from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature',
};

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response(null, {headers: corsHeaders});
    }

    try {
        const STRIPE_WEBHOOK_SECRET = Deno.env.get('STRIPE_WEBHOOK_SECRET');
        const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
        const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

        const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

        const body = await req.text();
        const signature = req.headers.get('stripe-signature');

        console.log("Webhook received");

        // Parse the event (in production, verify signature with STRIPE_WEBHOOK_SECRET)
        let event;
        try {
            event = JSON.parse(body);
        } catch (err) {
            console.error("Invalid JSON:", err);
            return new Response("Invalid JSON", {status: 400});
        }

        console.log("Event type:", event.type);

        switch (event.type) {
            case 'checkout.session.completed': {
                const session = event.data.object;
                const userId = session.metadata?.user_id;
                const planId = session.metadata?.plan_id;

                if (userId && planId) {
                    console.log(`Subscription activated for user: ${userId}, plan: ${planId}`);

                    // Update user's subscription status in profiles or a subscriptions table
                    await supabase
                        .from('profiles')
                        .update({
                            subscription_plan: planId,
                            subscription_status: 'active',
                            subscription_updated_at: new Date().toISOString(),
                        })
                        .eq('user_id', userId);

                    // Create notification
                    await supabase
                        .from('notifications')
                        .insert({
                            user_id: userId,
                            type: 'system',
                            title: 'Subscription Activated!',
                            body: `Welcome to FIND YOUR KING ${planId.charAt(0).toUpperCase() + planId.slice(1)}! Enjoy your premium features.`,
                        });
                }
                break;
            }

            case 'payment_intent.succeeded': {
                const paymentIntent = event.data.object;
                const bookingId = paymentIntent.metadata?.booking_id;

                if (bookingId) {
                    console.log(`Payment succeeded for booking: ${bookingId}`);

                    await supabase
                        .from('bookings')
                        .update({
                            payment_status: 'paid',
                            stripe_payment_id: paymentIntent.id,
                        })
                        .eq('id', bookingId);

                    // Notify both parties
                    const {data: booking} = await supabase
                        .from('bookings')
                        .select('seeker_id, provider_id')
                        .eq('id', bookingId)
                        .single();

                    if (booking) {
                        await supabase.from('notifications').insert([
                            {
                                user_id: booking.seeker_id,
                                type: 'booking',
                                title: 'Payment Confirmed',
                                body: 'Your booking payment has been processed successfully.',
                                data: {booking_id: bookingId},
                            },
                            {
                                user_id: booking.provider_id,
                                type: 'booking',
                                title: 'Booking Paid',
                                body: 'A booking has been paid. Check your bookings for details.',
                                data: {booking_id: bookingId},
                            },
                        ]);
                    }
                }
                break;
            }

            case 'customer.subscription.deleted': {
                const subscription = event.data.object;
                const customerId = subscription.customer;

                console.log(`Subscription cancelled for customer: ${customerId}`);

                // Find user by customer ID and update status
                // Note: You'd need to store Stripe customer ID in your profiles table
                break;
            }

            default:
                console.log(`Unhandled event type: ${event.type}`);
        }

        return new Response(JSON.stringify({received: true}), {
            headers: {...corsHeaders, "Content-Type": "application/json"},
        });
    } catch (error) {
        console.error("Webhook error:", error);
        return new Response(
            JSON.stringify({error: error instanceof Error ? error.message : "Unknown error"}),
            {status: 500, headers: {...corsHeaders, "Content-Type": "application/json"}}
        );
    }
});
