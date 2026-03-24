// ═══════════════════════════════════════════════════════════════
// VOICE COMMANDS — Full voice control system for FindYourKing
// Adapted from old codebase VoiceCommandProcessor + VoiceFeedback
// Uses Web Speech API (no external deps)
// ═══════════════════════════════════════════════════════════════

import { type Screen } from '@/types';

// ── Types ────────────────────────────────────────────────────
export interface VoiceCommand {
  id: string;
  phrase: string;
  aliases: string[];
  category: 'navigation' | 'chat' | 'profile' | 'events' | 'settings' | 'system';
  action: VoiceCommandAction;
  enabled: boolean;
}

export type VoiceCommandAction =
  | { type: 'navigate'; screen: Screen }
  | { type: 'function'; fn: () => void }
  | { type: 'speech'; text: string };

export interface VoiceCommandResult {
  command: VoiceCommand | null;
  transcript: string;
  confidence: number;
  matched: boolean;
}

export interface VoiceStatus {
  listening: boolean;
  processing: boolean;
  supported: boolean;
  transcript: string;
  confidence: number;
  error: string | null;
}

type VoiceListener = (status: VoiceStatus) => void;

// ── Default Commands ─────────────────────────────────────────
const DEFAULT_COMMANDS: VoiceCommand[] = [
  // Navigation
  { id: 'nav_home', phrase: 'go home', aliases: ['home', 'main page', 'start page'], category: 'navigation', action: { type: 'navigate', screen: 'discover' }, enabled: true },
  { id: 'nav_discover', phrase: 'go to discover', aliases: ['discover', 'browse', 'find kings'], category: 'navigation', action: { type: 'navigate', screen: 'discover' }, enabled: true },
  { id: 'nav_messages', phrase: 'go to messages', aliases: ['messages', 'inbox', 'conversations'], category: 'navigation', action: { type: 'navigate', screen: 'messages' }, enabled: true },
  { id: 'nav_chat', phrase: 'open chat', aliases: ['chat', 'open conversation'], category: 'navigation', action: { type: 'navigate', screen: 'chat' }, enabled: true },
  { id: 'nav_events', phrase: 'go to events', aliases: ['events', 'parties', 'meetups'], category: 'navigation', action: { type: 'navigate', screen: 'events' }, enabled: true },
  { id: 'nav_right_now', phrase: 'go to right now', aliases: ['right now', 'nearby', 'live now', 'who\'s nearby'], category: 'navigation', action: { type: 'navigate', screen: 'right-now' }, enabled: true },
  { id: 'nav_profile', phrase: 'go to profile', aliases: ['profile', 'my profile', 'account'], category: 'navigation', action: { type: 'navigate', screen: 'profile' }, enabled: true },
  { id: 'nav_settings', phrase: 'go to settings', aliases: ['settings', 'preferences', 'options'], category: 'navigation', action: { type: 'navigate', screen: 'settings' }, enabled: true },
  { id: 'nav_safety', phrase: 'go to safety', aliases: ['safety', 'safety center', 'security'], category: 'navigation', action: { type: 'navigate', screen: 'safety' }, enabled: true },
  { id: 'nav_notifications', phrase: 'show notifications', aliases: ['notifications', 'alerts', 'what\'s new'], category: 'navigation', action: { type: 'navigate', screen: 'notifications' }, enabled: true },

  // Actions
  { id: 'action_like', phrase: 'like this profile', aliases: ['like', 'heart', 'super like'], category: 'profile', action: { type: 'function', fn: () => document.querySelector<HTMLElement>('[data-action="like"]')?.click() }, enabled: true },
  { id: 'action_pass', phrase: 'pass on this', aliases: ['pass', 'skip', 'next'], category: 'profile', action: { type: 'function', fn: () => document.querySelector<HTMLElement>('[data-action="pass"]')?.click() }, enabled: true },
  { id: 'action_message', phrase: 'send message', aliases: ['message', 'say hi', 'send'], category: 'chat', action: { type: 'function', fn: () => document.querySelector<HTMLElement>('[data-action="send-message"]')?.click() }, enabled: true },
  { id: 'action_block', phrase: 'block this user', aliases: ['block', 'block user'], category: 'settings', action: { type: 'function', fn: () => document.querySelector<HTMLElement>('[data-action="block"]')?.click() }, enabled: true },
  { id: 'action_report', phrase: 'report this user', aliases: ['report', 'flag'], category: 'settings', action: { type: 'function', fn: () => document.querySelector<HTMLElement>('[data-action="report"]')?.click() }, enabled: true },

  // System
  { id: 'sys_scroll_down', phrase: 'scroll down', aliases: ['scroll down', 'page down'], category: 'system', action: { type: 'function', fn: () => window.scrollBy({ top: 400, behavior: 'smooth' }) }, enabled: true },
  { id: 'sys_scroll_up', phrase: 'scroll up', aliases: ['scroll up', 'page up'], category: 'system', action: { type: 'function', fn: () => window.scrollBy({ top: -400, behavior: 'smooth' }) }, enabled: true },
  { id: 'sys_back', phrase: 'go back', aliases: ['back', 'previous', 'go back'], category: 'system', action: { type: 'function', fn: () => window.history.back() }, enabled: true },
  { id: 'sys_help', phrase: 'what can you do', aliases: ['help', 'commands', 'what can i say'], category: 'system', action: { type: 'speech', text: 'You can say: go home, go to messages, go to events, scroll down, go back, and more.' }, enabled: true },
];

// ── Voice Command Processor ──────────────────────────────────
export class VoiceCommandProcessor {
  private commands: Map<string, VoiceCommand> = new Map();
  private recognition: SpeechRecognition | null = null;
  private isListening = false;
  private isProcessing = false;
  private transcript = '';
  private confidence = 0;
  private error: string | null = null;
  private listeners = new Set<VoiceListener>();
  private commandHistory: Array<{ command: VoiceCommand; transcript: string; timestamp: number }> = [];

  constructor() {
    // Register default commands
    for (const cmd of DEFAULT_COMMANDS) {
      this.commands.set(cmd.id, cmd);
    }
    this.initRecognition();
  }

  // ── Speech Recognition ──────────────────────────────────────
  private initRecognition(): void {
    if (typeof window === 'undefined') return;

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      this.error = 'Speech recognition not supported in this browser';
      return;
    }

    this.recognition = new SpeechRecognition();
    this.recognition.continuous = false;
    this.recognition.interimResults = true;
    this.recognition.lang = 'en-US';
    this.recognition.maxAlternatives = 1;

    this.recognition.onresult = (event: SpeechRecognitionEvent) => {
      const result = event.results[0];
      this.transcript = result[0].transcript.toLowerCase().trim();
      this.confidence = result[0].confidence;
      this.emit();

      if (result.isFinal) {
        this.processCommand(this.transcript, this.confidence);
      }
    };

    this.recognition.onend = () => {
      this.isListening = false;
      this.emit();
    };

    this.recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      this.error = `Speech error: ${event.error}`;
      this.isListening = false;
      this.emit();
    };
  }

  // ── Public API ──────────────────────────────────────────────
  getSupported(): boolean {
    return !!(typeof window !== 'undefined' && ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition));
  }

  getStatus(): VoiceStatus {
    return {
      listening: this.isListening,
      processing: this.isProcessing,
      supported: this.getSupported(),
      transcript: this.transcript,
      confidence: this.confidence,
      error: this.error,
    };
  }

  onStatusChange(cb: VoiceListener): () => void {
    this.listeners.add(cb);
    return () => this.listeners.delete(cb);
  }

  getCommandHistory(): Array<{ command: VoiceCommand; transcript: string; timestamp: number }> {
    return [...this.commandHistory];
  }

  // ── Commands ────────────────────────────────────────────────
  getCommands(): VoiceCommand[] {
    return Array.from(this.commands.values()).filter(c => c.enabled);
  }

  getCommandsByCategory(category: VoiceCommand['category']): VoiceCommand[] {
    return this.getCommands().filter(c => c.category === category);
  }

  registerCommand(command: VoiceCommand): void {
    this.commands.set(command.id, command);
  }

  // ── Listening ───────────────────────────────────────────────
  start(): void {
    if (!this.recognition || this.isListening) return;
    this.error = null;
    this.transcript = '';
    this.confidence = 0;
    this.recognition.start();
    this.isListening = true;
    this.emit();
  }

  stop(): void {
    if (!this.recognition || !this.isListening) return;
    this.recognition.stop();
    this.isListening = false;
    this.emit();
  }

  // ── Command Processing ──────────────────────────────────────
  processCommand(transcript: string, confidence: number): VoiceCommandResult {
    this.isProcessing = true;
    this.emit();

    const result = this.matchCommand(transcript);

    if (result.matched && result.command) {
      this.commandHistory.push({
        command: result.command,
        transcript,
        timestamp: Date.now(),
      });
      this.executeCommand(result.command);
    }

    this.isProcessing = false;
    this.emit();
    return result;
  }

  private matchCommand(transcript: string): VoiceCommandResult {
    const words = transcript.toLowerCase().split(/\s+/);

    for (const cmd of this.commands.values()) {
      if (!cmd.enabled) continue;

      // Check phrase match
      const phraseWords = cmd.phrase.toLowerCase().split(/\s+/);
      const phraseMatch = words.length >= phraseWords.length &&
        words.slice(0, phraseWords.length).join(' ') === phraseWords.join(' ');

      // Check alias match
      const aliasMatch = cmd.aliases.some(alias => {
        const aliasWords = alias.toLowerCase().split(/\s+/);
        return words.length >= aliasWords.length &&
          words.slice(0, aliasWords.length).join(' ') === aliasWords.join(' ');
      });

      if (phraseMatch || aliasMatch) {
        return {
          command: cmd,
          transcript,
          confidence: this.confidence,
          matched: true,
        };
      }
    }

    return {
      command: null,
      transcript,
      confidence: this.confidence,
      matched: false,
    };
  }

  private executeCommand(command: VoiceCommand): void {
    switch (command.action.type) {
      case 'navigate':
        // Navigation handled by external handler
        break;
      case 'function':
        try {
          command.action.fn();
        } catch (e) {
          this.error = `Command failed: ${(e as Error).message}`;
        }
        break;
      case 'speech':
        this.speak(command.action.text);
        break;
    }
  }

  // ── Speech Synthesis ────────────────────────────────────────
  speak(text: string, rate = 1, pitch = 1): void {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = rate;
    utterance.pitch = pitch;
    speechSynthesis.speak(utterance);
  }

  // ── Internal ────────────────────────────────────────────────
  private emit(): void {
    const status = this.getStatus();
    for (const cb of this.listeners) cb(status);
  }

  destroy(): void {
    this.stop();
    this.recognition = null;
    this.listeners.clear();
    this.commands.clear();
  }
}

// ── Singleton ────────────────────────────────────────────────
let _instance: VoiceCommandProcessor | null = null;

export function getVoiceCommands(): VoiceCommandProcessor {
  if (!_instance) _instance = new VoiceCommandProcessor();
  return _instance;
}