/**
 * Elite AI Voice & Personality System
 * Modern, natural dating assistant with authentic personality
 * Based on patterns from top AI companion repos (Ada, AI-Soulmate, lov.ai)
 */

import { useState, useCallback, useRef } from 'react';

// ═══════════════════════════════════════════════════════════════
// AI PERSONALITY CONFIGURATION
// ═══════════════════════════════════════════════════════════════

export interface AIPersonality {
  name: string;
  tone: 'witty' | 'warm' | 'playful' | 'direct';
  emojiStyle: 'minimal' | 'moderate' | 'expressive';
  responseStyle: 'concise' | 'detailed' | 'balanced';
  humorLevel: 'dry' | 'light' | 'cheeky';
}

export const PERSONALITIES: Record<string, AIPersonality> = {
  default: {
    name: 'Dating Coach',
    tone: 'warm',
    emojiStyle: 'moderate',
    responseStyle: 'balanced',
    humorLevel: 'light',
  },
  witty: {
    name: 'Wing Person',
    tone: 'witty',
    emojiStyle: 'minimal',
    responseStyle: 'concise',
    humorLevel: 'dry',
  },
  playful: {
    name: 'Match Maker',
    tone: 'playful',
    emojiStyle: 'expressive',
    responseStyle: 'balanced',
    humorLevel: 'cheeky',
  },
  direct: {
    name: 'Dating Advisor',
    tone: 'direct',
    emojiStyle: 'minimal',
    responseStyle: 'detailed',
    humorLevel: 'dry',
  },
};

// ═══════════════════════════════════════════════════════════════
// MODERN QUICK REPLIES - Natural Dating Conversations
// ═══════════════════════════════════════════════════════════════

export type MessageIntent = 
  | 'greeting'
  | 'compliment'
  | 'flirt'
  | 'question'
  | 'plan'
  | 'meet_now'
  | 'rejection'
  | 'story'
  | 'gratitude'
  | 'check_in'
  | 'other';

export interface QuickReply {
  text: string;
  intent: MessageIntent;
  personality: 'witty' | 'warm' | 'playful';
}

export const MODERN_REPLIES: Record<MessageIntent, QuickReply[]> = {
  greeting: [
    { text: "Hey, how's your week been?", intent: 'greeting', personality: 'warm' },
    { text: "Good to hear from you — what are you up to?", intent: 'greeting', personality: 'warm' },
    { text: "Bold opener. I respect it.", intent: 'flirt', personality: 'witty' },
    { text: "Haven't heard this one before. Go on…", intent: 'greeting', personality: 'witty' },
    { text: "Well hello there ✨", intent: 'greeting', personality: 'playful' },
  ],
  
  compliment: [
    { text: "Thanks — that's genuinely nice to hear", intent: 'gratitude', personality: 'warm' },
    { text: "Smooth. Almost too smooth.", intent: 'flirt', personality: 'witty' },
    { text: "Careful, I'll start blushing 😊", intent: 'flirt', personality: 'playful' },
    { text: "Appreciate that. You have good taste", intent: 'gratitude', personality: 'witty' },
  ],
  
  flirt: [
    { text: "You're going to make me work for this, aren't you?", intent: 'flirt', personality: 'witty' },
    { text: "Okay, you've got my attention", intent: 'flirt', personality: 'warm' },
    { text: "I like where this is going…", intent: 'flirt', personality: 'playful' },
    { text: "Is it hot in here or is that just you?", intent: 'flirt', personality: 'playful' },
    { text: "Confidence suits you", intent: 'flirt', personality: 'witty' },
  ],
  
  question: [
    { text: "Great question — let me think…", intent: 'question', personality: 'warm' },
    { text: "Honestly? Yes.", intent: 'other', personality: 'witty' },
    { text: "Ooh, I love this question", intent: 'question', personality: 'playful' },
    { text: "You really know how to make me think", intent: 'story', personality: 'witty' },
  ],
  
  plan: [
    { text: "I'd love that — what did you have in mind?", intent: 'plan', personality: 'warm' },
    { text: "Sounds good. When were you thinking?", intent: 'plan', personality: 'witty' },
    { text: "Let's do it 🙌", intent: 'plan', personality: 'playful' },
    { text: "What area are you in?", intent: 'plan', personality: 'warm' },
  ],
  
  meet_now: [
    { text: "I'm free right now actually", intent: 'meet_now', personality: 'warm' },
    { text: "Tonight works — what time?", intent: 'meet_now', personality: 'witty' },
    { text: "Spontaneous, I like it ⚡", intent: 'meet_now', personality: 'playful' },
    { text: "Where are you thinking?", intent: 'meet_now', personality: 'warm' },
  ],
  
  rejection: [
    { text: "No worries — take care!", intent: 'rejection', personality: 'warm' },
    { text: "All good, thanks for being upfront", intent: 'gratitude', personality: 'witty' },
    { text: "Good luck out there", intent: 'rejection', personality: 'warm' },
  ],
  
  story: [
    { text: "Wait, what happened?!", intent: 'question', personality: 'playful' },
    { text: "No way — tell me everything", intent: 'question', personality: 'warm' },
    { text: "Haha okay I need more details", intent: 'question', personality: 'witty' },
    { text: "That sounds wild — then what?", intent: 'question', personality: 'playful' },
  ],
  
  gratitude: [
    { text: "Aww of course 💛", intent: 'gratitude', personality: 'warm' },
    { text: "Anytime", intent: 'gratitude', personality: 'witty' },
    { text: "You're welcome — it's easy when it's you", intent: 'flirt', personality: 'playful' },
  ],
  
  check_in: [
    { text: "I'm great, thanks for asking — how are you?", intent: 'check_in', personality: 'warm' },
    { text: "Pretty good! Just thinking about you tbh", intent: 'flirt', personality: 'playful' },
    { text: "Getting better now that you texted", intent: 'flirt', personality: 'witty' },
    { text: "Living my best life — you?", intent: 'check_in', personality: 'witty' },
  ],
  
  other: [
    { text: "Haha, I love that", intent: 'other', personality: 'warm' },
    { text: "Tell me more", intent: 'question', personality: 'witty' },
    { text: "Okay, you've got my attention", intent: 'flirt', personality: 'playful' },
    { text: "That's actually really cool", intent: 'compliment', personality: 'warm' },
  ],
};

// ═══════════════════════════════════════════════════════════════
// SMART COMPOSE - Contextual Message Suggestions
// ═══════════════════════════════════════════════════════════════

export interface ComposeHint {
  prefix: string;
  completion: string;
}

export const SMART_COMPOSE_HINTS: ComposeHint[] = [
  { prefix: 'hey', completion: ', how\'s your day going?' },
  { prefix: 'hi', completion: '! What are you up to?' },
  { prefix: 'hello', completion: ' — good to hear from you' },
  { prefix: 'let\'s', completion: ' grab coffee this week — you free?' },
  { prefix: 'you look', completion: ' great in your photos' },
  { prefix: 'i love your', completion: ' vibe, really comes through' },
  { prefix: 'what are you', completion: ' up to this weekend?' },
  { prefix: 'want to', completion: ' meet up sometime?' },
  { prefix: 'tell me', completion: ' more about yourself' },
  { prefix: 'that\'s', completion: ' actually really interesting' },
  { prefix: 'honestly', completion: ', I wasn\'t expecting to vibe this much' },
  { prefix: 'i was wondering', completion: ' if you\'d want to grab coffee?' },
];

// ═══════════════════════════════════════════════════════════════
// AI COACHING MESSAGES - Profile & Dating Advice
// ═══════════════════════════════════════════════════════════════

export const COACHING_MESSAGES = {
  profileTips: [
    "Lead with a photo that shows your eyes — it's the #1 thing people notice first.",
    "Your bio should start with a hook, not your job title.",
    "Group photos are fine, but make sure your first photo is just you.",
    "Show, don't tell — 'love hiking' vs a photo at the summit.",
  ],
  
  icebreakers: [
    "Ask about something specific in their photos — shows you actually looked.",
    "Skip 'hey' — reference something from their bio instead.",
    "A little teasing goes a long way. 'Is that dog yours or are you just borrowing the cuteness?'",
    "Questions about food/drink are universally safe bets.",
  ],
  
  conversationTips: [
    "The best conversations flow back and forth — don't send novels.",
    "If they ask a question, answer it then ask one back.",
    "Voice notes can break up text fatigue and feel more personal.",
    "Know when to move to meeting — 3-5 good exchanges is usually the sweet spot.",
  ],
  
  redFlags: [
    "If they only talk about themselves — that's not confidence, it's ego.",
    "Love-bombing early on? Take it slow.",
    "Vague about what they do or where they live — proceed with caution.",
  ],
};

// ═══════════════════════════════════════════════════════════════
// SAFETY & MODERATION MESSAGES
// ═══════════════════════════════════════════════════════════════

export const SAFETY_MESSAGES = {
  block: [
    "This message can't be sent — let's keep things respectful.",
  ],
  
  warn: [
    "That might come across stronger than you intended — want to rephrase?",
    "Consider how this might land — dating is about connection first.",
    "Maybe save that for after you've met in person?",
  ],
  
  softenedAlternatives: {
    'send nudes': 'I\'d love to see more when we meet 😊',
    'send pics': 'Looking forward to seeing you in person',
    'dtf': 'What are you looking for on here?',
    'hook up': 'What kind of connection are you hoping to find?',
  },
};

// ═══════════════════════════════════════════════════════════════
// AI ENGINE - Main Hook for AI Features
// ═══════════════════════════════════════════════════════════════

export interface AIEngineState {
  personality: AIPersonality;
  quickReplies: QuickReply[];
  isGenerating: boolean;
  error: string | null;
}

export function useEliteAIEngine(selectedPersonality: keyof typeof PERSONALITIES = 'default') {
  const [state, setState] = useState<AIEngineState>({
    personality: PERSONALITIES[selectedPersonality],
    quickReplies: [],
    isGenerating: false,
    error: null,
  });

  const personalityRef = useRef(PERSONALITIES[selectedPersonality]);
  personalityRef.current = PERSONALITIES[selectedPersonality];

  // Classify message intent
  const classifyIntent = useCallback((text: string): MessageIntent => {
    const t = text.toLowerCase().trim();
    
    // Intent patterns
    const patterns: Record<MessageIntent, RegExp[]> = {
      greeting: [
        /^(hey|hi|hello|sup|yo|hola|heya|hiya|good\s*(morning|evening|afternoon))/i,
        /what'?s\s*up/i,
      ],
      compliment: [
        /\b(you('?re| are)\s*(so\s*)?(hot|cute|beautiful|handsome|attractive|amazing))/i,
        /\b(love\s+your\s+(photos?|smile|eyes|style))/i,
      ],
      flirt: [
        /\b(babe|baby|cutie|honey|darling)\b/i,
        /\b(miss(ing)?\s*you|thinking\s+of\s*you)\b/i,
        /[😘😍🥰🔥💋❤️]/u,
      ],
      plan: [
        /\b(are you (free|available)|when are you free|let'?s (meet|hang|grab|go out))/i,
        /\b(want to|wanna) (grab|get|meet|hang)/i,
        /\b(this (weekend|week|friday|saturday|tonight))/i,
      ],
      meet_now: [
        /\b(meet\s*(right)?\s*now|come\s+over|tonight|today)\b/i,
        /\b(right\s*now|asap|immediately)\b/,
      ],
      question: [\?$/i, /\b(what|how|why|when|where|are you|do you|can you)/i],
      rejection: [
        /\b(no\s+thanks|not\s+interested|i'?ll\s+pass|not\s+my\s+type)/i,
      ],
      story: [
        /\b(so\s+yesterday|funny\s+story|guess\s+what|you\s+won'?t\s+believe)/i,
      ],
      gratitude: [
        /\b(thank\s*(you|s)|thx|appreciate|grateful)/i,
      ],
      check_in: [
        /\b(how\s+are\s+you|how'?s\s+(it\s+going|your\s+day)|you\s+okay)/i,
      ],
      other: [/.*/],
    };

    for (const [intent, regexes] of Object.entries(patterns)) {
      if (regexes.some(r => r.test(t))) {
        return intent as MessageIntent;
      }
    }
    
    return 'other';
  }, []);

  // Get quick replies based on intent and personality
  const getQuickReplies = useCallback((incomingMessage: string, count = 3): QuickReply[] => {
    const intent = classifyIntent(incomingMessage);
    const personality = personalityRef.current.tone;
    
    // Get all replies for this intent
    const allReplies = MODERN_REPLIES[intent] || MODERN_REPLIES.other;
    
    // Filter by personality preference, or get all if not enough
    let matching = allReplies.filter(r => r.personality === personality);
    if (matching.length < count) {
      matching = [...matching, ...allReplies.filter(r => r.personality !== personality)];
    }
    
    // Shuffle and return top count
    return matching
      .sort(() => Math.random() - 0.5)
      .slice(0, count);
  }, [classifyIntent]);

  // Get smart compose hint
  const getComposeHint = useCallback((prefix: string): ComposeHint | null => {
    if (prefix.length < 3) return null;
    const lower = prefix.toLowerCase().trim();
    
    const match = SMART_COMPOSE_HINTS
      .filter(h => lower.startsWith(h.prefix) && h.prefix.length >= 3)
      .sort((a, b) => b.prefix.length - a.prefix.length)[0];
    
    if (match) {
      return {
        prefix: prefix,
        completion: match.completion,
      };
    }
    
    return null;
  }, []);

  // Check message safety
  const checkSafety = useCallback((text: string): { safe: boolean; warning?: string; softened?: string } => {
    const lower = text.toLowerCase();
    
    // Block patterns (severe)
    const blockPatterns = [
      /\b(kill\s*(your)?self|go\s*die|kys)\b/i,
      /\b(f+u+c+k\s+you)\b/i,
      /\b(you('?re|\s+are)\s*(fat|ugly|disgusting|worthless))\b/i,
    ];
    
    if (blockPatterns.some(p => p.test(lower))) {
      return { 
        safe: false, 
        warning: SAFETY_MESSAGES.block[0]
      };
    }
    
    // Warn patterns
    const warnPatterns: Array<[RegExp, string]> = [
      [/\b(send\s+(nudes?|pics?))\b/i, SAFETY_MESSAGES.softenedAlternatives['send nudes']],
      [/\b(dick\s*pic|cock\s*pic)\b/i, ''],
      [/\b(you'?re\s*(dumb|stupid))\b/i, ''],
    ];
    
    for (const [pattern, softened] of warnPatterns) {
      if (pattern.test(lower)) {
        return {
          safe: false,
          warning: SAFETY_MESSAGES.warn[Math.floor(Math.random() * SAFETY_MESSAGES.warn.length)],
          softened: softened || text,
        };
      }
    }
    
    return { safe: true };
  }, []);

  // Get random coaching tip
  const getCoachingTip = useCallback((category: keyof typeof COACHING_MESSAGES): string => {
    const tips = COACHING_MESSAGES[category];
    return tips[Math.floor(Math.random() * tips.length)];
  }, []);

  return {
    ...state,
    getQuickReplies,
    getComposeHint,
    checkSafety,
    getCoachingTip,
    classifyIntent,
  };
}

// ═══════════════════════════════════════════════════════════════
// SYSTEM PROMPTS FOR AI ASSISTANT
// ═══════════════════════════════════════════════════════════════

export const AI_SYSTEM_PROMPTS = {
  default: `You're a dating coach helping users improve their dating profile and conversations. 
Be encouraging but honest. Give specific, actionable advice. 
Keep responses concise (2-3 sentences max unless asked for detail).
Avoid generic platitudes like "just be yourself."`,

  witty: `You're a witty dating wing-person with dry humor. 
You give advice that's sharp, honest, and occasionally sarcastic but never mean.
Keep it brief — one-liners when possible. Make users laugh while helping them.`,

  warm: `You're a supportive dating coach who genuinely cares about users finding connection.
Be encouraging, empathetic, and practical. Use a conversational, friendly tone.
Validate feelings while giving constructive guidance.`,

  direct: `You're a no-nonsense dating advisor who cuts through fluff.
Give straightforward, actionable advice. Be honest about red flags.
Users come to you for truth, not comfort. Still be respectful though.`,
};

export default useEliteAIEngine;
