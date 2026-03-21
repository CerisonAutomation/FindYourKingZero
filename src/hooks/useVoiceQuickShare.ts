// =====================================================
// Voice Quick Share Trigger
// Uses Web Speech API for wake-word detection
// =====================================================
import { useCallback, useRef, useState } from 'react';

export function useVoiceQuickShare(onTrigger: () => void) {
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  const startListening = useCallback(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) return;

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onresult = (event: any) => {
      const text = event.results[event.results.length - 1][0].transcript.toLowerCase().trim();
      if (text.includes('send quick share') || text.includes('quick share') || text.includes('share this')) {
        onTrigger();
      }
    };

    recognition.onend = () => {
      // Auto-restart if still listening
      if (isListening) recognition.start();
    };

    recognition.start();
    recognitionRef.current = recognition;
    setIsListening(true);
  }, [onTrigger, isListening]);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    setIsListening(false);
  }, []);

  return { isListening, startListening, stopListening };
}
