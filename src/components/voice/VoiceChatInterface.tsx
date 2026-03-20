import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, MicOff, Volume2, Sparkles, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useVoiceNavigation } from '@/hooks/voice/useVoiceNavigation';
import { useVoiceAutoReply, AutoReplyConfig } from '@/hooks/voice/useAutoReply';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { log } from '@/lib/enterprise/Logger';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'assistant' | 'other';
  timestamp: Date;
  isVoice?: boolean;
  confidence?: number;
}

interface VoiceChatInterfaceProps {
  className?: string;
  autoReplyConfig?: AutoReplyConfig;
  onAutoReplyConfigChange?: (config: AutoReplyConfig) => void;
  onMessageSend?: (message: string) => Promise<void>;
  messages?: Message[];
  currentUserName?: string;
  otherUserName?: string;
  otherUserAvatar?: string;
  maxHeight?: string;
  placeholder?: string;
  showVoiceControls?: boolean;
  showAutoReply?: boolean;
}

export const VoiceChatInterface: React.FC<VoiceChatInterfaceProps> = ({
  className,
  autoReplyConfig,
  onAutoReplyConfigChange,
  onMessageSend,
  messages = [],
  currentUserName = 'You',
  otherUserName = 'Match',
  otherUserAvatar,
  maxHeight = '400px',
  placeholder = 'Type a message or use voice...',
  showVoiceControls = true,
  showAutoReply = true
}) => {
  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [localMessages, setLocalMessages] = useState<Message[]>(messages);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const voiceNav = useVoiceNavigation();
  const voiceAutoReply = useVoiceAutoReply(autoReplyConfig || {
    enabled: false,
    context: '',
    personality: 'friendly',
    responseLength: 'medium',
    autoSend: false,
    confidenceThreshold: 0.7
  });

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight;
      }
    }
  }, [localMessages]);

  // Handle voice transcript
  useEffect(() => {
    if (voiceNav.transcript && !voiceNav.isListening) {
      setInputText(voiceNav.transcript);
      
      // Add voice message
      const voiceMessage: Message = {
        id: `voice-${Date.now()}`,
        content: voiceNav.transcript,
        sender: 'user',
        timestamp: new Date(),
        isVoice: true,
        confidence: voiceNav.confidence
      };
      
      setLocalMessages(prev => [...prev, voiceMessage]);
    }
  }, [voiceNav.transcript, voiceNav.isListening, voiceNav.confidence]);

  // Handle auto-reply suggestions
  useEffect(() => {
    if (voiceAutoReply.suggestions.length > 0 && showAutoReply) {
      // Auto-send if configured and confidence is high
      if (voiceAutoReply.config.autoSend) {
        const topSuggestion = voiceAutoReply.suggestions[0];
        if (topSuggestion.confidence >= 0.8) {
          handleSendMessage(topSuggestion.content);
        }
      }
    }
  }, [voiceAutoReply.suggestions, voiceAutoReply.config.autoSend, showAutoReply]);

  // Handle sending messages
  const handleSendMessage = async (text: string = inputText) => {
    if (!text.trim()) return;

    const message: Message = {
      id: `msg-${Date.now()}`,
      content: text.trim(),
      sender: 'user',
      timestamp: new Date()
    };

    setLocalMessages(prev => [...prev, message]);
    setInputText('');
    setIsProcessing(true);

    try {
      await onMessageSend?.(text.trim());
      
      // Generate auto-reply if enabled
      if (voiceAutoReply.config.enabled && showAutoReply) {
        await generateAutoReply(text.trim());
      }
    } catch (error) {
      log.error('VOICE_CHAT', 'Failed to send message', { errorMessage: String(error) });
    } finally {
      setIsProcessing(false);
    }
  };

  // Generate auto-reply
  const generateAutoReply = async (userMessage: string) => {
    try {
      const suggestions = await voiceAutoReply.generateReplies(userMessage, {
        senderName: otherUserName,
        recentMessages: localMessages.slice(-3).map(msg => ({
          sender: msg.sender === 'user' ? currentUserName : otherUserName,
          content: msg.content,
          timestamp: msg.timestamp
        }))
      });

      if (suggestions.length > 0) {
        const topSuggestion = suggestions[0];
        
        const replyMessage: Message = {
          id: `reply-${Date.now()}`,
          content: topSuggestion.content,
          sender: 'assistant',
          timestamp: new Date(),
          confidence: topSuggestion.confidence
        };

        setLocalMessages(prev => [...prev, replyMessage]);
      }
    } catch (error) {
      log.error('VOICE_CHAT', 'Failed to generate auto-reply', { errorMessage: String(error) });
    }
  };

  // Handle voice recording
  const handleVoiceToggle = () => {
    if (isRecording) {
      voiceNav.stopListening();
      setIsRecording(false);
    } else {
      voiceNav.startListening();
      setIsRecording(true);
    }
  };

  // Handle keyboard shortcuts
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [inputText]);

  return (
    <Card className={cn("flex flex-col", className)} style={{ maxHeight }}>
      {/* Header */}
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={otherUserAvatar} />
              <AvatarFallback>{otherUserName[0]}</AvatarFallback>
            </Avatar>
            {otherUserName}
            {showAutoReply && voiceAutoReply.config.enabled && (
              <Badge variant="secondary" className="text-xs">
                <Sparkles className="h-3 w-3 mr-1" />
                AI Assistant
              </Badge>
            )}
          </CardTitle>
          
          {showVoiceControls && (
            <div className="flex items-center gap-2">
              {voiceNav.isListening && (
                <Badge variant="destructive" className="animate-pulse">
                  Recording
                </Badge>
              )}
              {voiceAutoReply.isGenerating && (
                <Badge variant="secondary">
                  <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                  Thinking
                </Badge>
              )}
            </div>
          )}
        </div>
      </CardHeader>

      {/* Messages */}
      <CardContent className="flex-1 p-0">
        <ScrollArea ref={scrollAreaRef} className="h-full px-4">
          <div className="space-y-4 pb-4">
            {localMessages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
                isUser={message.sender === 'user'}
                userName={message.sender === 'user' ? currentUserName : otherUserName}
                userAvatar={message.sender === 'user' ? undefined : otherUserAvatar}
              />
            ))}
            
            {isProcessing && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">Sending...</span>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>

      {/* Auto-reply suggestions */}
      {showAutoReply && voiceAutoReply.suggestions.length > 0 && !voiceAutoReply.config.autoSend && (
        <div className="px-4 py-2 border-t bg-muted/30">
          <div className="text-xs text-muted-foreground mb-2">Suggested replies:</div>
          <div className="flex flex-wrap gap-2">
            {voiceAutoReply.suggestions.slice(0, 3).map((suggestion, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => handleSendMessage(suggestion.content)}
                className="text-xs"
              >
                {suggestion.content}
                <Badge variant="secondary" className="ml-1 text-xs">
                  {Math.round(suggestion.confidence * 100)}%
                </Badge>
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-4 border-t">
        <div className="flex gap-2 items-end">
          <div className="flex-1 relative">
            <Textarea
              ref={textareaRef}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              className="min-h-[40px] max-h-[120px] resize-none pr-12"
              disabled={isProcessing}
            />
            
            {/* Voice input indicator */}
            {isRecording && (
              <div className="absolute right-2 bottom-2">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              </div>
            )}
          </div>

          {/* Voice control */}
          {showVoiceControls && (
            <Button
              size="icon"
              variant={isRecording ? "destructive" : "outline"}
              onClick={handleVoiceToggle}
              disabled={!voiceNav.isSupported}
              className="shrink-0"
            >
              {isRecording ? (
                <MicOff className="h-4 w-4" />
              ) : (
                <Mic className="h-4 w-4" />
              )}
            </Button>
          )}

          {/* Send button */}
          <Button
            size="icon"
            onClick={() => handleSendMessage()}
            disabled={!inputText.trim() || isProcessing}
            className="shrink-0"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>

        {/* Voice feedback */}
        {voiceNav.feedback && (
          <div className="mt-2 text-sm text-green-600">
            {voiceNav.feedback}
          </div>
        )}

        {/* Error display */}
        {voiceNav.error && (
          <div className="mt-2 text-sm text-destructive">
            Voice error: {voiceNav.error}
          </div>
        )}
      </div>
    </Card>
  );
};

// Message bubble component
interface MessageBubbleProps {
  message: Message;
  isUser: boolean;
  userName: string;
  userAvatar?: string;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isUser,
  userName,
  userAvatar
}) => {
  return (
    <div className={cn("flex gap-3", isUser ? "flex-row-reverse" : "flex-row")}>
      {!isUser && (
        <Avatar className="h-8 w-8 shrink-0">
          <AvatarImage src={userAvatar} />
          <AvatarFallback>{userName[0]}</AvatarFallback>
        </Avatar>
      )}
      
      <div className={cn(
        "max-w-[70%] space-y-1",
        isUser && "text-right"
      )}>
        <div className={cn(
          "inline-block px-3 py-2 rounded-lg text-sm",
          isUser 
            ? "bg-primary text-primary-foreground" 
            : "bg-muted"
        )}>
          {message.content}
        </div>
        
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {message.isVoice && <Mic className="h-3 w-3" />}
          {message.sender === 'assistant' && <Sparkles className="h-3 w-3" />}
          <span>{message.timestamp.toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}</span>
          {message.confidence && (
            <span>({Math.round(message.confidence * 100)}%)</span>
          )}
        </div>
      </div>
    </div>
  );
};
