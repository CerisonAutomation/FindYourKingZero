/**
 * Enterprise Messaging Interface
 * Real-time messaging with encryption, AI moderation, and performance optimization
 */

import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {AnimatePresence, motion} from 'framer-motion';
import {
    Archive,
    Brain,
    Check,
    CheckCheck,
    Flag,
    Lock,
    MessageCircle,
    MoreVertical,
    Paperclip,
    Phone,
    Search,
    Send,
    Settings,
    Star,
    Trash2,
    User,
    Video,
    Volume2,
    VolumeX,
} from 'lucide-react';

import type {Message} from '@/lib/hybrid-p2p-dating';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Badge} from '@/components/ui/badge';

interface MessagingInterfaceProps {
  advancedMode: boolean;
  onSendSecureMessage: (userId: string, content: string) => void;
  onInitiateCall: (userId: string) => void;
}

interface Conversation {
  id: string;
  userId: string;
  displayName: string;
  avatar?: string;
  lastMessage: Message;
  unreadCount: number;
  isOnline: boolean;
  isTyping: boolean;
  isMuted: boolean;
  isArchived: boolean;
  isFavorite: boolean;
}

interface MessageState {
  text: string;
  isTyping: boolean;
  isEncrypted: boolean;
  isAIModerated: boolean;
  sendTime: number;
}

export default function MessagingInterface({
  advancedMode,
  onSendSecureMessage,
  onInitiateCall,
}: MessagingInterfaceProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showArchived, setShowArchived] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [encryptionEnabled, setEncryptionEnabled] = useState(true);
  const [aiModerationEnabled, setAIModerationEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [typingIndicator, setTypingIndicator] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sample conversations (would come from actual data)
  useEffect(() => {
    const sampleConversations: Conversation[] = [
      {
        id: '1',
        userId: 'user1',
        displayName: 'Alex Johnson',
        lastMessage: {
          id: 'msg1',
          fromUserId: 'user1',
          toUserId: 'current',
          content: 'Hey! How are you doing?',
          type: 'text',
          timestamp: new Date(Date.now() - 1000 * 60 * 5),
          isEncrypted: true,
          isEphemeral: false,
        },
        unreadCount: 2,
        isOnline: true,
        isTyping: false,
        isMuted: false,
        isArchived: false,
        isFavorite: true,
      },
      {
        id: '2',
        userId: 'user2',
        displayName: 'Sam Wilson',
        lastMessage: {
          id: 'msg2',
          fromUserId: 'current',
          toUserId: 'user2',
          content: 'Great to meet you too!',
          type: 'text',
          timestamp: new Date(Date.now() - 1000 * 60 * 60),
          isEncrypted: true,
          isEphemeral: false,
        },
        unreadCount: 0,
        isOnline: false,
        isTyping: false,
        isMuted: false,
        isArchived: false,
        isFavorite: false,
      },
    ];
    setConversations(sampleConversations);
  }, []);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle typing indicator
  useEffect(() => {
    const typingTimeout = setTimeout(() => {
      setIsTyping(false);
    }, 1000);

    return () => clearTimeout(typingTimeout);
  }, [messageInput]);

  // Filter conversations
  const filteredConversations = useMemo(() => {
    return conversations.filter(conv => {
      if (showArchived && !conv.isArchived) return false;
      if (!showArchived && conv.isArchived) return false;
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return conv.displayName.toLowerCase().includes(query);
      }
      return true;
    });
  }, [conversations, showArchived, searchQuery]);

  const selectedConv = conversations.find(c => c.id === selectedConversation);

  // Message handlers
  const handleSendMessage = useCallback(async () => {
    if (!messageInput.trim() || !selectedConv) return;

    const newMessage: Message = {
      id: `msg_${Date.now()}`,
      fromUserId: 'current',
      toUserId: selectedConv.userId,
      content: messageInput,
      type: 'text',
      timestamp: new Date(),
      isEncrypted: encryptionEnabled,
      isEphemeral: false,
    };

    // AI moderation check
    if (aiModerationEnabled && advancedMode) {
      const isAppropriate = await moderateMessage(messageInput);
      if (!isAppropriate) {
        console.warn('Message blocked by AI moderation');
        return;
      }
    }

    setMessages(prev => [...prev, newMessage]);
    setMessageInput('');
    setIsTyping(false);

    // Update conversation
    setConversations(prev => prev.map(conv =>
      conv.id === selectedConversation
        ? { ...conv, lastMessage: newMessage }
        : conv
    ));

    // Send through secure channel
    onSendSecureMessage(selectedConv.userId, messageInput);
  }, [messageInput, selectedConv, selectedConversation, encryptionEnabled, aiModerationEnabled, advancedMode, onSendSecureMessage]);

  const moderateMessage = async (content: string): Promise<boolean> => {
    // Simulate AI moderation
    await new Promise(resolve => setTimeout(resolve, 100));
    const toxicWords = ['spam', 'abuse', 'inappropriate'];
    return !toxicWords.some(word => content.toLowerCase().includes(word));
  };

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  }, [handleSendMessage]);

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0 && selectedConv) {
      // Handle file upload
      console.log('File upload:', files[0]);
    }
  }, [selectedConv]);

  const handleCall = useCallback((type: 'audio' | 'video') => {
    if (selectedConv) {
      onInitiateCall(selectedConv.userId);
    }
  }, [selectedConv, onInitiateCall]);

  const formatTime = useCallback((date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));

    if (hours < 1) {
      const minutes = Math.floor(diff / (1000 * 60));
      return `${minutes}m ago`;
    } else if (hours < 24) {
      return `${hours}h ago`;
    } else {
      return date.toLocaleDateString();
    }
  }, []);

  const MessageBubble = ({ message, isOwn }: { message: Message; isOwn: boolean }) => (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-4`}
    >
      <div className={`max-w-xs lg:max-w-md ${isOwn ? 'order-2' : 'order-1'}`}>
        <div
          className={`px-4 py-2 rounded-2xl ${
            isOwn
              ? 'bg-blue-500 text-white'
              : 'bg-white/10 text-white'
          }`}
        >
          <p className="text-sm">{message.content}</p>
          <div className={`flex items-center space-x-1 mt-1 text-xs ${
            isOwn ? 'text-blue-100' : 'text-white/60'
          }`}>
            <span>{formatTime(message.timestamp)}</span>
            {isOwn && (
              <>
                {message.isEncrypted && <Lock className="w-3 h-3" />}
                <Check className="w-3 h-3" />
                <CheckCheck className="w-3 h-3" />
              </>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="h-full flex bg-black/20">
      {/* Conversations List */}
      <div className="w-80 border-r border-white/10 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white">Messages</h2>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowArchived(!showArchived)}
                className="text-white/60 hover:text-white"
              >
                <Archive className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-white/60 hover:text-white"
              >
                <Settings className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/60" />
            <Input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white/10 border-white/20 text-white placeholder-white/60"
            />
          </div>
        </div>

        {/* Conversations */}
        <div className="flex-1 overflow-y-auto">
          {filteredConversations.map((conversation) => (
            <motion.div
              key={conversation.id}
              whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
              onClick={() => setSelectedConversation(conversation.id)}
              className={`p-4 border-b border-white/10 cursor-pointer transition-colors ${
                selectedConversation === conversation.id ? 'bg-white/10' : ''
              }`}
            >
              <div className="flex items-start space-x-3">
                <div className="relative">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  {conversation.isOnline && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-black/20" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-white font-semibold truncate">{conversation.displayName}</h3>
                    <span className="text-white/60 text-xs">{formatTime(conversation.lastMessage.timestamp)}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <p className="text-white/60 text-sm truncate">
                      {conversation.isTyping ? 'Typing...' : conversation.lastMessage.content}
                    </p>
                    <div className="flex items-center space-x-1">
                      {conversation.isFavorite && <Star className="w-3 h-3 text-yellow-400 fill-current" />}
                      {conversation.isMuted && <VolumeX className="w-3 h-3 text-white/60" />}
                      {conversation.unreadCount > 0 && (
                        <Badge className="bg-blue-500 text-white text-xs">
                          {conversation.unreadCount}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedConv ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-white/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    {selectedConv.isOnline && (
                      <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-black/20" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">{selectedConv.displayName}</h3>
                    <p className="text-white/60 text-sm">
                      {selectedConv.isTyping ? 'Typing...' : selectedConv.isOnline ? 'Online' : 'Offline'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Button
                    onClick={() => handleCall('audio')}
                    variant="ghost"
                    size="sm"
                    className="text-white/60 hover:text-white"
                  >
                    <Phone className="w-4 h-4" />
                  </Button>
                  <Button
                    onClick={() => handleCall('video')}
                    variant="ghost"
                    size="sm"
                    className="text-white/60 hover:text-white"
                  >
                    <Video className="w-4 h-4" />
                  </Button>
                  <Button
                    onClick={() => setShowInfo(!showInfo)}
                    variant="ghost"
                    size="sm"
                    className="text-white/60 hover:text-white"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4">
              <div className="space-y-4">
                {messages.map((message) => (
                  <MessageBubble
                    key={message.id}
                    message={message}
                    isOwn={message.fromUserId === 'current'}
                  />
                ))}
                {typingIndicator && (
                  <div className="flex items-center space-x-2 text-white/60">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                      <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                    </div>
                    <span className="text-sm">Typing...</span>
                  </div>
                )}
              </div>
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-white/10">
              {advancedMode && (
                <div className="flex items-center space-x-2 mb-3">
                  <Button
                    onClick={() => setEncryptionEnabled(!encryptionEnabled)}
                    variant={encryptionEnabled ? "default" : "outline"}
                    size="sm"
                    className={encryptionEnabled ? "bg-green-500 text-white" : "bg-white/10 text-white"}
                  >
                    <Lock className="w-3 h-3 mr-1" />
                    Encrypted
                  </Button>
                  <Button
                    onClick={() => setAIModerationEnabled(!aiModerationEnabled)}
                    variant={aiModerationEnabled ? "default" : "outline"}
                    size="sm"
                    className={aiModerationEnabled ? "bg-blue-500 text-white" : "bg-white/10 text-white"}
                  >
                    <Brain className="w-3 h-3 mr-1" />
                    AI Guard
                  </Button>
                  <Button
                    onClick={() => setSoundEnabled(!soundEnabled)}
                    variant={soundEnabled ? "default" : "outline"}
                    size="sm"
                    className={soundEnabled ? "bg-purple-500 text-white" : "bg-white/10 text-white"}
                  >
                    {soundEnabled ? <Volume2 className="w-3 h-3" /> : <VolumeX className="w-3 h-3" />}
                  </Button>
                </div>
              )}

              <div className="flex items-center space-x-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileUpload}
                  className="hidden"
                  accept="image/*,video/*,.pdf,.doc,.docx"
                />

                <Button
                  onClick={() => fileInputRef.current?.click()}
                  variant="ghost"
                  size="sm"
                  className="text-white/60 hover:text-white"
                >
                  <Paperclip className="w-4 h-4" />
                </Button>

                <Input
                  ref={inputRef}
                  type="text"
                  placeholder="Type a message..."
                  value={messageInput}
                  onChange={(e) => {
                    setMessageInput(e.target.value);
                    setIsTyping(true);
                  }}
                  onKeyPress={handleKeyPress}
                  className="flex-1 bg-white/10 border-white/20 text-white placeholder-white/60"
                />

                <Button
                  onClick={handleSendMessage}
                  disabled={!messageInput.trim()}
                  className="bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-white">
              <MessageCircle className="w-16 h-16 mx-auto mb-4 text-white/60" />
              <h3 className="text-xl font-semibold mb-2">Select a conversation</h3>
              <p className="text-white/60">Choose a conversation to start messaging</p>
            </div>
          </div>
        )}
      </div>

      {/* Info Panel */}
      <AnimatePresence>
        {showInfo && selectedConv && (
          <motion.div
            initial={{ x: 300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 300, opacity: 0 }}
            className="w-80 border-l border-white/10 p-4 bg-black/40"
          >
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                <User className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white">{selectedConv.displayName}</h3>
              <p className="text-white/60">{selectedConv.isOnline ? 'Online' : 'Offline'}</p>
            </div>

            <div className="space-y-4">
              <Button
                onClick={() => setConversations(prev => prev.map(conv =>
                  conv.id === selectedConv.id
                    ? { ...conv, isFavorite: !conv.isFavorite }
                    : conv
                ))}
                variant="outline"
                className="w-full bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                <Star className={`w-4 h-4 mr-2 ${selectedConv.isFavorite ? 'fill-current' : ''}`} />
                {selectedConv.isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
              </Button>

              <Button
                onClick={() => setConversations(prev => prev.map(conv =>
                  conv.id === selectedConv.id
                    ? { ...conv, isMuted: !conv.isMuted }
                    : conv
                ))}
                variant="outline"
                className="w-full bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                {selectedConv.isMuted ? <Volume2 className="w-4 h-4 mr-2" /> : <VolumeX className="w-4 h-4 mr-2" />}
                {selectedConv.isMuted ? 'Unmute' : 'Mute'}
              </Button>

              <Button
                onClick={() => setConversations(prev => prev.map(conv =>
                  conv.id === selectedConv.id
                    ? { ...conv, isArchived: !conv.isArchived }
                    : conv
                ))}
                variant="outline"
                className="w-full bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                <Archive className="w-4 h-4 mr-2" />
                Archive
              </Button>

              <Button
                variant="outline"
                className="w-full bg-red-500/20 border-red-500/50 text-red-400 hover:bg-red-500/30"
              >
                <Flag className="w-4 h-4 mr-2" />
                Report
              </Button>

              <Button
                variant="outline"
                className="w-full bg-red-500/20 border-red-500/50 text-red-400 hover:bg-red-500/30"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Conversation
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
