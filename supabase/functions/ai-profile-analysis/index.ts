import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import {corsHeaders, handleCORS} from '../_shared/cors.ts'
import {supabaseAdmin} from '../_shared/supabase.ts'

interface ProfileAnalysis {
    profileStrength: number;
    completeness: number;
    suggestions: string[];
    missingFields: string[];
}

Deno.serve(async (req) => {
    const corsResponse = handleCORS(req)
    if (corsResponse) return corsResponse

    try {
        const { userId } = await req.json();

        if (!userId) {
            return new Response(
                JSON.stringify({ error: 'Missing userId' }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        // Get user profile data
        const { data: profile, error: profileError } = await supabaseAdmin
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();

        if (profileError || !profile) {
            return new Response(
                JSON.stringify({ error: 'Profile not found' }),
                { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        // Analyze profile completeness
        const analysis: ProfileAnalysis = {
            profileStrength: 0,
            completeness: 0,
            suggestions: [],
            missingFields: []
        };

        const requiredFields = ['bio', 'age', 'location', 'interests', 'looking_for'];
        const optionalFields = ['height', 'body_type', 'relationship_status', 'occupation'];

        // Check required fields
        let requiredComplete = 0;
        requiredFields.forEach(field => {
            if (profile[field] && profile[field].toString().trim()) {
                requiredComplete++;
            } else {
                analysis.missingFields.push(field);
            }
        });

        // Check optional fields
        let optionalComplete = 0;
        optionalFields.forEach(field => {
            if (profile[field] && profile[field].toString().trim()) {
                optionalComplete++;
            }
        });

        // Calculate scores
        analysis.completeness = (requiredComplete / requiredFields.length) * 100;
        analysis.profileStrength = analysis.completeness + (optionalComplete / optionalFields.length) * 20;

        // Generate suggestions based on missing fields
        if (analysis.missingFields.includes('bio')) {
            analysis.suggestions.push('Add a compelling bio to attract more matches');
        }
        if (analysis.missingFields.includes('interests')) {
            analysis.suggestions.push('Share your interests to find compatible partners');
        }
        if (analysis.missingFields.includes('looking_for')) {
            analysis.suggestions.push('Specify what you\'re looking for in a partner');
        }
        if (analysis.missingFields.includes('location')) {
            analysis.suggestions.push('Set your location to find nearby matches');
        }

        // Store analysis for analytics
        await supabaseAdmin
            .from('profile_analytics')
            .insert({
                user_id: userId,
                profile_strength: analysis.profileStrength,
                completeness: analysis.completeness,
                missing_fields_count: analysis.missingFields.length,
                created_at: new Date().toISOString()
            });

        console.log(`Profile analysis completed for user ${userId}`);

        return new Response(
            JSON.stringify(analysis),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

    } catch (error) {
        console.error('Profile analysis error:', error);
        return new Response(
            JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
});