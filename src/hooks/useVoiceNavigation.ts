// =====================================================
// Voice Navigation Hook — Commands + AI Auto-Reply
// =====================================================
import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface VoiceCommand {
  pattern: RegExp;
  action: (matches: RegExpMatchArray) => void | Promise<void>;
  description: string;
}

interface UseVoiceNavigationOptions {
  onQuickReply?: (text: string) => void;
  onSendQuickShare?: () => void;
  onOpenAlbum?: () => void;
}

export function useVoiceNavigation(options: UseVoiceNavigationOptions = {}) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef<any>(null);

  const commands: VoiceCommand[] = [
    {
      pattern: /^go to (.+)$/i,
      description: 'Navigate to a page',
      action: (m) => {
        const routes: Record<string, string> = {
          'home': '/', 'grid': '/app/grid', 'messages': '/app/messages',
          'events': '/app/events', 'profile': '/app/profile/me',
          'settings': '/app/settings', 'map': '/app/right-now/map',
          'feed': '/app/right-now', 'favorites': '/app/favorites',
          'albums': '/app/albums', 'ai': '/app/ai', 'voice': '/app/voice',
        };
        const target = m[1].toLowerCase().trim();
        const route = routes[target] || `/app/${target}`;
        navigate(route);
        toast({ title: `Navigating to ${target}` });
      },
    },
    {
      pattern: /^find (.+) nearby$/i,
      description: 'Search for people nearby',
      action: (m) => {
        navigate(`/app/grid?filter=${encodeURIComponent(m[1])}`);
        toast({ title: `Searching for ${m[1]} nearby` });
      },
    },
    {
      pattern: /^send (.+)$/i,
      description: 'Send a quick reply',
      action: async (m) => {
        const text = m[1];
        options.onQuickReply?.(text);
        toast({ title: 'Sending message...' });
      },
    },
    {
      pattern: /^quick share$/i,
      description: 'Open QuickShare',
      action: () => {
        options.onSendQuickShare?.();
        toast({ title: 'Opening QuickShare' });
      },
    },
    {
      pattern: /^open album$/i,
      description: 'Open albums',
      action: () => {
        options.onOpenAlbum?.();
        navigate('/app/albums');
      },
    },
    {
      pattern: /^show map$/i,
      description: 'Open the map view',
      action: () => {
        navigate('/app/right-now/map');
        toast({ title: 'Opening map' });
      },
    },
  ];

  const processCommand = useCallback(async (text: string) => {
    setTranscript(text);
    const userId = (await supabase.auth.getUser()).data.user?.id;

    for (const cmd of commands) {
      const match = text.match(cmd.pattern);
      if (match) {
        await cmd.action(match);
        // Log to voice_commands table
        if (userId) {
          await supabase.from('voice_commands').insert({
            user_id: userId,
            command_text: text,
            parsed_action: cmd.pattern.source,
            parameters: { matches: match.slice(1) },
            success: true,
          });
        }
        return true;
      }
    }

    // No command matched — try AI auto-reply
    if (userId) {
      await supabase.from('voice_commands').insert({
        user_id: userId,
        command_text: text,
        parsed_action: 'unknown',
        success: false,
      });
    }
    toast({ title: 'Command not recognized', description: 'Try "go to messages" or "find guys nearby"' });
    return false;
  }, [commands, toast]);

  const startListening = useCallback(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast({ title: 'Speech recognition not supported', variant: 'destructive' });
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onresult = (event: any) => {
      const text = event.results[0][0].transcript;
      processCommand(text);
    };

    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);

    recognition.start();
    recognitionRef.current = recognition;
    setIsListening(true);
  }, [processCommand]);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    setIsListening(false);
  }, []);

  useEffect(() => {
    return () => recognitionRef.current?.stop();
  }, []);

  return {
    isListening,
    transcript,
    startListening,
    stopListening,
    commands: commands.map(c => ({ pattern: c.pattern.source, description: c.description })),
  };
}
