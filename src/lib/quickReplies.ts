export interface QuickReplyTemplate {
    id: string;
    category: 'icebreakers' | 'responses' | 'dating' | 'compliments';
    text: string;
    emoji: string;
}

export const QUICK_REPLY_CATEGORIES = [
    {id: 'icebreakers', label: 'Icebreakers', icon: '💬'},
    {id: 'responses', label: 'Responses', icon: '💭'},
    {id: 'dating', label: 'Dating', icon: '❤️'},
    {id: 'compliments', label: 'Compliments', icon: '✨'},
] as const;

export const QUICK_REPLIES: QuickReplyTemplate[] = [
    // Icebreakers
    {id: 'ice_1', category: 'icebreakers', text: "Hey! Your profile caught my eye 😊", emoji: '👋'},
    {id: 'ice_2', category: 'icebreakers', text: "What are you up to today?", emoji: '🌞'},
    {id: 'ice_3', category: 'icebreakers', text: "How's your day going?", emoji: '😄'},
    {id: 'ice_4', category: 'icebreakers', text: "Hey there! Love your vibe", emoji: '✌️'},

    // Responses
    {id: 'resp_1', category: 'responses', text: "Thanks for the message! 😊", emoji: '🙏'},
    {id: 'resp_2', category: 'responses', text: "That sounds great!", emoji: '🎉'},
    {id: 'resp_3', category: 'responses', text: "I'd love to know more about you", emoji: '💭'},
    {id: 'resp_4', category: 'responses', text: "Haha, you're funny 😂", emoji: '😂'},

    // Dating
    {id: 'date_1', category: 'dating', text: "Would you like to grab coffee sometime?", emoji: '☕'},
    {id: 'date_2', category: 'dating', text: "What's your idea of a perfect date?", emoji: '🌹'},
    {id: 'date_3', category: 'dating', text: "Are you free this weekend?", emoji: '📅'},
    {id: 'date_4', category: 'dating', text: "Let's meet up! I know a great place", emoji: '📍'},

    // Compliments
    {id: 'comp_1', category: 'compliments', text: "You have an amazing smile!", emoji: '😍'},
    {id: 'comp_2', category: 'compliments', text: "Love your style!", emoji: '🔥'},
    {id: 'comp_3', category: 'compliments', text: "You seem like a really cool person", emoji: '⭐'},
    {id: 'comp_4', category: 'compliments', text: "Your photos are stunning!", emoji: '📸'},
];

export function getQuickRepliesByCategory(category: string): QuickReplyTemplate[] {
    return QUICK_REPLIES.filter((r) => r.category === category);
}
