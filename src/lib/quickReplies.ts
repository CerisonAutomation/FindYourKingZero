export type QuickReplyTemplate  = {
    id: string;
    category: 'icebreakers' | 'responses' | 'dating' | 'compliments';
    text: string;
    icon: string;
}

export const QUICK_REPLY_CATEGORIES = [
    {id: 'icebreakers', label: 'Icebreakers', icon: 'MessageCircle'},
    {id: 'responses', label: 'Responses', icon: 'MessageSquare'},
    {id: 'dating', label: 'Dating', icon: 'Heart'},
    {id: 'compliments', label: 'Compliments', icon: 'Sparkles'},
] as const;

export const QUICK_REPLIES: QuickReplyTemplate[] = [
    // Icebreakers
    {id: 'ice_1', category: 'icebreakers', text: "Hey! Your profile caught my eye 😊", icon: 'Hand'},
    {id: 'ice_2', category: 'icebreakers', text: "What are you up to today?", icon: 'Sun'},
    {id: 'ice_3', category: 'icebreakers', text: "How's your day going?", icon: 'SmilePlus'},
    {id: 'ice_4', category: 'icebreakers', text: "Hey there! Love your vibe", icon: 'Peace'},

    // Responses
    {id: 'resp_1', category: 'responses', text: "Thanks for the message! 😊", icon: 'Hands'},
    {id: 'resp_2', category: 'responses', text: "That sounds great!", icon: 'PartyPopper'},
    {id: 'resp_3', category: 'responses', text: "I'd love to know more about you", icon: 'MessageSquare'},
    {id: 'resp_4', category: 'responses', text: "Haha, you're funny 😂", icon: 'Laugh'},

    // Dating
    {id: 'date_1', category: 'dating', text: "Would you like to grab coffee sometime?", icon: 'Coffee'},
    {id: 'date_2', category: 'dating', text: "What's your idea of a perfect date?", icon: 'Flower2'},
    {id: 'date_3', category: 'dating', text: "Are you free this weekend?", icon: 'Calendar'},
    {id: 'date_4', category: 'dating', text: "Let's meet up! I know a great place", icon: 'MapPin'},

    // Compliments
    {id: 'comp_1', category: 'compliments', text: "You have an amazing smile!", icon: 'Heart'},
    {id: 'comp_2', category: 'compliments', text: "Love your style!", icon: 'Sparkles'},
    {id: 'comp_3', category: 'compliments', text: "You seem like a really cool person", icon: 'Star'},
    {id: 'comp_4', category: 'compliments', text: "Your photos are stunning!", icon: 'Camera'},
];

export function getQuickRepliesByCategory(category: string): QuickReplyTemplate[] {
    return QUICK_REPLIES.filter((r) => r.category === category);
}
