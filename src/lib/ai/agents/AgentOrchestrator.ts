/**
 * AgentOrchestrator — Stateful multi-agent AI system for FindYourKing
 *
 * Agents (inspired by LangGraph blueprint):
 *  • MatchMakerAgent   — semantic match scoring + AI explanations
 *  • ChatAssistAgent   — reply generation, icebreakers, tone coaching
 *  • SafeGuardianAgent — content moderation, harassment detection
 *  • ProfileOptimizerAgent — bio/photo suggestions, completeness scoring
 *
 * All inference runs on-device via ChatAI (Transformer.js / heuristics).
 * State persists in sessionStorage for durable execution across renders.
 */

import {chatAI, type SafetyResult} from '@/lib/ai/ChatAI';

// ── Types ──────────────────────────────────────────────────────────────────

export interface AgentMemory {
    lastIntent?: string;
    suggestedReplies?: string[];
    safetyFlags?: string[];
    matchScores?: Record<string, number>;
    profileSuggestions?: ProfileSuggestion[];
    conversationContext?: string;
    timestamp?: number;
}

export interface ProfileSuggestion {
    field: 'bio' | 'headline' | 'photos' | 'tribes' | 'looking_for' | 'interests';
    issue: string;
    suggestion: string;
    priority: 'high' | 'medium' | 'low';
    icon: string;
}

export interface MatchScore {
    userId: string;
    score: number;
    explanation: string;
    sharedInterests: string[];
    compatibilityFactors: string[];
}

export interface AgentResult<T = any> {
    success: boolean;
    data: T;
    agentName: string;
    processingMs: number;
    fromCache: boolean;
}

// ── Memory Store (session-persistent) ─────────────────────────────────────

const MEMORY_KEY = 'fyk_agent_memory';

function loadMemory(): AgentMemory {
    try {
        const raw = sessionStorage.getItem(MEMORY_KEY);
        if (raw) return JSON.parse(raw);
    } catch {}
    return {};
}

function saveMemory(mem: AgentMemory): void {
    try {
        sessionStorage.setItem(MEMORY_KEY, JSON.stringify({...mem, timestamp: Date.now()}));
    } catch {}
}

// ── MatchMakerAgent ────────────────────────────────────────────────────────

export const MatchMakerAgent = {
    name: 'MatchMakerAgent',

    /**
     * Score compatibility between current user and a profile.
     * Uses semantic heuristics + shared interest analysis.
     */
    async scoreCompatibility(
        userProfile: Record<string, any>,
        targetProfile: Record<string, any>
    ): Promise<AgentResult<MatchScore>> {
        const start = performance.now();

        const mem = loadMemory();
        const cacheKey = `${userProfile.user_id}_${targetProfile.user_id}`;

        if (mem.matchScores?.[cacheKey] !== undefined) {
            return {
                success: true,
                agentName: this.name,
                processingMs: 0,
                fromCache: true,
                data: {
                    userId: targetProfile.user_id,
                    score: mem.matchScores[cacheKey],
                    explanation: 'Cached match',
                    sharedInterests: [],
                    compatibilityFactors: [],
                },
            };
        }

        // ── Heuristic scoring ──────────────────────────────────────────
        let score = 50; // baseline
        const sharedInterests: string[] = [];
        const factors: string[] = [];

        // Tribe match
        const userTribes: string[] = userProfile.tribes || [];
        const targetTribes: string[] = targetProfile.tribes || [];
        const tribeOverlap = userTribes.filter(t => targetTribes.includes(t));
        if (tribeOverlap.length) {
            score += tribeOverlap.length * 8;
            sharedInterests.push(...tribeOverlap.slice(0, 2));
            factors.push(`${tribeOverlap.length} shared tribe${tribeOverlap.length > 1 ? 's' : ''}`);
        }

        // Looking-for match
        const userLF: string[] = userProfile.looking_for || [];
        const targetLF: string[] = targetProfile.looking_for || [];
        const lfOverlap = userLF.filter(l => targetLF.includes(l));
        if (lfOverlap.length) {
            score += 12;
            factors.push('compatible goals');
        }

        // Online bonus
        if (targetProfile.is_online) {
            score += 5;
            factors.push('online now');
        }

        // Verified bonus
        if (targetProfile.is_verified) {
            score += 5;
            factors.push('verified profile');
        }

        // Bio length / quality
        const bioLen = (targetProfile.bio || '').length;
        if (bioLen > 100) score += 6;
        else if (bioLen > 40) score += 3;

        // Photo bonus
        if (targetProfile.avatar_url) score += 4;

        // Distance penalty
        if (targetProfile.distance !== undefined) {
            if (targetProfile.distance < 2) score += 8;
            else if (targetProfile.distance < 5) score += 5;
            else if (targetProfile.distance < 20) score += 2;
            else if (targetProfile.distance > 50) score -= 5;
        }

        score = Math.max(10, Math.min(99, score));

        // Generate explanation
        let explanation = '';
        if (score >= 80) {
            explanation = factors.length ? `Highly compatible — ${factors.slice(0, 2).join(', ')}` : 'Great potential match';
        } else if (score >= 60) {
            explanation = factors.length ? `Good match — ${factors[0]}` : 'Potential connection';
        } else {
            explanation = 'Explore the possibility';
        }

        // Cache
        const updated = {...mem, matchScores: {...(mem.matchScores || {}), [cacheKey]: score}};
        saveMemory(updated);

        return {
            success: true,
            agentName: this.name,
            processingMs: Math.round(performance.now() - start),
            fromCache: false,
            data: {
                userId: targetProfile.user_id,
                score,
                explanation,
                sharedInterests,
                compatibilityFactors: factors,
            },
        };
    },
};

// ── ChatAssistAgent ────────────────────────────────────────────────────────

export const ChatAssistAgent = {
    name: 'ChatAssistAgent',

    /**
     * Generate contextual icebreaker openers for a profile.
     */
    async generateIcebreakers(targetProfile: Record<string, any>): Promise<AgentResult<string[]>> {
        const start = performance.now();

        const name = targetProfile.display_name || 'him';
        const tribes: string[] = targetProfile.tribes || [];
        const bio: string = targetProfile.bio || '';
        const lf: string[] = targetProfile.looking_for || [];

        const icebreakers: string[] = [];

        // Tribe-based openers
        if (tribes.includes('Bear') || tribes.includes('Cub')) {
            icebreakers.push(`Hey ${name} 🐻 I'm loving your vibe — are you into outdoor stuff?`);
        }
        if (tribes.includes('Jock') || tribes.includes('Athlete')) {
            icebreakers.push(`Hey! Fellow gym head here 💪 What's your current training split?`);
        }
        if (tribes.includes('Nerd') || tribes.includes('Geek')) {
            icebreakers.push(`Hey ${name} 👾 What have you been obsessing over lately?`);
        }

        // Looking-for based
        if (lf.includes('friends')) {
            icebreakers.push(`Hey! Your profile caught my eye — always looking for cool people to connect with 😊`);
        }
        if (lf.includes('relationship') || lf.includes('dating')) {
            icebreakers.push(`Hey ${name} — something about your profile made me stop scrolling 👀 Tell me something interesting about you?`);
        }

        // Bio-keyword openers
        const bioLower = bio.toLowerCase();
        if (bioLower.includes('travel') || bioLower.includes('adventure')) {
            icebreakers.push(`Your travel energy is ✨ — where was your last favourite trip?`);
        }
        if (bioLower.includes('music') || bioLower.includes('festival')) {
            icebreakers.push(`Fellow music lover here 🎵 What have you been listening to lately?`);
        }
        if (bioLower.includes('food') || bioLower.includes('cook') || bioLower.includes('chef')) {
            icebreakers.push(`I can see you're a foodie 🍽️ What's the best thing you've cooked recently?`);
        }

        // Generic fallbacks
        if (icebreakers.length < 2) {
            icebreakers.push(
                `Hey ${name}! Your profile stood out — what are you up to this weekend? 😊`,
                `Hi! I couldn't scroll past without saying hey — what's something you're really into right now?`,
                `Hey! ${name} — short and simple: you seem interesting 👀 What's your vibe?`
            );
        }

        return {
            success: true,
            agentName: this.name,
            processingMs: Math.round(performance.now() - start),
            fromCache: false,
            data: icebreakers.slice(0, 3),
        };
    },

    /**
     * Get smart reply suggestions for a conversation.
     */
    async getSmartReplies(messages: Array<{content: string; is_mine: boolean}>): Promise<AgentResult<string[]>> {
        const start = performance.now();
        const quickReplies = await chatAI.getContextualQuickReplies(
            messages.map(m => ({
                content: m.content,
                sender_id: m.is_mine ? 'me' : 'other',
            })),
            3
        );

        return {
            success: true,
            agentName: this.name,
            processingMs: Math.round(performance.now() - start),
            fromCache: false,
            data: quickReplies.map(r => r.text),
        };
    },
};

// ── SafeGuardianAgent ──────────────────────────────────────────────────────

export const SafeGuardianAgent = {
    name: 'SafeGuardianAgent',

    /**
     * Check message safety before sending.
     */
    async checkMessage(text: string): Promise<AgentResult<SafetyResult>> {
        const start = performance.now();
        const result = await chatAI.checkSafety(text);

        const mem = loadMemory();
        if (!result.safe) {
            const flags = [...(mem.safetyFlags || []), text.slice(0, 50)].slice(-10);
            saveMemory({...mem, safetyFlags: flags});
        }

        return {
            success: true,
            agentName: this.name,
            processingMs: Math.round(performance.now() - start),
            fromCache: false,
            data: result,
        };
    },
};

// ── ProfileOptimizerAgent ──────────────────────────────────────────────────

export const ProfileOptimizerAgent = {
    name: 'ProfileOptimizerAgent',

    /**
     * Analyze a profile and return actionable improvement suggestions.
     */
    async analyzeProfile(profile: Record<string, any>): Promise<AgentResult<{
        score: number;
        suggestions: ProfileSuggestion[];
        summary: string;
    }>> {
        const start = performance.now();
        const suggestions: ProfileSuggestion[] = [];
        let score = 100;

        // ── Photo check ──────────────────────────────────────────────
        if (!profile.avatar_url) {
            suggestions.push({
                field: 'photos',
                issue: 'No profile photo',
                suggestion: 'Add a clear face photo — profiles with photos get 11× more views',
                priority: 'high',
                icon: '📸',
            });
            score -= 30;
        }

        // ── Bio check ────────────────────────────────────────────────
        const bio = profile.bio || '';
        if (!bio) {
            suggestions.push({
                field: 'bio',
                issue: 'Empty bio',
                suggestion: 'Write 2–3 sentences about who you are and what you\'re into — authenticity wins',
                priority: 'high',
                icon: '✍️',
            });
            score -= 20;
        } else if (bio.length < 40) {
            suggestions.push({
                field: 'bio',
                issue: 'Bio is very short',
                suggestion: 'Expand your bio with a specific interest, funny fact, or what you\'re looking for',
                priority: 'medium',
                icon: '📝',
            });
            score -= 8;
        } else if (bio.length > 500) {
            suggestions.push({
                field: 'bio',
                issue: 'Bio might be too long',
                suggestion: 'Keep it punchy — 100–200 characters hooks people in. Save the detail for conversation',
                priority: 'low',
                icon: '✂️',
            });
            score -= 3;
        }

        // ── Tribes check ─────────────────────────────────────────────
        const tribes: string[] = profile.tribes || [];
        if (!tribes.length) {
            suggestions.push({
                field: 'tribes',
                issue: 'No tribes selected',
                suggestion: 'Pick 1–3 tribes that fit you — this helps you show up in filtered searches',
                priority: 'medium',
                icon: '🏷️',
            });
            score -= 10;
        }

        // ── Looking for check ─────────────────────────────────────────
        const lf: string[] = profile.looking_for || [];
        if (!lf.length) {
            suggestions.push({
                field: 'looking_for',
                issue: 'Intent not set',
                suggestion: 'Set what you\'re looking for — it helps matches understand your vibe upfront',
                priority: 'medium',
                icon: '🎯',
            });
            score -= 8;
        }

        // ── Age check ────────────────────────────────────────────────
        if (!profile.age) {
            suggestions.push({
                field: 'interests',
                issue: 'Age not set',
                suggestion: 'Adding your age builds trust and helps with age-filtered discovery',
                priority: 'low',
                icon: '🎂',
            });
            score -= 5;
        }

        score = Math.max(0, Math.min(100, score));

        // ── Summary ───────────────────────────────────────────────────
        let summary = '';
        if (score >= 85) summary = 'Your profile is strong. A few tweaks could push it to perfect.';
        else if (score >= 65) summary = 'Good foundation — complete these steps to unlock more visibility.';
        else if (score >= 40) summary = 'Your profile needs some work. Fill in the blanks to attract more connections.';
        else summary = 'Start with a photo and bio — they make the biggest difference.';

        // Cache
        const mem = loadMemory();
        saveMemory({...mem, profileSuggestions: suggestions});

        return {
            success: true,
            agentName: this.name,
            processingMs: Math.round(performance.now() - start),
            fromCache: false,
            data: {score, suggestions, summary},
        };
    },
};

// ── Orchestrator ───────────────────────────────────────────────────────────

export const AgentOrchestrator = {
    matchMaker: MatchMakerAgent,
    chatAssist: ChatAssistAgent,
    safeGuardian: SafeGuardianAgent,
    profileOptimizer: ProfileOptimizerAgent,

    clearMemory() {
        try { sessionStorage.removeItem(MEMORY_KEY); } catch {}
    },

    getMemory(): AgentMemory {
        return loadMemory();
    },
};

export default AgentOrchestrator;
