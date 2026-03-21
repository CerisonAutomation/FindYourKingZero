// =====================================================
// AI Quick Reply Hook — Suggested replies + typing indicator
// =====================================================
import { useCallback, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface QuickReply {
  text: string;
  category: 'greeting' | 'flirt' | 'question' | 'plan' | 'compliment';
}

const SUGGESTED_REPLIES: QuickReply[] = [
  { text: "Hey! How's your day going? 😊", category: 'greeting' },
  { text: "You look amazing in your photos!", category: 'compliment' },
  { text: "What are you up to this weekend?", category: 'plan' },
  { text: "Want to grab coffee sometime?", category: 'plan' },
  { text: "Tell me more about yourself", category: 'question' },
  { text: "I love your vibe ✨", category: 'flirt' },
  { text: "We should definitely meet up!", category: 'plan' },
  { text: "What's your favorite spot in the city?", category: 'question' },
];

export function useQuickReply(conversationId: string) {
  const { toast } = useToast();
  const [sending, setSending] = useState(false);
  const [suggestions, setSuggestions] = useState<QuickReply[]>(SUGGESTED_REPLIES.slice(0, 4));

  const generateSuggestions = useCallback(async (lastMessage: string) => {
    // Simple context-aware suggestions
    const lower = lastMessage.toLowerCase();
    let filtered: QuickReply[];

    if (lower.includes('hey') || lower.includes('hi')) {
      filtered = SUGGESTED_REPLIES.filter(r => r.category === 'greeting' || r.category === 'question');
    } else if (lower.includes('photo') || lower.includes('pic')) {
      filtered = SUGGESTED_REPLIES.filter(r => r.category === 'compliment' || r.category === 'flirt');
    } else if (lower.includes('meet') || lower.includes('hang') || lower.includes('free')) {
      filtered = SUGGESTED_REPLIES.filter(r => r.category === 'plan');
    } else {
      filtered = SUGGESTED_REPLIES;
    }

    setSuggestions(filtered.slice(0, 4));

    // Store AI suggestions in database
    const userId = (await supabase.auth.getUser()).data.user?.id;
    if (userId) {
      await supabase.from('ai_typing_responses').insert(
        filtered.slice(0, 4).map(s => ({
          user_id: userId,
          conversation_id: conversationId,
          suggested_reply: s.text,
          context: lastMessage,
        }))
      );
    }
  }, [conversationId]);

  const sendQuickReply = useCallback(async (text: string) => {
    setSending(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase.from('messages').insert({
        conversation_id: conversationId,
        sender_id: user.id,
        content: text,
        message_type: 'text',
      });

      if (error) throw error;

      // Update template usage
      await supabase.from('message_templates')
        .update({ usage_count: supabase.rpc('increment') as any })
        .eq('user_id', user.id)
        .eq('template_text', text);

      toast({ title: 'Sent!' });
    } catch (err: any) {
      toast({ title: 'Failed to send', description: err.message, variant: 'destructive' });
    } finally {
      setSending(false);
    }
  }, [conversationId, toast]);

  return {
    suggestions,
    sending,
    sendQuickReply,
    generateSuggestions,
  };
}

// =====================================================
// Read Receipts Hook
// =====================================================
export function useReadReceipts(conversationId: string) {
  const markAsRead = useCallback(async () => {
    await supabase.rpc('mark_messages_read', { p_conversation_id: conversationId });
  }, [conversationId]);

  return { markAsRead };
}
