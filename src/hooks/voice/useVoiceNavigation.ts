import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { log } from '@/lib/enterprise/Logger';

// Voice command types
export interface VoiceCommand {
  command: string;
  action: () => void | Promise<void>;
  description: string;
  keywords: string[];
}

export interface VoiceNavigationState {
  isListening: boolean;
  isSupported: boolean;
  transcript: string;
  confidence: number;
  error: string | null;
  lastCommand: string | null;
  feedback: string | null;
}

// Voice navigation hook
export const useVoiceNavigation = () => {
  const navigate = useNavigate();
  const recognitionRef = useRef<any>(null);
  const [state, setState] = useState<VoiceNavigationState>({
    isListening: false,
    isSupported: false,
    transcript: '',
    confidence: 0,
    error: null,
    lastCommand: null,
    feedback: null
  });

  // Voice commands registry
  const [commands] = useState<VoiceCommand[]>([
    // Navigation commands
    {
      command: 'go home',
      action: () => navigate('/'),
      description: 'Navigate to home page',
      keywords: ['home', 'main', 'start']
    },
    {
      command: 'go to grid',
      action: () => navigate('/app/grid'),
      description: 'Navigate to discovery grid',
      keywords: ['grid', 'discover', 'browse']
    },
    {
      command: 'go to messages',
      action: () => navigate('/app/messages'),
      description: 'Navigate to messages',
      keywords: ['messages', 'chat', 'conversations']
    },
    {
      command: 'go to events',
      action: () => navigate('/app/events'),
      description: 'Navigate to events',
      keywords: ['events', 'parties', 'chills', 'meetups']
    },
    {
      command: 'go to profile',
      action: () => navigate('/app/profile/me'),
      description: 'Navigate to my profile',
      keywords: ['profile', 'me', 'account']
    },
    {
      command: 'go to settings',
      action: () => navigate('/app/settings'),
      description: 'Navigate to settings',
      keywords: ['settings', 'preferences', 'options']
    },
    {
      command: 'go back',
      action: () => navigate(-1),
      description: 'Go back to previous page',
      keywords: ['back', 'previous', 'return']
    },

    // App actions
    {
      command: 'search profiles',
      action: () => navigate('/app/grid'),
      description: 'Search for profiles',
      keywords: ['search', 'find', 'look for', 'profiles', 'people']
    },
    {
      command: 'create event',
      action: () => navigate('/app/events/create'),
      description: 'Create a new event',
      keywords: ['create', 'new', 'event', 'party', 'meetup']
    },
    {
      command: 'check notifications',
      action: () => navigate('/app/notifications'),
      description: 'Check notifications',
      keywords: ['notifications', 'alerts', 'updates']
    },

    // Quick replies
    {
      command: 'say hello',
      action: async () => {
        setState(prev => ({ ...prev, feedback: 'Hello! How can I help you today?' }));
        await speak('Hello! How can I help you today?');
      },
      description: 'Greeting response',
      keywords: ['hello', 'hi', 'hey']
    },
    {
      command: 'say thanks',
      action: async () => {
        setState(prev => ({ ...prev, feedback: 'You\'re welcome!' }));
        await speak('You\'re welcome!');
      },
      description: 'Thank you response',
      keywords: ['thanks', 'thank you', 'appreciate']
    }
  ]);

  // Text-to-speech function
  const speak = useCallback(async (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1.0;
      utterance.volume = 0.8;

      // Get available voices and select a good one
      const voices = speechSynthesis.getVoices();
      const preferredVoice = voices.find(voice =>
        voice.lang.includes('en') && voice.name.includes('Female')
      ) || voices.find(voice => voice.lang.includes('en')) || voices[0];

      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }

      speechSynthesis.speak(utterance);
      log.info('VOICE', 'Speaking response', { text });
    }
  }, []);

  // Process voice command
  const processCommand = useCallback(async (transcript: string) => {
    const normalizedTranscript = transcript.toLowerCase().trim();
    log.info('VOICE', 'Processing command', { transcript: normalizedTranscript });

    // Find matching command
    let matchedCommand: VoiceCommand | null = null;
    let bestMatch = 0;

    for (const cmd of commands) {
      // Check exact command match
      if (normalizedTranscript === cmd.command.toLowerCase()) {
        matchedCommand = cmd;
        bestMatch = 100;
        break;
      }

      // Check keyword matches
      const keywordMatches = cmd.keywords.filter(keyword =>
        normalizedTranscript.includes(keyword)
      ).length;

      if (keywordMatches > 0 && keywordMatches > bestMatch) {
        matchedCommand = cmd;
        bestMatch = keywordMatches;
      }
    }

    if (matchedCommand && bestMatch >= 1) {
      setState(prev => ({
        ...prev,
        lastCommand: matchedCommand!.command,
        feedback: `Executing: ${matchedCommand!.description}`
      }));

      try {
        await matchedCommand.action();
        log.info('VOICE', 'Command executed successfully', {
          command: matchedCommand.command
        });
      } catch (error) {
        log.error('VOICE', 'Command execution failed', {
          command: matchedCommand.command,
          errorMessage: String(error)
        });
        setState(prev => ({
          ...prev,
          error: `Failed to execute: ${matchedCommand.command}`,
          feedback: 'Sorry, I couldn\'t execute that command.'
        }));
        await speak('Sorry, I couldn\'t execute that command.');
      }
    } else {
      // Try to handle as a natural language query
      await handleNaturalLanguageQuery(normalizedTranscript);
    }
  }, [commands, navigate, speak]);

  // Handle natural language queries with AI
  const handleNaturalLanguageQuery = useCallback(async (query: string) => {
    setState(prev => ({ ...prev, feedback: 'Processing your request...' }));

    try {
      // Simple pattern matching for common queries
      if (query.includes('help') || query.includes('what can you do')) {
        const helpText = 'You can say things like: "go home", "go to messages", "go to events", "search profiles", or "create event". Try saying "navigate to" followed by any page name.';
        setState(prev => ({ ...prev, feedback: helpText }));
        await speak(helpText);
      } else if (query.includes('where am i')) {
        const currentPath = window.location.pathname;
        setState(prev => ({
          ...prev,
          feedback: `You're currently on: ${currentPath}`
        }));
        await speak(`You're currently on: ${currentPath}`);
      } else {
        setState(prev => ({
          ...prev,
          feedback: 'I didn\'t understand that. Try saying "help" for available commands.'
        }));
        await speak('I didn\'t understand that. Try saying help for available commands.');
      }
    } catch (error) {
      log.error('VOICE', 'Natural language query failed', { query, errorMessage: String(error) });
      setState(prev => ({
        ...prev,
        error: 'Failed to process your request',
        feedback: 'Sorry, I had trouble understanding that.'
      }));
    }
  }, [speak]);

  // Initialize speech recognition
  useEffect(() => {
    const initializeSpeechRecognition = () => {
      if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        setState(prev => ({
          ...prev,
          isSupported: false,
          error: 'Speech recognition is not supported in this browser'
        }));
        return;
      }

      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();

      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setState(prev => ({ ...prev, isListening: true, error: null }));
        log.info('VOICE', 'Speech recognition started');
      };

      recognition.onresult = (event: any) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          if (result.isFinal) {
            finalTranscript += result[0].transcript;
          } else {
            interimTranscript += result[0].transcript;
          }
        }

        if (finalTranscript) {
          setState(prev => ({
            ...prev,
            transcript: finalTranscript,
            confidence: event.results[event.results.length - 1][0].confidence
          }));

          // Process the final command
          processCommand(finalTranscript);
        } else {
          setState(prev => ({
            ...prev,
            transcript: interimTranscript
          }));
        }
      };

      recognition.onerror = (event: any) => {
        let errorMessage = 'Speech recognition error';

        switch (event.error) {
          case 'no-speech':
            errorMessage = 'No speech detected';
            break;
          case 'audio-capture':
            errorMessage = 'Microphone not available';
            break;
          case 'not-allowed':
            errorMessage = 'Microphone permission denied';
            break;
          case 'network':
            errorMessage = 'Network error';
            break;
          case 'service-not-allowed':
            errorMessage = 'Service not allowed';
            break;
          default:
            errorMessage = `Recognition error: ${event.error}`;
        }

        log.error('VOICE', 'Speech recognition error', { errorMessage: event.error });
        setState(prev => ({
          ...prev,
          error: errorMessage,
          isListening: false
        }));
      };

      recognition.onend = () => {
        setState(prev => ({ ...prev, isListening: false }));
        log.info('VOICE', 'Speech recognition ended');
      };

      recognitionRef.current = recognition;
      setState(prev => ({ ...prev, isSupported: true }));
    };

    initializeSpeechRecognition();

    // Load voices for text-to-speech
    if ('speechSynthesis' in window) {
      speechSynthesis.getVoices();
      speechSynthesis.onvoiceschanged = () => {
        speechSynthesis.getVoices();
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [processCommand]);

  // Control functions
  const startListening = useCallback(() => {
    if (recognitionRef.current && !state.isListening) {
      recognitionRef.current.start();
      log.info('VOICE', 'Started listening');
    }
  }, [state.isListening]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && state.isListening) {
      recognitionRef.current.stop();
      log.info('VOICE', 'Stopped listening');
    }
  }, [state.isListening]);

  const toggleListening = useCallback(() => {
    if (state.isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [state.isListening, startListening, stopListening]);

  // Add custom command
  const addCommand = useCallback((command: VoiceCommand) => {
    commands.push(command);
    log.info('VOICE', 'Custom command added', { command: command.command });
  }, [commands]);

  return {
    ...state,
    startListening,
    stopListening,
    toggleListening,
    addCommand,
    commands,
    speak
  };
};

// Type declarations for Web Speech API
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}
