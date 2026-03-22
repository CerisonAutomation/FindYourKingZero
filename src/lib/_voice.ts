import { log } from '@/lib/enterprise/Logger';

// Voice command event types
export type VoiceCommandEvent  = {
  type: 'command_executed' | 'command_failed' | 'speech_detected' | 'speech_ended' | 'error';
  data: any;
  timestamp: Date;
}

export type VoiceCommand  = {
  id: string;
  phrase: string;
  action: VoiceCommandAction;
  category: 'navigation' | 'chat' | 'profile' | 'events' | 'settings' | 'system';
  priority: number;
  enabled: boolean;
  aliases?: string[];
}

export type VoiceCommandAction = 
  | { type: 'navigate'; path: string }
  | { type: 'function'; fn: () => Promise<void> | void }
  | { type: 'api'; endpoint: string; method?: 'GET' | 'POST' | 'PUT' | 'DELETE'; data?: any }
  | { type: 'event'; eventName: string; payload?: any };

// Voice command processor with event system
class VoiceCommandProcessor {
  private commands: Map<string, VoiceCommand> = new Map();
  private listeners: Map<string, Array<(event: VoiceCommandEvent) => void>> = new Map();
  private isProcessing = false;
  private confidenceThreshold = 0.7;

  constructor() {
    this.initializeDefaultCommands();
  }

  // Initialize default voice commands
  private initializeDefaultCommands() {
    const defaultCommands: VoiceCommand[] = [
      // Navigation commands
      {
        id: 'nav_home',
        phrase: 'go home',
        action: { type: 'navigate', path: '/' },
        category: 'navigation',
        priority: 1,
        enabled: true,
        aliases: ['home', 'main', 'start page']
      },
      {
        id: 'nav_grid',
        phrase: 'go to grid',
        action: { type: 'navigate', path: '/app/grid' },
        category: 'navigation',
        priority: 1,
        enabled: true,
        aliases: ['grid', 'discover', 'browse profiles']
      },
      {
        id: 'nav_messages',
        phrase: 'go to messages',
        action: { type: 'navigate', path: '/app/messages' },
        category: 'navigation',
        priority: 1,
        enabled: true,
        aliases: ['messages', 'chat', 'conversations']
      },
      {
        id: 'nav_events',
        phrase: 'go to events',
        action: { type: 'navigate', path: '/app/events' },
        category: 'navigation',
        priority: 1,
        enabled: true,
        aliases: ['events', 'parties', 'meetups']
      },
      {
        id: 'nav_profile',
        phrase: 'go to profile',
        action: { type: 'navigate', path: '/app/profile/me' },
        category: 'navigation',
        priority: 1,
        enabled: true,
        aliases: ['profile', 'my profile', 'account']
      },
      {
        id: 'nav_settings',
        phrase: 'go to settings',
        action: { type: 'navigate', path: '/app/settings' },
        category: 'navigation',
        priority: 1,
        enabled: true,
        aliases: ['settings', 'preferences', 'options']
      },
      {
        id: 'nav_back',
        phrase: 'go back',
        action: { type: 'function', fn: () => window.history.back() },
        category: 'navigation',
        priority: 1,
        enabled: true,
        aliases: ['back', 'previous', 'return']
      },

      // Chat commands
      {
        id: 'chat_new',
        phrase: 'start new chat',
        action: { type: 'navigate', path: '/app/messages' },
        category: 'chat',
        priority: 2,
        enabled: true,
        aliases: ['new chat', 'new conversation', 'start chat']
      },
      {
        id: 'chat_reply',
        phrase: 'reply to message',
        action: { type: 'event', eventName: 'voice_reply_requested' },
        category: 'chat',
        priority: 2,
        enabled: true,
        aliases: ['reply', 'send reply', 'answer']
      },
      {
        id: 'chat_like',
        phrase: 'like this profile',
        action: { type: 'event', eventName: 'voice_like_requested' },
        category: 'chat',
        priority: 2,
        enabled: true,
        aliases: ['like', 'super like', 'interested']
      },

      // Profile commands
      {
        id: 'profile_edit',
        phrase: 'edit my profile',
        action: { type: 'navigate', path: '/app/profile/me/edit' },
        category: 'profile',
        priority: 2,
        enabled: true,
        aliases: ['edit profile', 'update profile', 'change profile']
      },
      {
        id: 'profile_photos',
        phrase: 'add photos',
        action: { type: 'navigate', path: '/app/profile/me/photos' },
        category: 'profile',
        priority: 2,
        enabled: true,
        aliases: ['photos', 'add pictures', 'upload photos']
      },

      // Event commands
      {
        id: 'event_create',
        phrase: 'create event',
        action: { type: 'navigate', path: '/app/events/create' },
        category: 'events',
        priority: 2,
        enabled: true,
        aliases: ['new event', 'create party', 'host event']
      },
      {
        id: 'event_join',
        phrase: 'join event',
        action: { type: 'event', eventName: 'voice_join_event' },
        category: 'events',
        priority: 2,
        enabled: true,
        aliases: ['join', 'attend', 'rsvp']
      },

      // System commands
      {
        id: 'system_help',
        phrase: 'help',
        action: { type: 'event', eventName: 'voice_help_requested' },
        category: 'system',
        priority: 3,
        enabled: true,
        aliases: ['help me', 'what can I say', 'commands']
      },
      {
        id: 'system_search',
        phrase: 'search',
        action: { type: 'event', eventName: 'voice_search_requested' },
        category: 'system',
        priority: 2,
        enabled: true,
        aliases: ['find', 'look for', 'search for']
      },
      {
        id: 'system_stop',
        phrase: 'stop listening',
        action: { type: 'event', eventName: 'voice_stop_requested' },
        category: 'system',
        priority: 3,
        enabled: true,
        aliases: ['stop', 'cancel', 'never mind']
      }
    ];

    defaultCommands.forEach(cmd => this.registerCommand(cmd));
  }

  // Register a new voice command
  registerCommand(command: VoiceCommand) {
    this.commands.set(command.id, command);
    log.info('VOICE_PROCESSOR', 'Command registered', { id: command.id, phrase: command.phrase });
  }

  // Unregister a voice command
  unregisterCommand(commandId: string) {
    const removed = this.commands.delete(commandId);
    if (removed) {
      log.info('VOICE_PROCESSOR', 'Command unregistered', { id: commandId });
    }
    return removed;
  }

  // Enable/disable a command
  setCommandEnabled(commandId: string, enabled: boolean) {
    const command = this.commands.get(commandId);
    if (command) {
      command.enabled = enabled;
      log.info('VOICE_PROCESSOR', 'Command state changed', { 
        id: commandId, 
        enabled 
      });
    }
  }

  // Process speech transcript and find matching commands
  async processSpeech(transcript: string, confidence: number): Promise<VoiceCommand | null> {
    if (this.isProcessing || confidence < this.confidenceThreshold) {
      return null;
    }

    this.isProcessing = true;
    const normalizedTranscript = transcript.toLowerCase().trim();

    try {
      // Emit speech detected event
      this.emitEvent('speech_detected', { transcript, confidence });

      // Find best matching command
      const matchedCommand = this.findBestMatch(normalizedTranscript);

      if (matchedCommand) {
        log.info('VOICE_PROCESSOR', 'Command matched', { 
          commandId: matchedCommand.id,
          phrase: matchedCommand.phrase,
          confidence
        });

        // Execute the command
        await this.executeCommand(matchedCommand);
        
        // Emit command executed event
        this.emitEvent('command_executed', { 
          command: matchedCommand,
          transcript,
          confidence
        });

        return matchedCommand;
      } else {
        log.info('VOICE_PROCESSOR', 'No command matched', { transcript });
        return null;
      }
    } catch (error) {
      log.error('VOICE_PROCESSOR', 'Error processing speech', { 
        transcript, 
        errorMessage: String(error) 
      });
      
      this.emitEvent('error', { transcript, error });
      return null;
    } finally {
      this.isProcessing = false;
      this.emitEvent('speech_ended', { transcript });
    }
  }

  // Find best matching command for transcript
  private findBestMatch(transcript: string): VoiceCommand | null {
    let bestMatch: VoiceCommand | null = null;
    let bestScore = 0;

    for (const command of this.commands.values()) {
      if (!command.enabled) continue;

      const score = this.calculateMatchScore(transcript, command);
      if (score > bestScore && score >= this.confidenceThreshold) {
        bestMatch = command;
        bestScore = score;
      }
    }

    return bestMatch;
  }

  // Calculate match score between transcript and command
  private calculateMatchScore(transcript: string, command: VoiceCommand): number {
    const commandPhrase = command.phrase.toLowerCase();
    
    // Exact match gets highest score
    if (transcript === commandPhrase) {
      return 1.0;
    }

    // Check if transcript contains command phrase
    if (transcript.includes(commandPhrase)) {
      return 0.9;
    }

    // Check aliases
    if (command.aliases) {
      for (const alias of command.aliases) {
        const aliasLower = alias.toLowerCase();
        if (transcript === aliasLower) {
          return 0.95;
        }
        if (transcript.includes(aliasLower)) {
          return 0.85;
        }
      }
    }

    // Fuzzy matching using word overlap
    const transcriptWords = transcript.split(' ');
    const commandWords = commandPhrase.split(' ');
    const overlap = transcriptWords.filter(word => 
      commandWords.some(cmdWord => 
        cmdWord.includes(word) || word.includes(cmdWord)
      )
    ).length;

    if (overlap > 0) {
      return overlap / Math.max(transcriptWords.length, commandWords.length) * 0.7;
    }

    return 0;
  }

  // Execute a voice command
  private async executeCommand(command: VoiceCommand): Promise<void> {
    try {
      switch (command.action.type) {
        case 'navigate':
          if (typeof window !== 'undefined' && window.location) {
            window.location.href = command.action.path;
          }
          break;

        case 'function':
          await command.action.fn();
          break;

        case 'api':
          // API calls would be handled by the app's API client
          log.info('VOICE_PROCESSOR', 'API command', { 
            endpoint: command.action.endpoint,
            method: command.action.method || 'GET'
          });
          break;

        case 'event':
          // Emit custom event for app to handle
          this.emitEvent(command.action.eventName, command.action.payload);
          break;
      }
    } catch (error) {
      log.error('VOICE_PROCESSOR', 'Command execution failed', { 
        commandId: command.id,
        errorMessage: String(error)
      });
      
      this.emitEvent('command_failed', { command, error });
      throw error;
    }
  }

  // Event system
  addEventListener(eventType: string, listener: (event: VoiceCommandEvent) => void) {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, []);
    }
    this.listeners.get(eventType)!.push(listener);
  }

  removeEventListener(eventType: string, listener: (event: VoiceCommandEvent) => void) {
    const listeners = this.listeners.get(eventType);
    if (listeners) {
      const index = listeners.indexOf(listener);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  private emitEvent(type: string, data: any) {
    const event: VoiceCommandEvent = {
      type: type as any,
      data,
      timestamp: new Date()
    };

    const listeners = this.listeners.get(type);
    if (listeners) {
      listeners.forEach(listener => {
        try {
          listener(event);
        } catch (error) {
          log.error('VOICE_PROCESSOR', 'Event listener error', { 
            eventType: type,
            errorMessage: String(error)
          });
        }
      });
    }
  }

  // Get all registered commands
  getCommands(): VoiceCommand[] {
    return Array.from(this.commands.values());
  }

  // Get commands by category
  getCommandsByCategory(category: VoiceCommand['category']): VoiceCommand[] {
    return Array.from(this.commands.values()).filter(cmd => cmd.category === category);
  }

  // Set confidence threshold
  setConfidenceThreshold(threshold: number) {
    this.confidenceThreshold = Math.max(0, Math.min(1, threshold));
    log.info('VOICE_PROCESSOR', 'Confidence threshold updated', { 
      threshold: this.confidenceThreshold 
    });
  }

  // Get current confidence threshold
  getConfidenceThreshold(): number {
    return this.confidenceThreshold;
  }
}

// Export singleton instance
export const voiceCommandProcessor = new VoiceCommandProcessor();

// Export convenience functions
export const registerVoiceCommand = (command: VoiceCommand) => {
  voiceCommandProcessor.registerCommand(command);
};

export const processVoiceCommand = (transcript: string, confidence: number) => {
  return voiceCommandProcessor.processSpeech(transcript, confidence);
};

export const addVoiceEventListener = (
  eventType: string, 
  listener: (event: VoiceCommandEvent) => void
) => {
  voiceCommandProcessor.addEventListener(eventType, listener);
};
import { log } from '@/lib/enterprise/Logger';

// Voice feedback types
export type VoiceFeedbackConfig  = {
  enabled: boolean;
  voice: string | null;
  rate: number;
  pitch: number;
  volume: number;
  language: string;
}

export type FeedbackMessage  = {
  id: string;
  text: string;
  priority: 'low' | 'medium' | 'high';
  category: 'navigation' | 'chat' | 'system' | 'error' | 'success';
  timestamp: Date;
}

// Voice feedback manager
class VoiceFeedbackManager {
  private config: VoiceFeedbackConfig = {
    enabled: true,
    voice: null,
    rate: 0.9,
    pitch: 1.0,
    volume: 0.8,
    language: 'en-US'
  };

  private queue: FeedbackMessage[] = [];
  private isSpeaking = false;
  private supportedVoices: SpeechSynthesisVoice[] = [];
  private defaultVoice: SpeechSynthesisVoice | null = null;

  constructor() {
    this.initializeVoices();
    this.setupEventListeners();
  }

  // Initialize available voices
  private initializeVoices() {
    if ('speechSynthesis' in window) {
      // Load voices
      this.loadVoices();
      
      // Listen for voice changes
      speechSynthesis.onvoiceschanged = () => {
        this.loadVoices();
      };
    }
  }

  private loadVoices() {
    this.supportedVoices = speechSynthesis.getVoices();
    
    // Find preferred voice (female English voice if available)
    this.defaultVoice = this.supportedVoices.find(voice => 
      voice.lang.includes('en') && 
      (voice.name.includes('Female') || voice.name.includes('Samantha') || voice.name.includes('Karen'))
    ) || this.supportedVoices.find(voice => 
      voice.lang.includes('en')
    ) || this.supportedVoices[0] || null;

    log.info('VOICE_FEEDBACK', 'Voices loaded', { 
      count: this.supportedVoices.length,
      defaultVoice: this.defaultVoice?.name
    });
  }

  // Setup event listeners
  private setupEventListeners() {
    if ('speechSynthesis' in window) {
      speechSynthesis.addEventListener('start', () => {
        this.isSpeaking = true;
      });

      speechSynthesis.addEventListener('end', () => {
        this.isSpeaking = false;
        this.processQueue();
      });

      speechSynthesis.addEventListener('error', (event) => {
        log.error('VOICE_FEEDBACK', 'Speech synthesis error', { event });
        this.isSpeaking = false;
        this.processQueue();
      });
    }
  }

  // Update configuration
  updateConfig(config: Partial<VoiceFeedbackConfig>) {
    this.config = { ...this.config, ...config };
    log.info('VOICE_FEEDBACK', 'Config updated', { config: this.config });
  }

  // Get current configuration
  getConfig(): VoiceFeedbackConfig {
    return { ...this.config };
  }

  // Get available voices
  getAvailableVoices(): SpeechSynthesisVoice[] {
    return [...this.supportedVoices];
  }

  // Speak text immediately
  speak(text: string, options?: Partial<VoiceFeedbackConfig>): Promise<void> {
    if (!this.config.enabled || !('speechSynthesis' in window)) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      try {
        // Cancel any ongoing speech
        speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        
        // Apply configuration
        const finalConfig = { ...this.config, ...options };
        utterance.rate = finalConfig.rate;
        utterance.pitch = finalConfig.pitch;
        utterance.volume = finalConfig.volume;
        utterance.lang = finalConfig.language;

        // Set voice
        const voice = finalConfig.voice 
          ? this.supportedVoices.find(v => v.name === finalConfig.voice)
          : this.defaultVoice;
        
        if (voice) {
          utterance.voice = voice;
        }

        // Handle completion
        utterance.onend = () => resolve();
        utterance.onerror = (event) => {
          log.error('VOICE_FEEDBACK', 'Utterance error', { event });
          reject(event);
        };

        // Speak
        speechSynthesis.speak(utterance);
        
        log.info('VOICE_FEEDBACK', 'Speaking', { 
          text: text.substring(0, 50),
          voice: utterance.voice?.name 
        });

      } catch (error) {
        log.error('VOICE_FEEDBACK', 'Failed to speak', { errorMessage: String(error) });
        reject(error);
      }
    });
  }

  // Queue feedback message
  queueFeedback(message: Omit<FeedbackMessage, 'id' | 'timestamp'>) {
    const feedbackMessage: FeedbackMessage = {
      ...message,
      id: `feedback-${Date.now()}-${Math.random()}`,
      timestamp: new Date()
    };

    this.queue.push(feedbackMessage);
    this.processQueue();

    log.info('VOICE_FEEDBACK', 'Feedback queued', { 
      id: feedbackMessage.id,
      category: feedbackMessage.category,
      priority: feedbackMessage.priority
    });
  }

  // Process feedback queue
  private processQueue() {
    if (this.isSpeaking || this.queue.length === 0 || !this.config.enabled) {
      return;
    }

    // Sort by priority
    this.queue.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });

    const message = this.queue.shift();
    if (message) {
      this.speakFeedbackMessage(message);
    }
  }

  // Speak feedback message
  private async speakFeedbackMessage(message: FeedbackMessage) {
    try {
      await this.speak(message.text);
      log.info('VOICE_FEEDBACK', 'Feedback spoken', { id: message.id });
    } catch (error) {
      log.error('VOICE_FEEDBACK', 'Failed to speak feedback', { 
        id: message.id,
        errorMessage: String(error)
      });
    }
  }

  // Stop speaking and clear queue
  stop() {
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
    }
    this.queue = [];
    this.isSpeaking = false;
    log.info('VOICE_FEEDBACK', 'Stopped and cleared queue');
  }

  // Check if currently speaking
  isCurrentlySpeaking(): boolean {
    return this.isSpeaking;
  }

  // Get queue status
  getQueueStatus(): { length: number; isSpeaking: boolean; nextMessage?: FeedbackMessage } {
    return {
      length: this.queue.length,
      isSpeaking: this.isSpeaking,
      nextMessage: this.queue.length > 0 ? this.queue[0] : undefined
    };
  }

  // Predefined feedback messages
  private static readonly FEEDBACK_MESSAGES = {
    // Navigation feedback
    navigation: {
      home: "Navigating to home page",
      messages: "Opening messages",
      events: "Going to events",
      profile: "Opening your profile",
      settings: "Opening settings",
      back: "Going back"
    },
    
    // System feedback
    system: {
      listening: "I'm listening",
      stopped: "Voice control stopped",
      error: "Sorry, I didn't catch that",
      no_support: "Voice control is not supported in this browser",
      permission_denied: "Microphone permission denied"
    },

    // Chat feedback
    chat: {
      message_sent: "Message sent",
      reply_generated: "Reply generated",
      typing: "They're typing",
      new_message: "New message received"
    },

    // Success feedback
    success: {
      command_executed: "Command completed",
      action_completed: "Action completed successfully",
      saved: "Saved successfully"
    }
  };

  // Speak predefined feedback
  speakFeedback(category: keyof typeof VoiceFeedbackManager.FEEDBACK_MESSAGES, key: string) {
    const categoryMessages = VoiceFeedbackManager.FEEDBACK_MESSAGES[category];
    if (categoryMessages && categoryMessages[key as keyof typeof categoryMessages]) {
      const message = categoryMessages[key as keyof typeof categoryMessages];
      this.queueFeedback({
        text: message,
        priority: 'medium',
        category: category as any
      });
    }
  }

  // Speak navigation feedback
  speakNavigationFeedback(destination: string) {
    const feedback = VoiceFeedbackManager.FEEDBACK_MESSAGES.navigation[destination as keyof typeof VoiceFeedbackManager.FEEDBACK_MESSAGES.navigation];
    if (feedback) {
      this.speakFeedback('navigation', destination);
    } else {
      this.queueFeedback({
        text: `Navigating to ${destination}`,
        priority: 'medium',
        category: 'navigation'
      });
    }
  }

  // Speak error feedback
  speakErrorFeedback(error: string) {
    this.queueFeedback({
      text: `Error: ${error}`,
      priority: 'high',
      category: 'error'
    });
  }

  // Speak success feedback
  speakSuccessFeedback(action: string) {
    this.queueFeedback({
      text: `${action} completed successfully`,
      priority: 'medium',
      category: 'success'
    });
  }

  // Test voice
  async testVoice(): Promise<boolean> {
    try {
      await this.speak("Voice test. This is a test of the voice feedback system.");
      return true;
    } catch (error) {
      log.error('VOICE_FEEDBACK', 'Voice test failed', { errorMessage: String(error) });
      return false;
    }
  }
}

// Export singleton instance
export const voiceFeedback = new VoiceFeedbackManager();

// Export convenience functions
export const speak = (text: string, options?: Partial<VoiceFeedbackConfig>) => {
  return voiceFeedback.speak(text, options);
};

export const queueFeedback = (message: Omit<FeedbackMessage, 'id' | 'timestamp'>) => {
  voiceFeedback.queueFeedback(message);
};

export const speakNavigationFeedback = (destination: string) => {
  voiceFeedback.speakNavigationFeedback(destination);
};

export const speakErrorFeedback = (error: string) => {
  voiceFeedback.speakErrorFeedback(error);
};

export const speakSuccessFeedback = (action: string) => {
  voiceFeedback.speakSuccessFeedback(action);
};

export const updateVoiceConfig = (config: Partial<VoiceFeedbackConfig>) => {
  voiceFeedback.updateConfig(config);
};

export const getVoiceConfig = () => voiceFeedback.getConfig();

export const getAvailableVoices = () => voiceFeedback.getAvailableVoices();

export const stopVoiceFeedback = () => voiceFeedback.stop();

export const isVoiceFeedbackSpeaking = () => voiceFeedback.isCurrentlySpeaking();
