import { log } from '@/lib/enterprise/Logger';

// Voice command event types
export interface VoiceCommandEvent {
  type: 'command_executed' | 'command_failed' | 'speech_detected' | 'speech_ended' | 'error';
  data: any;
  timestamp: Date;
}

export interface VoiceCommand {
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
