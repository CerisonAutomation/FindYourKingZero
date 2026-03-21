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
