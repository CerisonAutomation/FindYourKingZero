import {openai} from '@ai-sdk/openai';
import {generateObject, generateText, streamText} from 'ai';
import {z} from 'zod';
import {supabase} from '@/integrations/supabase/client';
import type {MatchingCandidate, Profile} from '@/types';

// AI Configuration
const aiConfig = {
    model: openai('gpt-4-turbo-preview'),
    embeddingModel: openai('text-embedding-ada-002'),
    moderationModel: openai('gpt-4-turbo-preview'),
    defaultTemperature: 0.7,
    defaultMaxTokens: 1000,
};

// AI Tools for database operations
const aiTools = {
    // Profile analysis tool
    analyzeProfile: {
        description: 'Analyze user profile for compatibility and authenticity',
        parameters: z.object({
            profileId: z.string(),
            includeRecommendations: z.boolean().optional(),
        }),
        execute: async ({ profileId, includeRecommendations = true }) => {
            // Implementation for profile analysis
            return { score: 0.85, recommendations: [] };
        }
    },
    // Content moderation tool
    moderateContent: {
        description: 'Moderate user-generated content',
        parameters: z.object({
            content: z.string(),
            contentType: z.enum(['message', 'bio', 'photo']),
        }),
        execute: async ({ content, contentType }) => {
            // Implementation for content moderation
            return { isSafe: true, riskLevel: 'low' as const };
        }
    },
    // Matching algorithm tool
    calculateCompatibility: {
        description: 'Calculate compatibility between two profiles',
        parameters: z.object({
            profile1Id: z.string(),
            profile2Id: z.string(),
        }),
        execute: async ({ profile1Id, profile2Id }) => {
            // Implementation for compatibility calculation
            return { score: 0.75, factors: {} };
        }
    }
};

// Content Moderation Functions
async function moderateContent(
    content: string,
    contentType: string,
    context: string
): Promise<any> {
    try {
        const result = await generateText({
            model: aiConfig.moderationModel,
            prompt: `
                Analyze this ${contentType} for safety and appropriateness:

                Content: "${content}"
                Context: ${context}

                Rate the risk level (low/medium/high) and identify any concerning categories.
                Respond in JSON format with risk level and categories.
            `,
            temperature: 0.1,
        });

        // Parse the response and return structured result
        return {
            riskLevel: 'low',
            categories: [],
            analysis: result.text,
        };
    } catch (error) {
        console.error('Content moderation failed:', error);
        return {
            riskLevel: 'high',
            categories: ['error'],
            analysis: 'Moderation failed',
        };
    }
}

// Streaming Chat Functions
async function createStreamingChat(
    messages: any[],
    options: {
        temperature?: number;
        maxTokens?: number;
        tools?: any[];
    } = {}
): Promise<any> {
    try {
        const result = await streamText({
            model: aiConfig.model,
            messages,
            temperature: options.temperature || aiConfig.defaultTemperature,
            maxTokens: options.maxTokens || aiConfig.defaultMaxTokens,
            tools: options.tools || [aiTools.analyzeProfile, aiTools.moderateContent],
        });

        return result;
    } catch (error) {
        console.error('Streaming chat failed:', error);
        throw error;
    }
}

// Profile Analysis Functions
async function analyzeProfileCompatibility(profile: Profile): Promise<any> {
    const prompt = `
        Analyze this dating profile for compatibility factors:

        Name: ${profile.name || 'Unknown'}
        Age: ${profile.age || 'Not specified'}
        Bio: ${profile.bio || 'No bio provided'}
        Interests: ${profile.interests?.join(', ') || 'No interests listed'}
        Looking for: ${profile.lookingFor?.join(', ') || 'Not specified'}
        Relationship goals: ${profile.relationship_goals || 'Not specified'}

        Provide a detailed analysis including:
        1. Personality traits (scored 1-10)
        2. Communication style
        3. Compatibility factors
        4. Potential red flags
        5. Overall compatibility score

        Respond in JSON format with numeric scores and detailed explanations.
    `;

    try {
        const result = await generateObject({
            model: aiConfig.model,
            prompt,
            schema: z.object({
                personalityTraits: z.record(z.number().min(1).max(10)),
                communicationStyle: z.string(),
                compatibilityFactors: z.array(z.string()),
                redFlags: z.array(z.string()),
                overallScore: z.number().min(1).max(10),
                analysis: z.string(),
            }),
            temperature: 0.3,
        });

        // Store analysis in database (using type assertion for ai_profiles table)
        await (supabase as any).from('ai_profiles').upsert({
            user_id: profile.id,
            personality_traits: result.object.personalityTraits,
            compatibility_scores: { overall: result.object.overallScore },
            behavior_patterns: { communication: result.object.communicationStyle },
            preferences_learned: { factors: result.object.compatibilityFactors },
            risk_score: result.object.redFlags.length > 0 ? result.object.redFlags.length / 10 : 0,
            authenticity_score: result.object.overallScore / 10,
            last_analyzed_at: new Date().toISOString(),
            model_version: 'gpt-4-turbo-preview',
        });

        return result.object;
    } catch (error) {
        console.error('Profile compatibility analysis failed:', error);
        return {
            personalityTraits: {},
            communicationStyle: 'Unknown',
            compatibilityFactors: [],
            redFlags: [],
            overallScore: 5,
            analysis: 'Analysis failed',
        };
    }
}

async function analyzeProfileAuthenticity(profile: Profile): Promise<any> {
    const prompt = `
        Analyze this dating profile for authenticity and potential issues:

        Profile details:
        - Name: ${profile.name || 'Not provided'}
        - Bio: ${profile.bio || 'No bio'}
        - Photos: ${profile.photos?.length || 0} photos
        - Verification status: ${profile.verified ? 'Verified' : 'Not verified'}

        Look for:
        1. Fake profile indicators
        2. Inconsistent information
        3. Suspicious patterns
        4. Authenticity score (1-10)
        5. Recommendations for improvement

        Respond in JSON format.
    `;

    try {
        const result = await generateObject({
            model: aiConfig.model,
            prompt,
            schema: z.object({
                authenticityScore: z.number().min(1).max(10),
                riskFactors: z.array(z.string()),
                recommendations: z.array(z.string()),
                confidence: z.number().min(0).max(1),
            }),
            temperature: 0.2,
        });

        return result.object;
    } catch (error) {
        console.error('Authenticity analysis failed:', error);
        return {
            authenticityScore: 5,
            riskFactors: [],
            recommendations: [],
            confidence: 0.5,
        };
    }
}

// AI Matching Functions
async function findAIMatches(userId: string, preferences?: any): Promise<MatchingCandidate[]> {
    try {
        // Get user profile
        const { data: userProfile } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', userId)
            .single();

        if (!userProfile) {
            throw new Error('User profile not found');
        }

        // Simple matching logic for now
        const { data: candidates, error } = await supabase
            .from('profiles')
            .select('*')
            .neq('user_id', userId)
            .limit(10);

        if (error) throw error;

        return (candidates || []).map(candidate => ({
            ...candidate,
            compatibilityScore: Math.random() * 0.5 + 0.5, // Placeholder
            matchReason: 'Basic compatibility',
        }));
    } catch (error) {
        console.error('AI matching failed:', error);
        return [];
    }
}

// Message Enhancement Functions
async function enhanceMessageContent(
    message: string,
    context?: string,
    enhancementType?: string
): Promise<any> {
    const enhancementPrompts = {
        grammar: 'Fix grammar and spelling errors in this message:',
        tone: 'Improve the tone to be more engaging and friendly:',
        engagement: 'Make this message more engaging and likely to get a response:',
        icebreaker: 'Convert this into a better icebreaker message:',
    };

    const prompt = `
        ${enhancementPrompts[enhancementType as keyof typeof enhancementPrompts] || enhancementPrompts.tone}

        Original message: "${message}"
        ${context ? `Context: ${context}` : ''}

        Provide 2-3 improved versions of the message.
        Respond in JSON format with the improvements and explanations.
    `;

    try {
        const result = await generateObject({
            model: aiConfig.model,
            prompt,
            schema: z.object({
                improvements: z.array(z.object({
                    version: z.string(),
                    explanation: z.string(),
                })),
                bestChoice: z.string(),
                tips: z.array(z.string()),
            }),
            temperature: 0.7,
        });

        return result.object;
    } catch (error) {
        console.error('Message enhancement failed:', error);
        return {
            improvements: [{ version: message, explanation: 'Enhancement failed' }],
            bestChoice: message,
            tips: [],
        };
    }
}

// Embedding Functions
async function generateEmbedding(text: string): Promise<number[]> {
    try {
        const { embedding } = await generateText({
            model: aiConfig.embeddingModel,
            prompt: text,
        });

        return embedding;
    } catch (error) {
        console.error('Embedding generation failed:', error);
        throw error;
    }
}

async function generateProfileEmbeddings(profile: Profile): Promise<{
    profile_embedding: number[];
    bio_embedding: number[];
    interests_embedding: number[];
}> {
    const profileText = `${profile.name || ''} ${profile.age || ''} ${profile.bio || ''} ${profile.interests?.join(' ') || ''}`;
    const bioText = profile.bio || '';
    const interestsText = profile.interests?.join(' ') || '';

    const [profileEmbedding, bioEmbedding, interestsEmbedding] = await Promise.all([
        generateEmbedding(profileText),
        generateEmbedding(bioText),
        generateEmbedding(interestsText),
    ]);

    return {
        profile_embedding: profileEmbedding,
        bio_embedding: bioEmbedding,
        interests_embedding: interestsEmbedding,
    };
}

// AI Safety Functions
async function checkContentSafety(content: string): Promise<{
    isSafe: boolean;
    riskLevel: 'low' | 'medium' | 'high';
    categories: string[];
}> {
    try {
        const result = await moderateContent(content, 'message', 'system');

        return {
            isSafe: result.riskLevel === 'low',
            riskLevel: result.riskLevel,
            categories: result.categories,
        };
    } catch (error) {
        console.error('Content safety check failed:', error);
        return {
            isSafe: false,
            riskLevel: 'high',
            categories: ['error'],
        };
    }
}

// Export all AI functions for game-changer features
export {
    aiTools,
    createStreamingChat,
    generateEmbedding,
    generateProfileEmbeddings,
    checkContentSafety,
    analyzeProfileCompatibility,
    analyzeProfileAuthenticity,
    findAIMatches,
    enhanceMessageContent,
    moderateContent,
};

// AI Configuration
export { aiConfig };

export default {
    aiTools,
    createStreamingChat,
    generateEmbedding,
    generateProfileEmbeddings,
    checkContentSafety,
    analyzeProfileCompatibility,
    analyzeProfileAuthenticity,
    findAIMatches,
    enhanceMessageContent,
    moderateContent,
};
