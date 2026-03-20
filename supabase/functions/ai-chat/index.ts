const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const SYSTEM_PROMPTS: Record<string, string> = {
    companion: `You are a warm, empathetic AI companion for Find Your King, a premium gay dating and social app. Be supportive, friendly, and helpful. Keep responses concise and conversational. Be sex-positive and inclusive.`,

    coach: `You are a dating coach AI for gay men on Find Your King. Give confident, actionable advice about dating, attraction, and relationships. Be direct, positive, and encouraging. Keep it real.`,

    safety: `You are a safety advisor AI for a gay dating app. Help users stay safe, recognize red flags, and make smart decisions when meeting people online and in person. Prioritize harm prevention.`,

    icebreaker: `You are a witty AI that creates perfect icebreaker messages and conversation starters for gay dating apps. Keep it flirty, fun, and authentic. Under 80 chars each.`,

    quick_reply: `Generate exactly 3 short, smart reply suggestions for the given dating app conversation. Each must be under 60 characters. Be flirty, engaging, and natural. Return ONLY a JSON array of 3 strings, nothing else. Example: ["Hey cutie!", "You seem interesting", "Want to grab coffee?"]`,

    chat: `You are a friendly and flirty AI assistant for Find Your King, a premium gay dating and social app. Be warm, supportive, inclusive, and sex-positive. Use casual, friendly language. Keep responses concise but helpful.`,

    auto_reply: `You are generating a smart auto-reply for a dating app message. Based on the conversation context, generate a brief, flirty, and engaging response. Keep it under 100 characters. Be playful but respectful.`,

    bio_suggestions: `You help users write compelling dating profile bios. Based on their interests and what they're looking for, suggest a bio. Keep it under 150 characters. Be authentic and engaging.`,
};

Deno.serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response(null, {headers: corsHeaders});
    }

    try {
        const body = await req.json();
        const {messages = [], mode = 'chat', context, stream: wantStream = false} = body;

        const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
        if (!OPENAI_API_KEY) {
            throw new Error("OPENAI_API_KEY is not configured");
        }

        const systemPrompt = (mode === 'chat' && context)
            ? context
            : (SYSTEM_PROMPTS[mode] || SYSTEM_PROMPTS.chat);

        console.log(`Find Your King AI Chat — mode: ${mode}, stream: ${wantStream}, messages: ${messages.length}`);

        const payload = {
            model: "gpt-4-turbo-preview",
            messages: [
                {role: "system", content: systemPrompt},
                ...messages,
            ],
            stream: wantStream,
            max_tokens: mode === 'quick_reply' ? 200 : 1024,
            temperature: mode === 'icebreaker' || mode === 'quick_reply' ? 0.9 : 0.7,
        };

        const upstream = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${OPENAI_API_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        });

        if (!upstream.ok) {
            const errorText = await upstream.text();
            console.error("OpenAI API error:", upstream.status, errorText);

            if (upstream.status === 429) {
                return new Response(
                    JSON.stringify({error: "Rate limit exceeded. Please try again later."}),
                    {status: 429, headers: {...corsHeaders, "Content-Type": "application/json"}}
                );
            }
            if (upstream.status === 402) {
                return new Response(
                    JSON.stringify({error: "AI credits exhausted. Please contact support."}),
                    {status: 402, headers: {...corsHeaders, "Content-Type": "application/json"}}
                );
            }
            throw new Error(`OpenAI API error: ${upstream.status}`);
        }

        // ── Streaming passthrough ────────────────────────────────
        if (wantStream) {
            return new Response(upstream.body, {
                status: 200,
                headers: {
                    ...corsHeaders,
                    "Content-Type": "text/event-stream",
                    "Cache-Control": "no-cache",
                    "X-Accel-Buffering": "no",
                },
            });
        }

        // ── Non-streaming ────────────────────────────────────────
        const data = await upstream.json();
        const content = data.choices?.[0]?.message?.content || "";

        // For quick_reply mode, parse the JSON array or fall back
        if (mode === 'quick_reply') {
            try {
                const suggestions = JSON.parse(content);
                return new Response(
                    JSON.stringify({suggestions, mode}),
                    {headers: {...corsHeaders, "Content-Type": "application/json"}}
                );
            } catch {
                // If not valid JSON, split by newline as fallback
                const lines = content.split('\n').filter((l: string) => l.trim()).slice(0, 3);
                return new Response(
                    JSON.stringify({suggestions: lines, mode}),
                    {headers: {...corsHeaders, "Content-Type": "application/json"}}
                );
            }
        }

        console.log("Find Your King AI response generated successfully");
        return new Response(
            JSON.stringify({content, mode}),
            {headers: {...corsHeaders, "Content-Type": "application/json"}}
        );

    } catch (error) {
        console.error("Find Your King AI chat error:", error);
        return new Response(
            JSON.stringify({error: error instanceof Error ? error.message : "Unknown error"}),
            {status: 500, headers: {...corsHeaders, "Content-Type": "application/json"}}
        );
    }
});
