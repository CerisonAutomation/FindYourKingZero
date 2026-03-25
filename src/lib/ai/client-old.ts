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
export const aiTools = {
    // Profile analysis tool
    analyzeProfile: {
        description: 'Analyze a user profile for compatibility and authenticity',
        parameters: z.object({
            profileId: z.string().describe('The profile ID to analyze'),
            analysisType: z.enum(['compatibility', 'authenticity', 'completion']).describe('Type of analysis to perform'),
        }),
        execute: async ({ profileId, analysisType }: { profileId: string; analysisType: string }) => {
            const { data: profile } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', profileId)
                .single();

            if (!profile) {
                throw new Error('Profile not found');
            }

            switch (analysisType) {
                case 'compatibility':
                    return await analyzeProfileCompatibility(profile);
                case 'authenticity':
                    return await analyzeProfileAuthenticity(profile);
                case 'completion':
                    return await analyzeProfileCompletion(profile);
                default:
                    throw new Error('Invalid analysis type');
            }
        },
    },

    // Matching tool
    findMatches: {
        description: 'Find compatible matches for a user',
        parameters: z.object({
            userId: z.string().describe('The user ID to find matches for'),
            preferences: z.object({
                maxDistance: z.number().optional(),
                ageRange: z.tuple([z.number(), z.number()]).optional(),
                interests: z.array(z.string()).optional(),
            }).optional(),
        }),
        execute: async ({ userId, preferences }: { userId: string; preferences?: any }) => {
            return await findAIMatches(userId, preferences);
        },
    },

    // Message enhancement tool
    enhanceMessage: {
        description: 'Enhance or suggest improvements for a message',
        parameters: z.object({
            message: z.string().describe('The message to enhance'),
            context: z.string().optional().describe('Context of the conversation'),
            enhancementType: z.enum(['grammar', 'tone', 'engagement', 'icebreaker']).describe('Type of enhancement'),
        }),
        execute: async ({ message, context, enhancementType }: {
            message: string;
            context?: string;
            enhancementType: string;
        }) => {
            return await enhanceMessageContent(message, context, enhancementType);
        },
    },

    // Content moderation tool
    moderateContent: {
        description: 'Moderate content for safety and appropriateness',
        parameters: z.object({
            content: z.string().describe('The content to moderate'),
            contentType: z.enum(['message', 'profile', 'bio', 'image_description']).describe('Type of content'),
            userId: z.string().describe('The user ID who created the content'),
        }),
        execute: async ({ content, contentType, userId }: {
            content: string;
            contentType: string;
            userId: string;
        }) => {
            return await moderateContent(content, contentType, userId);
        },
    },
};

// Profile Analysis Functions
async function analyzeProfileCompatibility(profile: Profile): Promise<any> {
    const prompt = `
        Analyze this dating profile for compatibility factors:

        Name: ${profile.name}
        Age: ${profile.age}
        Bio: ${profile.bio || 'No bio provided'}
        Interests: ${profile.interests?.join(', ') || 'No interests listed'}
        Looking for: ${profile.lookingFor?.join(', ') || 'Not specified'}
        Relationship goals: ${profile.relationship_goals}

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

        // Store analysis in database
        await supabase.from('ai_profiles').upsert({
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
        throw error;
    }
}

async function analyzeProfileAuthenticity(profile: Profile): Promise<any> {
    const prompt = `
        Analyze this dating profile for authenticity and potential fake indicators:

        Profile Name: ${profile.name}
        Bio: ${profile.bio || 'No bio provided'}
        Photos count: ${profile.photos?.length || 0}
        Verification status: ${profile.isVerified}
        Profile completion: ${profile.profile_completion_score}%

        Check for:
        1. Generic or suspicious language
        2. Incomplete information
        3. Too-good-to-be-true claims
        4. Inconsistencies
        5. Scam indicators

        Provide an authenticity score (1-10) and detailed reasoning.
        Respond in JSON format.
    `;

    try {
        const result = await generateObject({
            model: aiConfig.model,
            prompt,
            schema: z.object({
                authenticityScore: z.number().min(1).max(10),
                riskLevel: z.enum(['low', 'medium', 'high']),
                indicators: z.array(z.string()),
                recommendations: z.array(z.string()),
                confidence: z.number().min(0).max(1),
                analysis: z.string(),
            }),
            temperature: 0.2,
        });

        return result.object;
    } catch (error) {
        console.error('Profile authenticity analysis failed:', error);
        throw error;
    }
}

async function analyzeProfileCompletion(profile: Profile): Promise<any> {
    const completionScore = profile.profile_completion_score || 0;
    const missingFields = [];

    if (!profile.bio) missingFields.push('bio');
    if (!profile.photos || profile.photos.length === 0) missingFields.push('photos');
    if (!profile.interests || profile.interests.length === 0) missingFields.push('interests');
    if (!profile.lookingFor || profile.lookingFor.length === 0) missingFields.push('lookingFor');
    if (!profile.age) missingFields.push('age');
    if (!profile.location) missingFields.push('location');

    const suggestions = [
        'Add a compelling bio that showcases your personality',
        'Upload high-quality photos that show your face clearly',
        'Be specific about your interests and hobbies',
        'Clearly state what you\'re looking for',
        'Fill in all basic profile information',
    ];

    return {
        completionScore,
        missingFields,
        suggestions: suggestions.slice(0, 5 - missingFields.length),
        isComplete: completionScore >= 80,
    };
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

        // Get user preferences
        const { data: userPreferences } = await supabase
            .from('match_preferences')
            .select('*')
            .eq('user_id', userId)
            .single();

        // Find candidates using database function
        const { data: candidates } = await supabase
            .rpc('find_similar_profiles', {
                target_embedding: userProfile.profile_embedding,
                max_results: 50,
                similarity_threshold: 0.7,
                filters: {
                    min_age: userPreferences?.min_age || preferences?.ageRange?.[0] || 18,
                    max_age: userPreferences?.max_age || preferences?.ageRange?.[1] || 99,
                    requires_verification: userPreferences?.requires_verification || false,
                    premium_only: userPreferences?.requires_premium || false,
                },
            });

        if (!candidates || candidates.length === 0) {
            return [];
        }

        // Calculate compatibility scores for each candidate
        const matchingCandidates: MatchingCandidate[] = [];

        for (const candidate of candidates) {
            const compatibility = await calculateCompatibility(userProfile, candidate.profile_data);

            matchingCandidates.push({
                id: crypto.randomUUID(),
                user_id: userId,
                candidate_id: candidate.user_id,
                similarity_score: candidate.similarity_score,
                compatibility_score: compatibility.score,
                match_probability: calculateMatchProbability(candidate.similarity_score, compatibility.score),
                algorithm_version: 'v1.0',
                factors: compatibility.factors,
                last_calculated_at: new Date().toISOString(),
                expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
                is_active: true,
                metadata: {
                    source: 'ai_matching',
                    model_version: 'gpt-4-turbo-preview',
                },
                created_at: new Date().toISOString(),
            });
        }

        // Store candidates in database
        if (matchingCandidates.length > 0) {
            // Note: This table needs to be created in the database schema
            // For now, we'll store in a temporary approach
            console.log('AI matching candidates generated:', matchingCandidates.length);
        }

        return matchingCandidates.sort((a, b) => b.match_probability - a.match_probability);
    } catch (error) {
        console.error('AI matching failed:', error);
        throw error;
    }
}

async function calculateCompatibility(profile1: any, profile2: any): Promise<any> {
    const prompt = `
        Calculate compatibility between two dating profiles:

        Profile 1:
        Name: ${profile1.name}
        Age: ${profile1.age}
        Bio: ${profile1.bio || 'No bio'}
        Interests: ${profile1.interests?.join(', ') || 'No interests'}
        Looking for: ${profile1.lookingFor?.join(', ') || 'Not specified'}

        Profile 2:
        Name: ${profile2.name}
        Age: ${profile2.age}
        Bio: ${profile2.bio || 'No bio'}
        Interests: ${profile2.interests?.join(', ') || 'No interests'}
        Looking for: ${profile2.lookingFor?.join(', ') || 'Not specified'}

        Analyze compatibility across these dimensions:
        1. Interest alignment
        2. Relationship goal compatibility
        3. Age appropriateness
        4. Communication style match
        5. Overall compatibility

        Provide a score (0-1) and detailed factors.
        Respond in JSON format.
    `;

    try {
        const result = await generateObject({
            model: aiConfig.model,
            prompt,
            schema: z.object({
                score: z.number().min(0).max(1),
                factors: z.object({
                    interestAlignment: z.number().min(0).max(1),
                    goalCompatibility: z.number().min(0).max(1),
                    ageCompatibility: z.number().min(0).max(1),
                    communicationStyle: z.number().min(0).max(1),
                }),
                analysis: z.string(),
                recommendations: z.array(z.string()),
            }),
            temperature: 0.3,
        });

        return result.object;
    } catch (error) {
        console.error('Compatibility calculation failed:', error);
        return {
            score: 0.5,
            factors: {
                interestAlignment: 0.5,
                goalCompatibility: 0.5,
                ageCompatibility: 0.5,
                communicationStyle: 0.5,
            },
            analysis: 'Compatibility analysis failed',
            recommendations: [],
        };
    }
}

function calculateMatchProbability(similarityScore: number, compatibilityScore: number): number {
    return (similarityScore * 0.4 + compatibilityScore * 0.6);
}

// Message Enhancement Functions
async function enhanceMessageContent(
    message: string,
    context?: string,
    enhancementType: string
): Promise<any> {
    const enhancementPrompts = {
        grammar: 'Fix grammar and spelling errors in this message:',
        tone: 'Improve the tone to be more engaging and friendly:',
        engagement: 'Make this message more engaging and likely to get a response:',
        icebreaker: 'Convert this into a better icebreaker message:',
    };

    const prompt = `
        ${enhancementPrompts[enhancementType as keyof typeof enhancementPrompts]}

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
                    effectiveness: z.number().min(1).max(10),
                })),
                bestVersion: z.string(),
                analysis: z.string(),
            }),
            temperature: 0.7,
        });

        return result.object;
    } catch (error) {
        console.error('Message enhancement failed:', error);
        throw error;
    }
}

// Content Moderation Functions
async function moderateContent(
    content: string,
    contentType: string,
    userId: string
): Promise<any> {
    const prompt = `
        Moderate this ${contentType} for a dating platform:

        Content: "${content}"

        Check for:
        1. Inappropriate language
        2. Harassment or hate speech
        3. Scam or spam content
        4. Sexual content that violates guidelines
        5. Personal information sharing
        6. Violent or harmful content

        Provide a risk assessment and recommendation.
        Respond in JSON format.
    `;

    try {
        const result = await generateObject({
            model: aiConfig.model,
            prompt,
            schema: z.object({
                riskScore: z.number().min(0).max(1),
                riskLevel: z.enum(['low', 'medium', 'high', 'critical']),
                categories: z.array(z.string()),
                action: z.enum(['none', 'flag', 'hide', 'remove']),
                confidence: z.number().min(0).max(1),
                explanation: z.string(),
            }),
            temperature: 0.1,
        });

        // Store moderation result
        await supabase.from('ai_content_moderation').insert({
            content_type: contentType,
            content_id: crypto.randomUUID(),
            user_id: userId,
            risk_score: result.object.riskScore,
            risk_level: result.object.riskLevel,
            categories: result.object.categories,
            auto_action_taken: result.object.action,
            human_review_required: result.object.riskLevel === 'high' || result.object.riskLevel === 'critical',
            confidence: result.object.confidence,
            model_version: 'gpt-4-turbo-preview',
            metadata: {
                content_length: content.length,
                moderation_timestamp: new Date().toISOString(),
            },
        });

        return result.object;
    } catch (error) {
        console.error('Content moderation failed:', error);
        throw error;
    }
}

// Streaming Chat Functions
export function createStreamingChat(
    messages: Array<{ role: 'user' | 'assistant'; content: string }>,
    tools?: any[]
) {
    return streamText({
        model: aiConfig.model,
        messages,
        tools,
        temperature: aiConfig.defaultTemperature,
        maxTokens: aiConfig.defaultMaxTokens,
    });
}

// Embedding Functions
export async function generateEmbedding(text: string): Promise<number[]> {
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

export async function generateProfileEmbeddings(profile: Profile): Promise<{
    profile_embedding: number[];
    bio_embedding: number[];
    interests_embedding: number[];
}> {
    const profileText = `${profile.name} ${profile.age} ${profile.bio || ''} ${profile.interests?.join(' ') || ''}`;
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
export async function checkContentSafety(content: string): Promise<{
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
