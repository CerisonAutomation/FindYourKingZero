/**
 * Elite AI Assistant Component
 * Modern, personality-driven dating assistant with elite animations
 * Integrates EliteAIEngine with Elite Effects
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Bot, Send, Sparkles, X, Lightbulb, MessageCircle, Heart, User, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { Reveal } from '@/lib/animations';
import { EliteConfetti, SparkleEffect } from '@/components/effects';
import {
  useEliteAIEngine,
  PERSONALITIES,
} from '@/lib/ai/EliteAIEngine';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  quickReplies?: string[];
}

interface EliteAIAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  personality?: keyof typeof PERSONALITIES;
}

const QUICK_PROMPTS = [
  { icon: Lightbulb, label: 'Profile tips', prompt: 'Give me 3 tips to improve my dating profile' },
  { icon: MessageCircle, label: 'Icebreakers', prompt: 'Suggest some creative icebreaker messages' },
  { icon: Heart, label: 'Bio ideas', prompt: 'Help me write a bio that stands out' },
  { icon: User, label: 'Photo advice', prompt: 'What photos should I use for better matches?' },
  { icon: Zap, label: 'Red flags', prompt: 'What are dating red flags I should watch for?' },
];

export function EliteAIAssistant({ isOpen, onClose, personality = 'default' }: EliteAIAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [currentPersonality, setCurrentPersonality] = useState(personality);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const ai = useEliteAIEngine(currentPersonality);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || isLoading) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: content.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Check safety
    const safety = ai.checkSafety(content);
    if (!safety.safe) {
      const warningMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: safety.warning || "Let's keep things respectful 🙏",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, warningMessage]);
      setIsLoading(false);
      return;
    }

    // Simulate AI response
    setTimeout(() => {
      let responseContent = '';
      const lowerContent = content.toLowerCase();

      // Generate contextual response
      if (lowerContent.includes('profile') || lowerContent.includes('photo')) {
        responseContent = ai.getCoachingTip('profileTips');
      } else if (lowerContent.includes('icebreaker') || lowerContent.includes('message')) {
        responseContent = ai.getCoachingTip('icebreakers');
      } else if (lowerContent.includes('conversation') || lowerContent.includes('talk')) {
        responseContent = ai.getCoachingTip('conversationTips');
      } else if (lowerContent.includes('red flag') || lowerContent.includes('watch')) {
        responseContent = ai.getCoachingTip('redFlags');
      } else if (lowerContent.includes('bio')) {
        responseContent = "Your bio should open with a hook, not your job. Try: 'Currently accepting applications for adventure partner. Must enjoy late-night tacos and early morning coffee.'";
      } else {
        // Get quick replies based on intent
        const quickReplies = ai.getQuickReplies(content, 1);
        responseContent = quickReplies[0]?.text || "Tell me more about what you're looking for 👀";
      }

      // Add personality flavor
      const personalityConfig = PERSONALITIES[currentPersonality];
      if (personalityConfig.tone === 'witty' && Math.random() > 0.5) {
        responseContent += " And yes, I'm actually helpful too.";
      } else if (personalityConfig.tone === 'playful') {
        responseContent += " ✨";
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: responseContent,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
      setIsLoading(false);

      // Trigger confetti on helpful responses
      if (lowerContent.includes('thanks') || lowerContent.includes('helpful')) {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 2000);
      }
    }, 800 + Math.random() * 400);
  }, [ai, currentPersonality, isLoading]);

  const handleQuickPrompt = (prompt: string) => {
    sendMessage(prompt);
  };

  const personalityEmoji: Record<string, string> = {
    default: '🤖',
    witty: '😏',
    playful: '✨',
    direct: '🎯',
  };

  if (!isOpen) return null;

  return (
    <>
      <EliteConfetti trigger={showConfetti} count={50} duration={2000} />

      <motion.div
        className="fixed inset-x-4 bottom-20 z-50 md:inset-x-auto md:right-4 md:bottom-24 md:w-[420px]"
        initial={{ opacity: 0, y: 100, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 100, scale: 0.95 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        <SparkleEffect>
          <div className="bg-card border border-border rounded-2xl shadow-2xl overflow-hidden backdrop-blur-lg bg-opacity-95">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border bg-gradient-to-r from-primary/10 to-accent/10">
              <div className="flex items-center gap-3">
                <motion.div
                  className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center"
                  whileHover={{ scale: 1.1, rotate: 10 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Bot className="w-5 h-5 text-primary" />
                </motion.div>
                <div>
                  <h3 className="font-semibold flex items-center gap-2">
                    Find Your King AI
                    <span className="text-lg">{personalityEmoji[currentPersonality]}</span>
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {PERSONALITIES[currentPersonality].name}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Personality Switcher */}
                <select
                  value={currentPersonality}
                  onChange={(e) => setCurrentPersonality(e.target.value as keyof typeof PERSONALITIES)}
                  className="text-xs bg-background/50 border border-border rounded-md px-2 py-1"
                >
                  <option value="default">Warm</option>
                  <option value="witty">Witty</option>
                  <option value="playful">Playful</option>
                  <option value="direct">Direct</option>
                </select>

                <Button variant="ghost" size="icon" onClick={onClose}>
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Messages */}
            <div className="h-80 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 && (
                <Reveal preset="fadeInUp" className="text-center py-8">
                  <motion.div
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    <Bot className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                  </motion.div>
                  <p className="text-muted-foreground mb-4">
                    Hey! I&apos;m here to help with your dating journey. Ask me anything or try a prompt below.
                  </p>

                  <div className="grid grid-cols-1 gap-2">
                    {QUICK_PROMPTS.map((prompt, _idx) => (
                      <motion.button
                        key={prompt.label}
                        onClick={() => handleQuickPrompt(prompt.prompt)}
                        className="flex items-center gap-3 w-full p-3 rounded-xl bg-secondary/50 hover:bg-secondary transition-all text-left text-sm group"
                        whileHover={{ x: 4, scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: _idx * 0.1 }}
                      >
                        <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center group-hover:bg-primary/30 transition-colors">
                          <prompt.icon className="w-4 h-4 text-primary" />
                        </div>
                        <span className="font-medium">{prompt.label}</span>
                        <Sparkles className="w-4 h-4 text-muted-foreground ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                      </motion.button>
                    ))}
                  </div>
                </Reveal>
              )}

              <AnimatePresence mode="popLayout">
                {messages.map((message, idx) => (
                  <motion.div
                    key={message.id}
                    layout
                    initial={{ opacity: 0, y: 20, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    className={cn(
                      "flex gap-3",
                      message.role === 'user' ? "justify-end" : "justify-start"
                    )}
                  >
                    {message.role === 'assistant' && (
                      <Avatar className="w-8 h-8 bg-primary/20 shrink-0">
                        <AvatarFallback className="text-primary text-sm">
                          {personalityEmoji[currentPersonality]}
                        </AvatarFallback>
                      </Avatar>
                    )}

                    <motion.div
                      className={cn(
                        "max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed",
                        message.role === 'user'
                          ? "bg-primary text-primary-foreground rounded-br-md"
                          : "bg-secondary text-secondary-foreground rounded-bl-md"
                      )}
                      whileHover={{ scale: 1.02 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                    >
                      {message.content}
                    </motion.div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {isLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-3 justify-start"
                >
                  <Avatar className="w-8 h-8 bg-primary/20">
                    <AvatarFallback className="text-primary text-sm">
                      {personalityEmoji[currentPersonality]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="bg-secondary rounded-2xl rounded-bl-md px-4 py-3 flex items-center gap-1">
                    <motion.span
                      className="w-2 h-2 bg-foreground/50 rounded-full"
                      animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 1, repeat: Infinity, delay: 0 }}
                    />
                    <motion.span
                      className="w-2 h-2 bg-foreground/50 rounded-full"
                      animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                    />
                    <motion.span
                      className="w-2 h-2 bg-foreground/50 rounded-full"
                      animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
                    />
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-border bg-background/50">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  sendMessage(input);
                }}
                className="flex gap-2"
              >
                <Input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={`Ask ${PERSONALITIES[currentPersonality].name.toLowerCase()}...`}
                  disabled={isLoading}
                  className="flex-1 bg-background"
                />
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    type="submit"
                    size="icon"
                    disabled={!input.trim() || isLoading}
                    className="shrink-0"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </motion.div>
              </form>
            </div>
          </div>
        </SparkleEffect>
      </motion.div>
    </>
  );
}

export default EliteAIAssistant;
