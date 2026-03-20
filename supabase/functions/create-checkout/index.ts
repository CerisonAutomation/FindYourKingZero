import {serve} from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Subscription plans configuration
const PLANS = {
    basic: {
        name: 'Basic',
        price: 999, // $9.99 in cents
        features: ['Unlimited messaging', 'See who viewed you', 'Basic filters'],
    },
    premium: {
        name: 'Premium',
        price: 1999, // $19.99 in cents
        features: ['All Basic features', 'Priority in search', 'Read receipts', 'Advanced filters'],
    },
    vip: {
        name: 'VIP',
        price: 4999, // $49.99 in cents
        features: ['All Premium features', 'Verified badge', 'Featured profile', 'AI assistant', 'Priority support'],
    },
};

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response(null, {headers: corsHeaders});
    }

    try {
        const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_SECRET_KEY');

        if (!STRIPE_SECRET_KEY) {
            console.log("Stripe not configured - returning mock checkout URL");
            // Return mock data when Stripe is not configured
            return new Response(
                JSON.stringify({
                    url: null,
                    message: "Stripe payments coming soon! Contact support for early access.",
                    mock: true
                }),
                {headers: {...corsHeaders, "Content-Type": "application/json"}}
            );
        }

        const {planId, userId, successUrl, cancelUrl} = await req.json();

        if (!planId || !PLANS[planId as keyof typeof PLANS]) {
            throw new Error("Invalid plan selected");
        }

        const plan = PLANS[planId as keyof typeof PLANS];

        console.log(`Creating checkout for plan: ${planId}, user: ${userId}`);

        // Create Stripe checkout session
        const response = await fetch('https://api.stripe.com/v1/checkout/sessions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                'mode': 'subscription',
                'success_url': successUrl || `${req.headers.get('origin')}/app?payment=success`,
                'cancel_url': cancelUrl || `${req.headers.get('origin')}/app?payment=cancelled`,
                'line_items[0][price_data][currency]': 'usd',
                'line_items[0][price_data][product_data][name]': `MACHOBB ${plan.name}`,
                'line_items[0][price_data][product_data][description]': plan.features.join(', '),
                'line_items[0][price_data][recurring][interval]': 'month',
                'line_items[0][price_data][unit_amount]': plan.price.toString(),
                'line_items[0][quantity]': '1',
                'metadata[user_id]': userId || '',
                'metadata[plan_id]': planId,
            }),
        });

        const session = await response.json();

        if (!response.ok) {
            console.error("Stripe error:", session);
            throw new Error(session.error?.message || "Failed to create checkout session");
        }

        console.log("Checkout session created:", session.id);

        return new Response(
            JSON.stringify({url: session.url, sessionId: session.id}),
            {headers: {...corsHeaders, "Content-Type": "application/json"}}
        );
    } catch (error) {
        console.error("Checkout error:", error);
        return new Response(
            JSON.stringify({error: error instanceof Error ? error.message : "Unknown error"}),
            {status: 500, headers: {...corsHeaders, "Content-Type": "application/json"}}
        );
    }
});
