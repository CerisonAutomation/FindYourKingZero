/**
 * P2PChatWindow — Enhanced chat with P2P capabilities
 * Integrates Trystero P2P with existing chat UI
 */
import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, 
  Paperclip, 
  Smile, 
  Image, 
  Mic, 
  MoreVertical,
  Clock,
  Check,
  CheckCheck,
  Wifi,
  WifiOff,
  Shield,
  Zap,
  Globe,
  Lock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useP2PChat, P2PMessage } from '@/hooks/useP2PChat';
import { useAuth } from '@/hooks/useAuth';
import { useProfileById } from '@/hooks/useProfiles';
import { cn } from '@/lib/utils';
import { formatMessageTime } from '@/lib/formatters';

interface P2PChatWindowProps {
  conversationId: string;
  otherUserId: string;
  className?: string;
}

export function P2PChatWindow({ conversationId, otherUserId, className }: P2PChatWindowProps) {
  const { user } = useAuth();
  const { data: otherProfile } = useProfileById(otherUserId);
  
  // P2P Chat hook
  const {
    messages,
    peers,
    isConnected,
    isP2PEnabled,
    connectionQuality,
    sendMessage,
    sendTypingIndicator,
    sendFile,
    sendEphemeralMessage,
    selfId,
  } = useP2PChat(conversationId);

  // Local state
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-scroll to bottom
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Handle input change with typing indicator
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);

    // Send typing indicator
    if (value && !isTyping) {
      setIsTyping(true);
      sendTypingIndicator(true);
    }

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout to stop typing indicator
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      sendTypingIndicator(false);
    }, 1000);
  }, [isTyping, sendTypingIndicator]);

  // Handle send message
  const handleSendMessage = useCallback(async () => {
    if (!inputValue.trim()) return;

    const content = inputValue.trim();
    setInputValue('');
    setIsTyping(false);
    sendTypingIndicator(false);

    // Clear typing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Send message
    await sendMessage(content, 'text');
  }, [inputValue, sendMessage, sendTypingIndicator]);

  // Handle key press
  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  }, [handleSendMessage]);

  // Handle file upload
  const handleFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      await sendFile(file);
    } catch (error) {
      console.error('Failed to send file:', error);
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [sendFile]);

  // Handle voice recording
  const handleStartRecording = useCallback(() => {
    setIsRecording(true);
    setRecordingTime(0);
    
    recordingIntervalRef.current = setInterval(() => {
      setRecordingTime(prev => prev + 1);
    }, 1000);
  }, []);

  const handleStopRecording = useCallback(async () => {
    setIsRecording(false);
    
    if (recordingIntervalRef.current) {
      clearInterval(recordingIntervalRef.current);
    }

    // In a real implementation, you would:
    // 1. Stop the MediaRecorder
    // 2. Get the audio blob
    // 3. Send it via P2P
    
    // For now, send a placeholder message
    await sendMessage(`🎤 Voice message (${recordingTime}s)`, 'voice', {
      duration: recordingTime,
    });
  }, [recordingTime, sendMessage]);

  // Handle ephemeral message
  const handleSendEphemeral = useCallback(async () => {
    if (!inputValue.trim()) return;

    const content = inputValue.trim();
    setInputValue('');

    // Send ephemeral message (expires in 5 minutes)
    await sendEphemeralMessage(content, 5 * 60 * 1000);
  }, [inputValue, sendEphemeralMessage]);

  // Get connection status info
  const getConnectionInfo = () => {
    if (!isConnected) {
      return { icon: WifiOff, text: 'Disconnected', color: 'text-red-500' };
    }
    
    if (!isP2PEnabled) {
      return { icon: Globe, text: 'Server mode', color: 'text-yellow-500' };
    }

    switch (connectionQuality) {
      case 'excellent':
        return { icon: Zap, text: 'P2P Excellent', color: 'text-green-500' };
      case 'good':
        return { icon: Wifi, text: 'P2P Good', color: 'text-blue-500' };
      case 'poor':
        return { icon: Wifi, text: 'P2P Poor', color: 'text-orange-500' };
      default:
        return { icon: WifiOff, text: 'Disconnected', color: 'text-red-500' };
    }
  };

  const connectionInfo = getConnectionInfo();
  const ConnectionIcon = connectionInfo.icon;

  // Render message
  const renderMessage = (message: P2PMessage) => {
    const isOwn = message.senderId === user?.id;
    const isP2P = message.isP2P;
    const isEphemeral = message.metadata?.ephemeral;

    return (
      <motion.div
        key={message.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className={cn(
          'flex gap-3 mb-4',
          isOwn ? 'flex-row-reverse' : 'flex-row'
        )}
      >
        {/* Avatar */}
        {!isOwn && (
          <Avatar className="w-8 h-8 shrink-0">
            <AvatarImage src={otherProfile?.avatar_url || ''} />
            <AvatarFallback className="text-xs">
              {otherProfile?.display_name?.[0] || '?'}
            </AvatarFallback>
          </Avatar>
        )}

        {/* Message bubble */}
        <div className={cn(
          'max-w-[70%] rounded-2xl px-4 py-2 relative',
          isOwn 
            ? 'bg-primary text-primary-foreground' 
            : 'bg-muted',
          isEphemeral && 'border-2 border-dashed border-orange-400/50'
        )}>
          {/* P2P indicator */}
          {isP2P && (
            <div className="absolute -top-1 -right-1">
              <Shield className="w-3 h-3 text-green-500" />
            </div>
          )}

          {/* Ephemeral indicator */}
          {isEphemeral && (
            <div className="absolute -top-1 -left-1">
              <Clock className="w-3 h-3 text-orange-500" />
            </div>
          )}

          {/* Message content */}
          <div className="text-sm">
            {message.type === 'file' ? (
              <div className="flex items-center gap-2">
                <Paperclip className="w-4 h-4" />
                <span className="underline">{message.content}</span>
              </div>
            ) : message.type === 'voice' ? (
              <div className="flex items-center gap-2">
                <Mic className="w-4 h-4" />
                <span>{message.content}</span>
              </div>
            ) : message.type === 'image' ? (
              <div className="flex items-center gap-2">
                <Image className="w-4 h-4" />
                <span>{message.content}</span>
              </div>
            ) : (
              message.content
            )}
          </div>

          {/* Message metadata */}
          <div className={cn(
            'flex items-center gap-1 mt-1 text-xs',
            isOwn ? 'text-primary-foreground/70' : 'text-muted-foreground'
          )}>
            <span>{formatMessageTime(message.timestamp)}</span>
            
            {/* Read receipt for own messages */}
            {isOwn && (
              <CheckCheck className="w-3 h-3" />
            )}
            
            {/* Connection type indicator */}
            {isP2P ? (
              <Shield className="w-3 h-3 text-green-500" />
            ) : (
              <Globe className="w-3 h-3 text-yellow-500" />
            )}
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className={cn('flex flex-col h-full bg-background', className)}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border/15">
        <div className="flex items-center gap-3">
          <Avatar className="w-10 h-10">
            <AvatarImage src={otherProfile?.avatar_url || ''} />
            <AvatarFallback>
              {otherProfile?.display_name?.[0] || '?'}
            </AvatarFallback>
          </Avatar>
          
          <div>
            <h3 className="font-semibold text-sm">
              {otherProfile?.display_name || 'Unknown User'}
            </h3>
            <div className="flex items-center gap-2">
              <Badge 
                variant="secondary" 
                className={cn('text-xs', connectionInfo.color)}
              >
                <ConnectionIcon className="w-3 h-3 mr-1" />
                {connectionInfo.text}
              </Badge>
              
              {peers.length > 0 && (
                <Badge variant="outline" className="text-xs">
                  {peers.length} peer{peers.length !== 1 ? 's' : ''}
                </Badge>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm">
            <MoreVertical className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence>
          {messages.map(renderMessage)}
        </AnimatePresence>
        
        {/* Typing indicator */}
        {peers.some(peer => peer.typing) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2 text-sm text-muted-foreground"
          >
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
              <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
              <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
            </div>
            <span>typing...</span>
          </motion.div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="p-4 border-t border-border/15">
        {/* Recording indicator */}
        {isRecording && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center gap-2 mb-3 p-2 bg-red-500/10 rounded-lg"
          >
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
            <span className="text-sm text-red-500 font-medium">
              Recording... {recordingTime}s
            </span>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleStopRecording}
            >
              Stop
            </Button>
          </motion.div>
        )}

        <div className="flex items-center gap-2">
          {/* File upload */}
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileUpload}
            className="hidden"
            accept="image/*,audio/*,video/*,.pdf,.doc,.docx"
          />
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={isRecording}
          >
            <Paperclip className="w-4 h-4" />
          </Button>

          {/* Image upload */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              if (fileInputRef.current) {
                fileInputRef.current.accept = 'image/*';
                fileInputRef.current.click();
              }
            }}
            disabled={isRecording}
          >
            <Image className="w-4 h-4" />
          </Button>

          {/* Voice recording */}
          <Button
            variant="ghost"
            size="sm"
            onClick={isRecording ? handleStopRecording : handleStartRecording}
            className={cn(isRecording && 'text-red-500')}
          >
            <Mic className="w-4 h-4" />
          </Button>

          {/* Message input */}
          <div className="flex-1 relative">
            <Input
              ref={inputRef}
              value={inputValue}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              disabled={isRecording}
              className="pr-10"
            />
            
            {/* Emoji picker button */}
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            >
              <Smile className="w-4 h-4" />
            </Button>
          </div>

          {/* Send button */}
          <Button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isRecording}
            size="sm"
          >
            <Send className="w-4 h-4" />
          </Button>

          {/* Ephemeral message button */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleSendEphemeral}
            disabled={!inputValue.trim() || isRecording}
            className="text-orange-500 border-orange-500/30 hover:bg-orange-500/10"
          >
            <Clock className="w-4 h-4" />
          </Button>
        </div>

        {/* Connection info */}
        <div className="flex items-center justify-center gap-2 mt-2 text-xs text-muted-foreground">
          {isP2PEnabled ? (
            <>
              <Lock className="w-3 h-3" />
              <span>End-to-end encrypted via P2P</span>
            </>
          ) : (
            <>
              <Globe className="w-3 h-3" />
              <span>Server-based messaging</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default P2PChatWindow;