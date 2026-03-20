import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { corsHeaders, handleCORS } from '../_shared/cors.ts'
import { getSystemPrompt } from '../_shared/ai-types.ts'

Deno.serve(async (req) => {
    const corsResponse = handleCORS(req)
    if (corsResponse) return corsResponse

    try {
        const {messages, mode = 'chat'} = await req.json();
        const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");

        if (!OPENAI_API_KEY) {
            throw new Error("OPENAI_API_KEY is not configured");
        }

        console.log(`Find Your King AI Stream request - mode: ${mode}, messages: ${messages.length}`);

        const systemPrompt = getSystemPrompt(mode);

        const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${OPENAI_API_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: "gpt-4-turbo-preview",
                messages: [
                    {
                        role: "system",
                        content: systemPrompt
                    },
                    ...messages,
                ],
                stream: true,
                max_tokens: 1024,
                temperature: 0.7,
            }),
        });

        if (!response.ok) {
            if (response.status === 429) {
                return new Response(
                    JSON.stringify({error: "Rate limit exceeded."}),
                    {status: 429, headers: {...corsHeaders, "Content-Type": "application/json"}}
                );
            }
            if (response.status === 402) {
                return new Response(
                    JSON.stringify({error: "Credits exhausted."}),
                    {status: 402, headers: {...corsHeaders, "Content-Type": "application/json"}}
                );
            }
            const errorText = await response.text();
            console.error("OpenAI API error:", response.status, errorText);
            throw new Error("OpenAI API error");
        }

        return new Response(response.body, {
            headers: {
                ...corsHeaders,
                "Content-Type": "text/event-stream",
                "Cache-Control": "no-cache",
                "X-Accel-Buffering": "no",
            },
        });
    } catch (error) {
        console.error("Stream error:", error);
        return new Response(
            JSON.stringify({error: error instanceof Error ? error.message : "Unknown error"}),
            {status: 500, headers: {...corsHeaders, "Content-Type": "application/json"}}
        );
    }
});