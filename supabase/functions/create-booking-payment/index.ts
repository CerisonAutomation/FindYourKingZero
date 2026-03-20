import {serve} from "https://deno.land/std@0.168.0/http/server.ts";
import {createClient} from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response(null, {headers: corsHeaders});
    }

    try {
        const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_SECRET_KEY');
        const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
        const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

        if (!STRIPE_SECRET_KEY) {
            console.log("Stripe not configured - returning mock payment");
            return new Response(
                JSON.stringify({
                    clientSecret: null,
                    message: "Payments coming soon! Booking confirmed without payment.",
                    mock: true
                }),
                {headers: {...corsHeaders, "Content-Type": "application/json"}}
            );
        }

        const {bookingId, amount, currency = 'usd'} = await req.json();

        if (!bookingId || !amount) {
            throw new Error("Missing booking ID or amount");
        }

        console.log(`Creating payment intent for booking: ${bookingId}, amount: ${amount}`);

        const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

        // Verify booking exists
        const {data: booking, error: bookingError} = await supabase
            .from('bookings')
            .select('*')
            .eq('id', bookingId)
            .single();

        if (bookingError || !booking) {
            throw new Error("Booking not found");
        }

        // Create Stripe PaymentIntent
        const response = await fetch('https://api.stripe.com/v1/payment_intents', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                'amount': Math.round(amount * 100).toString(), // Convert to cents
                'currency': currency,
                'metadata[booking_id]': bookingId,
                'metadata[seeker_id]': booking.seeker_id,
                'metadata[provider_id]': booking.provider_id,
                'automatic_payment_methods[enabled]': 'true',
            }),
        });

        const paymentIntent = await response.json();

        if (!response.ok) {
            console.error("Stripe error:", paymentIntent);
            throw new Error(paymentIntent.error?.message || "Failed to create payment intent");
        }

        // Update booking with payment intent ID
        await supabase
            .from('bookings')
            .update({stripe_payment_id: paymentIntent.id})
            .eq('id', bookingId);

        console.log("Payment intent created:", paymentIntent.id);

        return new Response(
            JSON.stringify({
                clientSecret: paymentIntent.client_secret,
                paymentIntentId: paymentIntent.id
            }),
            {headers: {...corsHeaders, "Content-Type": "application/json"}}
        );
    } catch (error) {
        console.error("Payment error:", error);
        return new Response(
            JSON.stringify({error: error instanceof Error ? error.message : "Unknown error"}),
            {status: 500, headers: {...corsHeaders, "Content-Type": "application/json"}}
        );
    }
});
