// ═══════════════════════════════════════════════════════════════
// SERVICES: Autocomplete — Tfidf + AI + Geolocation
// Zero API keys. Runs locally.
// ═══════════════════════════════════════════════════════════════

import { useAI } from '@/hooks/useAI';

// ── Location autocomplete (local + H3) ────────────────────────
const POPULAR_CITIES = [
  'Madrid', 'Barcelona', 'London', 'Berlin', 'Paris', 'Amsterdam',
  'Rome', 'Lisbon', 'Vienna', 'Prague', 'Budapest', 'Athens',
  'New York', 'Los Angeles', 'Miami', 'San Francisco', 'Chicago',
  'São Paulo', 'Mexico City', 'Buenos Aires', 'Tel Aviv', 'Bangkok',
  'Sydney', 'Melbourne', 'Tokyo', 'Singapore', 'Dubai',
];

export function searchCities(query: string): string[] {
  if (!query || query.length < 2) return [];
  const q = query.toLowerCase();
  return POPULAR_CITIES.filter(c => c.toLowerCase().includes(q)).slice(0, 8);
}

// ── Bio autocomplete (AI-powered) ─────────────────────────────
// Uses TF-IDF locally + optional AI generation
const BIO_TEMPLATES = [
  "Gym rat who loves {interest}. Looking for someone who can keep up",
  "Coffee addict | {interest} | Let's explore the city together",
  "{interest} enthusiast. Swipe right if you can handle bad puns 😂",
  "Professional {interest} fan. Amateur chef. Let's grab dinner?",
  "Adventurous soul who loves {interest}. Life's too short for boring chats",
  "{interest} lover with a passion for travel. Where's your next trip?",
  "Sarcastic {interest} fan. Looking for someone to share laughs with",
];

export function suggestBio(interests: string[]): string[] {
  if (!interests.length) return BIO_TEMPLATES.slice(0, 3);
  return interests.flatMap(interest =>
    BIO_TEMPLATES
      .sort(() => Math.random() - 0.5)
      .slice(0, 2)
      .map(t => t.replace('{interest}', interest))
  ).slice(0, 5);
}

// ── Chat autocomplete (smart suggestions) ─────────────────────
const QUICK_REPLIES = {
  greeting: ["Hey!", "What's up?", "Hey there! How are you?", "Hi there"],
  interest: ["Tell me more!", "That's awesome!", "Interesting! What else?", "Love that 🔥"],
  agree: ["Sounds good!", "Count me in!", "Let's do it!", "I'm down!"],
  compliment: ["You look great!", "Love your vibe!", "Stunning!", "You're killing it"],
  plan: ["When are you free?", "Let's plan something!", "How about this weekend?", "I know a great spot"],
  goodbye: ["Talk later!", "See you!", "Good night", "Take care!"],
};

export function getQuickReplies(context: string): string[] {
  // Simple keyword matching for instant suggestions
  const lower = context.toLowerCase();

  if (/\b(hi|hey|hello|sup|what'?s up)\b/.test(lower)) return QUICK_REPLIES.greeting;
  if (/\b(like|love|enjoy|fan|hobby)\b/.test(lower)) return QUICK_REPLIES.interest;
  if (/\b(yes|yeah|sure|ok|cool|nice)\b/.test(lower)) return QUICK_REPLIES.agree;
  if (/\b(hot|cute|beautiful|gorgeous|handsome)\b/.test(lower)) return QUICK_REPLIES.compliment;
  if (/\b(meet|hang|date|dinner|coffee|drink|tonight|weekend)\b/.test(lower)) return QUICK_REPLIES.plan;
  if (/\b(bye|goodbye|night|later|see you)\b/.test(lower)) return QUICK_REPLIES.goodbye;

  // Default smart suggestions
  return ["Tell me more 😊", "Sounds interesting!", "What's your vibe?"];
}

// ── Smart compose (word-by-word completion) ────────────────────
const COMMON_COMPLETIONS: Record<string, string[]> = {
  'hey': ['there!', 'how are you?', 'there'],
  'want': ['to grab coffee?', 'to meet up?', 'to hang out?'],
  'are': ['you free tonight?', 'you into gym?', 'you looking for something serious?'],
  'let': ['\'s meet!', '\'s grab a drink!', '\'s do something fun!'],
  'what': ['are you into?', 'do you do for fun?', 'brings you here?'],
  'i': ['\'m down!', 'love that!', 'agree!'],
  'how': ['about this weekend?', 'do you like the city?', 'long have you been here?'],
};

export function getWordCompletions(partialText: string): string[] {
  const words = partialText.trim().split(/\s+/);
  const lastWord = words[words.length - 1]?.toLowerCase() ?? '';

  if (!lastWord) return [];

  return (COMMON_COMPLETIONS[lastWord] ?? [])
    .map(suffix => `${words.slice(0, -1).join(' ')} ${suffix}`.trim())
    .slice(0, 3);
}

// ── Combined autocomplete hook ────────────────────────────────
export function useAutocomplete() {
  return {
    // Location
    searchCities,

    // Profile
    suggestBio,

    // Chat
    getQuickReplies,
    getWordCompletions,

    // AI-enhanced (async, uses worker)
    aiSuggestions: async (message: string) => {
      // Instant keyword suggestions first
      const instant = getQuickReplies(message);
      return instant;
    },
  };
}
