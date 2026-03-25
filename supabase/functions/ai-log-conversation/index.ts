import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import {corsHeaders, handleCORS} from '../_shared/cors.ts'
import {supabaseAdmin} from '../_shared/supabase.ts'

Deno.serve(async (req) => {
    const corsResponse = handleCORS(req)
    if (corsResponse) return corsResponse

    try {
        const { userId, messages, mode = 'chat' } = await req.json();

        if (!userId || !messages) {
            return new Response(
                JSON.stringify({ error: 'Missing userId or messages' }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        // Store conversation in database for context and analytics
        const { data: conversation, error: convError } = await supabaseAdmin
            .from('ai_conversations')
            .insert({
                user_id: userId,
                mode,
                messages_count: messages.length,
                created_at: new Date().toISOString()
            })
            .select()
            .single();

        if (convError) {
            console.error('Failed to store conversation:', convError);
        }

        console.log(`AI conversation stored for user ${userId}, mode: ${mode}`);

        return new Response(
            JSON.stringify({ 
                success: true, 
                conversation_id: conversation?.id,
                message: 'Conversation logged successfully' 
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

    } catch (error) {
        console.error('AI logging error:', error);
        return new Response(
            JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
});