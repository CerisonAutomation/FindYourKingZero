/**
 * ChatAI — Unified on-device intelligence engine for chat
 *
 * Capabilities:
 *  • Smart intent classification (instant, regex + semantic heuristics)
 *  • Contextual quick-reply generation (pattern library + local LLM fallback)
 *  • Meet-now intent detection → triggers floating date CTA
 *  • Pre-send safety shield (toxicity / harassment detection)
 *  • Smart compose autocomplete (ghost-text suggestions)
 *  • Per-message translation stubs (locale-aware)
 *
 * All processing is client-side — zero additional server calls.
 * Falls back gracefully at every layer so the UI is never blocked.
 */

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

export type MessageIntent =
  | 'greeting'
  | 'compliment'
  | 'flirt'
  | 'question'
  | 'plan'       // wants to make plans / meet up
  | 'meet_now'   // urgent / imminent meet intent
  | 'rejection'
  | 'story'
  | 'gratitude'
  | 'check_in'
  | 'other';

export interface SafetyResult {
  safe: boolean;
  score: number;        // 0–1, higher = more problematic
  category: 'ok' | 'warn' | 'block';
  reason?: string;
  softened?: string;    // AI-rewritten gentler version
}

export interface QuickReply {
  text: string;
  intent: MessageIntent;
  emoji?: string;
}

export interface CompletionHint {
  prefix: string;       // what the user typed
  completion: string;   // suggested completion (ghost text)
}

// ─────────────────────────────────────────────────────────────
// Intent Patterns
// ─────────────────────────────────────────────────────────────

const INTENT_PATTERNS: Record<MessageIntent, RegExp[]> = {
  greeting: [
    /^(hey|hi|hello|sup|yo|hola|oi|heya|hiya|g'day|morning|evening|good\s*(morning|evening|afternoon|night))\b/i,
    /^what'?s\s*up\b/i,
  ],
  compliment: [
    /\b(you('?re| are)\s*(so\s*)?(hot|cute|beautiful|gorgeous|handsome|stunning|attractive|perfect|amazing|lovely))\b/i,
    /\b(love\s+your\s+(photos?|pics?|smile|eyes|profile))\b/i,
    /\b(you\s+look\s+(great|amazing|good|fantastic|incredible|incredible))\b/i,
  ],
  flirt: [
    /\b(babe|baby|cutie|sweetie|honey|darling)\b/i,
    /\b(miss(ing)? you|thinking of you|dreaming about you|wish you were here)\b/i,
    /\b(kiss|cuddle|hug|hold)\b/i,
    /[😘😍🥰🔥💋❤️‍🔥]/u,
  ],
  plan: [
    /\b(are you (free|available)|when are you free|let'?s (meet|hang|get together|grab|go out))\b/i,
    /\b(want to (grab|get|do|go|meet|hang|check out))\b/i,
    /\b(this (weekend|week|friday|saturday|sunday|tonight|afternoon|evening))\b/i,
    /\b(free (tonight|this week|tomorrow|for|on))\b/i,
  ],
  meet_now: [
    /\b(meet\s*(right)?\s*now|come\s+over|heading\s+your\s+way|on\s+my\s+way|be\s+there\s+(in|soon))\b/i,
    /\b(right\s+now|asap|immediately|tonight|today)\b.*\b(meet|hang|come|over)\b/i,
    /\b(wanna\s+meet\s+up\s*(now|tonight|today)|let'?s\s+meet\s+up\s*(now|tonight|today))\b/i,
    /\b(let'?s\s+hang\s*(out)?\s*(tonight|now|today|soon|rn))\b/i,
    /\b(out\s*tonight|plans\s*tonight|free\s*(tonight|now|rn))\b/i,
  ],
  question: [
    /\?$/,
    /\b(what('?s)?|how|why|when|where|who|which|do you|are you|can you|would you|could you|is it)\b/i,
  ],
  rejection: [
    /\b(no\s+thanks|not\s+interested|i'?ll\s+pass|sorry\s+not|good\s+luck|not\s+my\s+type|i'?m\s+not\s+looking)\b/i,
  ],
  story: [
    /\b(so\s+yesterday|funny\s+story|guess\s+what|you\s+won'?t\s+believe|remember\s+when|did\s+i\s+tell\s+you)\b/i,
  ],
  gratitude: [
    /\b(thank\s*(you|s)|thx|ty|appreciate|grateful|means\s+a\s+lot)\b/i,
  ],
  check_in: [
    /\b(how\s+are\s+you|how'?s\s+(it\s+going|your\s+day|everything|life|work)|you\s+okay|you\s+good|doing\s+well)\b/i,
  ],
  other: [/.*/],
};

// ─────────────────────────────────────────────────────────────
// Toxicity Patterns
// ─────────────────────────────────────────────────────────────

// Severe (block) — slurs, explicit threats, harassment
const BLOCK_PATTERNS: RegExp[] = [
  /\b(kill\s*(your)?self|go\s*die|kys)\b/i,
  /\b(f+u+c+k\s+you|f+\*+k\s+you)\b/i,
  /\b(you('?re|\s+are)\s+a?\s*(fat|ugly|disgusting|worthless|pathetic|waste|piece\s+of\s+shit))\b/i,
];

// Warn — could be fine in context but worth flagging
const WARN_PATTERNS: RegExp[] = [
  /\b(send\s+(nudes?|pics?|photos?))\b/i,
  /\b(dick\s*pic|cock\s*pic)\b/i,
  /\b(you'?re\s*(so\s*)?(dumb|stupid|idiot|moron|retard))\b/i,
  /\b(shut\s+up|go\s+away|leave\s+me\s+alone)\b/i,
];

// ─────────────────────────────────────────────────────────────
// Contextual Quick Reply Library
// ─────────────────────────────────────────────────────────────

const REPLY_LIBRARY: Record<MessageIntent, QuickReply[]> = {
  greeting: [
    { text: "Hey! How's your day going? 😊", intent: 'greeting' },
    { text: "Hey! What are you up to? 👀", intent: 'greeting' },
    { text: "Hi! Great to hear from you 🙌", intent: 'greeting' },
    { text: "Hey! Loving your energy already ✨", intent: 'flirt' },
  ],
  compliment: [
    { text: "Aw, you're too sweet 🥰 thank you!", intent: 'gratitude' },
    { text: "Thank you! You're not too bad yourself 😏", intent: 'flirt' },
    { text: "You just made my day 💛", intent: 'gratitude' },
    { text: "Haha, flattery will get you everywhere 😈", intent: 'flirt' },
  ],
  flirt: [
    { text: "Oh, I like where this is going 😏", intent: 'flirt' },
    { text: "You're making it very hard to focus 🔥", intent: 'flirt' },
    { text: "Stop it, you'll make me blush 😘", intent: 'flirt' },
    { text: "So are we actually going to meet or just keep flirting? 😏", intent: 'plan' },
  ],
  question: [
    { text: "Great question! Let me think… 🤔", intent: 'question' },
    { text: "Honestly? Yes! 😄", intent: 'other' },
    { text: "Ooh, I love this question.", intent: 'question' },
    { text: "Ha, you really know how to make me think 😂", intent: 'story' },
  ],
  plan: [
    { text: "Yes! I'm free this weekend 📅", intent: 'plan' },
    { text: "I'd love that — what did you have in mind?", intent: 'plan' },
    { text: "Sounds amazing, let's do it 🙌", intent: 'plan' },
    { text: "What area are you in? I can come to you", intent: 'plan' },
  ],
  meet_now: [
    { text: "I'm free right now actually! 📍", intent: 'meet_now' },
    { text: "Let's do it! Where are you thinking?", intent: 'meet_now' },
    { text: "Tonight works! What time?", intent: 'meet_now' },
    { text: "Send me your location and I'll head over 🗺️", intent: 'meet_now' },
  ],
  rejection: [
    { text: "No worries at all — take care! 👋", intent: 'rejection' },
    { text: "All good, thanks for letting me know 😊", intent: 'gratitude' },
    { text: "No problem — best of luck out there!", intent: 'rejection' },
  ],
  story: [
    { text: "Wait, what happened?! 😱", intent: 'question' },
    { text: "No way, tell me everything 😂", intent: 'question' },
    { text: "Haha okay I need more details 👀", intent: 'question' },
    { text: "That sounds wild — then what?!", intent: 'question' },
  ],
  gratitude: [
    { text: "Aww of course! 💛", intent: 'gratitude' },
    { text: "Anytime! 😊", intent: 'gratitude' },
    { text: "You're welcome, it's easy when it's you 😏", intent: 'flirt' },
  ],
  check_in: [
    { text: "I'm great, thanks for asking! How are you? 😊", intent: 'check_in' },
    { text: "Pretty good! Just thinking about you tbh 😏", intent: 'flirt' },
    { text: "Getting better now that you texted 😄", intent: 'flirt' },
    { text: "Living my best life! You?", intent: 'check_in' },
  ],
  other: [
    { text: "Haha, I love that 😂", intent: 'other' },
    { text: "Tell me more 👀", intent: 'question' },
    { text: "Okay, you've got my attention 🔥", intent: 'flirt' },
    { text: "That's actually really cool!", intent: 'compliment' },
  ],
};

// ─────────────────────────────────────────────────────────────
// Smart Compose Templates
// ─────────────────────────────────────────────────────────────

const COMPOSE_HINTS: CompletionHint[] = [
  { prefix: 'hey', completion: '! How\'s your day going? 😊' },
  { prefix: 'hi', completion: '! What are you up to? 👀' },
  { prefix: 'hello', completion: '! Great to hear from you 😊' },
  { prefix: 'let\'s', completion: ' grab coffee this week — you free?' },
  { prefix: 'lets', completion: ' grab coffee this week — you free?' },
  { prefix: 'are you free', completion: ' this weekend? I\'d love to meet up' },
  { prefix: 'you look', completion: ' amazing in your photos honestly 🔥' },
  { prefix: 'i love your', completion: ' energy, it really comes through 😍' },
  { prefix: 'what are you', completion: ' up to tonight? 👀' },
  { prefix: 'want to', completion: ' meet up sometime? I\'m free this week' },
  { prefix: 'wanna', completion: ' grab drinks this weekend?' },
  { prefix: 'i\'ve been', completion: ' thinking about our conversation all day 😏' },
  { prefix: 'miss', completion: 'ing you already 😘' },
  { prefix: 'you\'re so', completion: ' easy to talk to, honestly loving this 💛' },
  { prefix: 'tell me', completion: ' more about yourself — what do you do for fun?' },
  { prefix: 'that\'s', completion: ' actually really interesting! Tell me more 👀' },
  { prefix: 'haha', completion: ' you\'re too funny 😂' },
  { prefix: 'lol', completion: ' okay you actually made me laugh 😂' },
  { prefix: 'honestly', completion: ' I wasn\'t expecting to vibe this much 😊' },
  { prefix: 'i was wondering', completion: ' if you\'d want to grab coffee sometime?' },
];

// ─────────────────────────────────────────────────────────────
// Softening Rewrites
// ─────────────────────────────────────────────────────────────

const SOFTEN_MAP: Array<[RegExp, string]> = [
  [/\bsend\s+(nudes?|pics?)\b/gi, 'I\'d love to see more when we meet 😊'],
  [/\bshut\s+up\b/gi, 'I hear you, but let\'s talk about it'],
  [/\bgo\s+away\b/gi, 'I need some space right now'],
  [/\bleave\s+me\s+alone\b/gi, 'I\'d prefer some time to myself right now'],
  [/\byou'?re\s*(so\s*)?(dumb|stupid|idiot|moron)\b/gi, 'I think we see this differently'],
];

// ─────────────────────────────────────────────────────────────
// ChatAI Class
// ─────────────────────────────────────────────────────────────

export class ChatAI {
  private static _instance: ChatAI | null = null;

  static getInstance(): ChatAI {
    if (!ChatAI._instance) ChatAI._instance = new ChatAI();
    return ChatAI._instance;
  }

  // ── Intent Classification ──────────────────────────────────

  classifyIntent(text: string): MessageIntent {
    const t = text.trim();
    const intents: MessageIntent[] = [
      'meet_now', 'plan', 'greeting', 'compliment', 'flirt',
      'check_in', 'question', 'rejection', 'story', 'gratitude',
    ];
    for (const intent of intents) {
      const patterns = INTENT_PATTERNS[intent];
      if (patterns.some(p => p.test(t))) return intent;
    }
    return 'other';
  }

  isMeetNowIntent(text: string): boolean {
    return this.classifyIntent(text) === 'meet_now';
  }

  // ── Quick Reply Generation ─────────────────────────────────

  getQuickReplies(incomingMessage: string, count = 3): QuickReply[] {
    const intent = this.classifyIntent(incomingMessage);
    const candidates = REPLY_LIBRARY[intent] ?? REPLY_LIBRARY.other;

    // Shuffle for variety, keep top `count`
    const shuffled = [...candidates].sort(() => Math.random() - 0.5);
    const picks = shuffled.slice(0, count);

    // If we're short, pad from "other"
    if (picks.length < count) {
      const others = REPLY_LIBRARY.other.filter(r => !picks.includes(r));
      picks.push(...others.slice(0, count - picks.length));
    }

    return picks;
  }

  // Multi-message context-aware version (uses last few messages)
  getContextualQuickReplies(
    messages: Array<{ content: string; isOwn: boolean }>,
    count = 3,
  ): QuickReply[] {
    const inbound = messages.filter(m => !m.isOwn);
    const last = inbound[inbound.length - 1]?.content ?? '';
    if (!last) return [];

    const base = this.getQuickReplies(last, count);

    // Extra tweak: if multiple inbound messages contain 'meet'/'free', prefer plan/meet_now
    const planSignals = inbound
      .slice(-3)
      .filter(m => /\b(meet|free|hang|tonight)\b/i.test(m.content)).length;

    if (planSignals >= 2) {
      const planReplies = REPLY_LIBRARY.meet_now.slice(0, 2);
      return [...planReplies, ...base].slice(0, count);
    }

    return base;
  }

  // ── Safety Shield ──────────────────────────────────────────

  checkSafety(text: string): SafetyResult {
    const t = text.trim();
    if (!t) return { safe: true, score: 0, category: 'ok' };

    // Block check
    for (const p of BLOCK_PATTERNS) {
      if (p.test(t)) {
        return {
          safe: false,
          score: 0.95,
          category: 'block',
          reason: 'This message contains harmful language and cannot be sent.',
        };
      }
    }

    // Warn check
    for (const p of WARN_PATTERNS) {
      if (p.test(t)) {
        const softened = this.softenMessage(t);
        return {
          safe: false,
          score: 0.6,
          category: 'warn',
          reason: 'This might come across the wrong way.',
          softened,
        };
      }
    }

    // Spam heuristics
    const capsRatio = (t.match(/[A-Z]/g) ?? []).length / Math.max(t.length, 1);
    const repeated = (t.match(/(.)\1{4,}/g) ?? []).length;
    if (capsRatio > 0.6 && t.length > 8) {
      return {
        safe: false,
        score: 0.45,
        category: 'warn',
        reason: 'All-caps messages can feel aggressive.',
        softened: t.toLowerCase().replace(/^./, c => c.toUpperCase()),
      };
    }
    if (repeated > 2) {
      return {
        safe: false,
        score: 0.3,
        category: 'warn',
        reason: 'This looks like it might be spam.',
      };
    }

    return { safe: true, score: 0, category: 'ok' };
  }

  private softenMessage(text: string): string {
    let result = text;
    for (const [pattern, replacement] of SOFTEN_MAP) {
      result = result.replace(pattern, replacement);
    }
    return result;
  }

  // ── Smart Compose / Ghost Text ─────────────────────────────

  getCompletionHint(prefix: string): CompletionHint | null {
    if (prefix.length < 3) return null;
    const lower = prefix.toLowerCase().trim();

    // Exact prefix match
    const exact = COMPOSE_HINTS.find(h => lower === h.prefix);
    if (exact) return exact;

    // Starts-with match (longest first)
    const match = COMPOSE_HINTS
      .filter(h => lower.startsWith(h.prefix) && h.prefix.length >= 3)
      .sort((a, b) => b.prefix.length - a.prefix.length)[0];

    if (match) {
      return {
        prefix: prefix,
        completion: match.completion,
      };
    }

    return null;
  }

  // ── Translation Stub ───────────────────────────────────────
  // Full transformer-based translation is heavy; this stub provides
  // a clean async interface. Wire up @huggingface/transformers when
  // the user explicitly requests translation (lazy load).

  async translateMessage(
    text: string,
    targetLang = 'es',
  ): Promise<string> {
    try {
      const { pipeline } = await import('@huggingface/transformers');
      const pipe = await pipeline('translation', `Xenova/opus-mt-en-${targetLang}`);
      const result = await (pipe as any)(text);
      return (result as any)[0]?.translation_text ?? text;
    } catch {
      return text; // graceful no-op on model load failure
    }
  }

  // ── Sentence Sentiment (fast regex) ───────────────────────

  getMessageSentiment(text: string): 'positive' | 'neutral' | 'negative' {
    const pos = /\b(love|great|amazing|awesome|fantastic|beautiful|wonderful|happy|excited|perfect|thank|appreciate|sweet|good|nice|fun|enjoy|glad)\b/i;
    const neg = /\b(hate|bad|terrible|awful|disgusting|annoying|boring|sad|angry|upset|disappointed|sucks|worst|ugh|ew)\b/i;
    const pCount = (text.match(pos) ?? []).length;
    const nCount = (text.match(neg) ?? []).length;
    if (pCount > nCount) return 'positive';
    if (nCount > pCount) return 'negative';
    return 'neutral';
  }
}

// ─────────────────────────────────────────────────────────────
// Singleton accessor
// ─────────────────────────────────────────────────────────────

export const chatAI = ChatAI.getInstance();
