import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import {corsHeaders, handleCORS} from '../_shared/cors.ts'
import {supabaseAdmin} from '../_shared/supabase.ts'

interface MatchingRequest {
    userId: string;
    limit?: number;
    preferences?: {
        age_range?: [number, number];
        max_distance?: number;
        interests?: string[];
    };
}

interface MatchScore {
    userId: string;
    score: number;
    reasons: string[];
    compatibility: {
        interests: number;
        location: number;
        age: number;
        overall: number;
    };
}

Deno.serve(async (req) => {
    const corsResponse = handleCORS(req)
    if (corsResponse) return corsResponse

    try {
        const { userId, limit = 10, preferences = {} }: MatchingRequest = await req.json();

        if (!userId) {
            return new Response(
                JSON.stringify({ error: 'Missing userId' }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        // Get user profile and preferences
        const { data: userProfile, error: userError } = await supabaseAdmin
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();

        if (userError || !userProfile) {
            return new Response(
                JSON.stringify({ error: 'User profile not found' }),
                { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        // Get potential matches (exclude self and already matched users)
        const { data: potentialMatches, error: matchesError } = await supabaseAdmin
            .from('profiles')
            .select('*')
            .neq('id', userId)
            .eq('looking_for', userProfile.gender || 'all')
            .limit(50);

        if (matchesError) {
            throw matchesError;
        }

        // Calculate match scores
        const scoredMatches: MatchScore[] = [];

        for (const match of potentialMatches || []) {
            const score = calculateMatchScore(userProfile, match, preferences);
            
            if (score.score > 0.3) { // Only include matches with minimum compatibility
                scoredMatches.push(score);
            }
        }

        // Sort by score and limit results
        scoredMatches.sort((a, b) => b.score - a.score);
        const topMatches = scoredMatches.slice(0, limit);

        // Store matching analytics
        await supabaseAdmin
            .from('matching_analytics')
            .insert({
                user_id: userId,
                matches_found: topMatches.length,
                avg_score: topMatches.reduce((sum, m) => sum + m.score, 0) / topMatches.length || 0,
                preferences_used: Object.keys(preferences).length,
                created_at: new Date().toISOString()
            });

        console.log(`AI matching completed for user ${userId}, found ${topMatches.length} matches`);

        return new Response(
            JSON.stringify({ 
                matches: topMatches,
                total_analyzed: potentialMatches?.length || 0,
                preferences_applied: preferences
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

    } catch (error) {
        console.error('AI matching error:', error);
        return new Response(
            JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
});

function calculateMatchScore(userProfile: any, matchProfile: any, preferences: any): MatchScore {
    let score = 0;
    const reasons: string[] = [];
    const compatibility = {
        interests: 0,
        location: 0,
        age: 0,
        overall: 0
    };

    // Age compatibility
    if (userProfile.age && matchProfile.age) {
        const ageDiff = Math.abs(userProfile.age - matchProfile.age);
        if (ageDiff <= 5) {
            compatibility.age = 1 - (ageDiff / 20);
            score += compatibility.age * 0.25;
            reasons.push('Similar age range');
        }
    }

    // Interest compatibility
    if (userProfile.interests && matchProfile.interests) {
        const userInterests = userProfile.interests.split(',').map((i: string) => i.trim().toLowerCase());
        const matchInterests = matchProfile.interests.split(',').map((i: string) => i.trim().toLowerCase());
        const commonInterests = userInterests.filter((i: string) => matchInterests.includes(i));
        
        if (commonInterests.length > 0) {
            compatibility.interests = commonInterests.length / Math.max(userInterests.length, matchInterests.length);
            score += compatibility.interests * 0.4;
            reasons.push(`${commonInterests.length} shared interests`);
        }
    }

    // Location compatibility (simplified - in real app, use geolocation)
    if (userProfile.location && matchProfile.location) {
        const sameLocation = userProfile.location.toLowerCase() === matchProfile.location.toLowerCase();
        compatibility.location = sameLocation ? 1 : 0.5;
        score += compatibility.location * 0.35;
        if (sameLocation) {
            reasons.push('Same location');
        }
    }

    compatibility.overall = score;

    return {
        userId: matchProfile.id,
        score,
        reasons,
        compatibility
    };
}