/**
 * 💬 UNIFIED CHAT PROVIDER COMPONENT
 * Consolidates MessagingInterface, UnifiedChatWindow, ChatThread into single component
 * Supports multiple chat modes and conversation types for maximum flexibility
 */

import {useCallback, useEffect, useRef, useState} from 'react';
import {motion} from 'framer-motion';
import {Button} from '@/components/ui/button';
import {Badge} from '@/components/ui/badge';
import {Avatar, AvatarFallback, AvatarImage} from '@/components/ui/avatar';
import {Input} from '@/components/ui/input';
import {Textarea} from '@/components/ui/textarea';
import {cn} from '@/lib/utils';
import {
  Check,
  CheckCheck,
  ChevronLeft,
  Clock,
  MessageCircle,
  Mic,
  MicOff,
  MoreVertical,
  Paperclip,
  Phone,
  Plus,
  Search,
  Send,
  Star,
  Users,
  VolumeX,
  X
} from 'lucide-react';

// Unified Chat Types
export type ChatMessage  = {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  type: 'text' | 'image' | 'audio' | 'video' | 'file' | 'location' | 'reaction';
  timestamp: number;
  status: 'sending' | 'sent' | 'delivered' | 'read' | 'failed';
  metadata?: {
    fileName?: string;
    fileSize?: number;
    duration?: number;
    reaction?: string;
    replyTo?: string;
    editHistory?: Array<{ content: string; timestamp: number }>;
    selfDestruct?: number;
    readReceipt?: boolean;
  };
}

export type ChatConversation  = {
  id: string;
  type: 'direct' | 'group' | 'room' | 'event';
  name: string;
  avatar?: string;
  description?: string;
  participants: Array<{
    id: string;
    name: string;
    avatar?: string;
    isOnline?: boolean;
    isTyping?: boolean;
    role?: 'admin' | 'moderator' | 'member';
  }>;
  lastMessage?: ChatMessage;
  unreadCount: number;
  isMuted: boolean;
  isArchived: boolean;
  isPinned: boolean;
  metadata?: {
    eventId?: string;
    roomId?: string;
    isPublic?: boolean;
    memberCount?: number;
    createdAt: string;
    lastActivity: string;
  };
}

export type ChatUser  = {
  id: string;
  name: string;
  avatar?: string;
  isOnline: boolean;
  isTyping: boolean;
  lastSeen?: number;
  status?: string;
  role?: 'user' | 'premium' | 'vip' | 'admin' | 'moderator';
  verification?: {
    photo?: boolean;
    age?: boolean;
    identity?: boolean;
  };
}

export type ChatActions  = {
  onSendMessage?: (conversationId: string, content: string, type: ChatMessage['type']) => void;
  onEditMessage?: (messageId: string, content: string) => void;
  onDeleteMessage?: (messageId: string) => void;
  onReactToMessage?: (messageId: string, reaction: string) => void;
  onMarkAsRead?: (conversationId: string, messageId: string) => void;
  onMuteConversation?: (conversationId: string) => void;
  onArchiveConversation?: (conversationId: string) => void;
  onDeleteConversation?: (conversationId: string) => void;
  onPinConversation?: (conversationId: string) => void;
  onStartCall?: (conversationId: string, type: 'audio' | 'video') => void;
  onBlockUser?: (userId: string) => void;
  onReportUser?: (userId: string) => void;
  onViewProfile?: (userId: string) => void;
  onAddParticipant?: (conversationId: string, userId: string) => void;
  onRemoveParticipant?: (conversationId: string, userId: string) => void;
}

export type ChatMode = 'list' | 'thread' | 'room' | 'unified' | 'compact';
export type ChatLayout = 'sidebar' | 'full' | 'modal' | 'embedded';

interface UnifiedChatProviderProps {
  mode: ChatMode;
  layout?: ChatLayout;
  conversations?: ChatConversation[];
  currentConversation?: ChatConversation;
  messages?: ChatMessage[];
  currentUser?: ChatUser;
  actions?: ChatActions;
  showSearch?: boolean;
  showFilters?: boolean;
  showTypingIndicator?: boolean;
  showReadReceipts?: boolean;
  showOnlineStatus?: boolean;
  enableReactions?: boolean;
  enableFileSharing?: boolean;
  enableVoiceMessages?: boolean;
  enableVideoCalls?: boolean;
  enableEncryption?: boolean;
  maxHeight?: string;
  className?: string;
}

export function UnifiedChatProvider({
  mode = 'list',
  layout = 'sidebar',
  conversations = [],
  currentConversation,
  messages = [],
  currentUser,
  actions,
  showSearch = true,
  showFilters = true,
  showTypingIndicator = true,
  showReadReceipts = true,
  showOnlineStatus = true,
  enableReactions = true,
  enableFileSharing = true,
  enableVoiceMessages = true,
  enableVideoCalls = true,
  enableEncryption = true,
  maxHeight = '600px',
  className
}: UnifiedChatProviderProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedConversation, setSelectedConversation] = useState<ChatConversation | null>(currentConversation || null);
  const [messageInput, setMessageInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showConversationSettings, setShowConversationSettings] = useState(false);
  const [replyingTo, setReplyingTo] = useState<ChatMessage | null>(null);
  const [editingMessage, setEditingMessage] = useState<ChatMessage | null>(null);
  const [selectedMessages, setSelectedMessages] = useState<Set<string>>(new Set());
  const [isTyping, setIsTyping] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Filter conversations based on search
  const filteredConversations = conversations.filter(conv =>
    conv.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle sending messages
  const handleSendMessage = useCallback(() => {
    if (!messageInput.trim() || !selectedConversation || !actions?.onSendMessage) return;

    actions.onSendMessage(selectedConversation.id, messageInput, 'text');
    setMessageInput('');
    setReplyingTo(null);
  }, [messageInput, selectedConversation, actions]);

  // Handle file upload
  const handleFileUpload = useCallback((files: FileList) => {
    if (!selectedConversation || !actions?.onSendMessage) return;

    Array.from(files).forEach(file => {
      const type = file.type.startsWith('image/') ? 'image' : 
                  file.type.startsWith('video/') ? 'video' :
                  file.type.startsWith('audio/') ? 'audio' : 'file';
      
      actions.onSendMessage(selectedConversation.id, file.name, type);
    });
  }, [selectedConversation, actions]);

  // Handle voice recording
  const toggleRecording = useCallback(() => {
    if (isRecording) {
      // Stop recording and send
      setIsRecording(false);
      // Here you would handle the recorded audio
    } else {
      // Start recording
      setIsRecording(true);
    }
  }, [isRecording]);

  // Handle message reactions
  const handleReaction = useCallback((messageId: string, reaction: string) => {
    actions?.onReactToMessage?.(messageId, reaction);
  }, [actions]);

  // Handle message selection
  const toggleMessageSelection = useCallback((messageId: string) => {
    const newSelection = new Set(selectedMessages);
    if (newSelection.has(messageId)) {
      newSelection.delete(messageId);
    } else {
      newSelection.add(messageId);
    }
    setSelectedMessages(newSelection);
  }, [selectedMessages]);

  // Format timestamp
  const formatTimestamp = (timestamp: number): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    if (diff < 604800000) return `${Math.floor(diff / 86400000)}d ago`;
    
    return date.toLocaleDateString();
  };

  // Get message status icon
  const getMessageStatusIcon = (status: ChatMessage['status']) => {
    switch (status) {
      case 'sending':
        return <Clock className="w-3 h-3 text-muted-foreground" />;
      case 'sent':
        return <Check className="w-3 h-3 text-muted-foreground" />;
      case 'delivered':
        return <CheckCheck className="w-3 h-3 text-muted-foreground" />;
      case 'read':
        return <CheckCheck className="w-3 h-3 text-blue-500" />;
      case 'failed':
        return <X className="w-3 h-3 text-red-500" />;
      default:
        return null;
    }
  };

  // List Mode - Conversation list
  if (mode === 'list') {
    return (
      <div className={cn("flex flex-col h-full", className)} style={{ maxHeight }}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">Messages</h2>
          <div className="flex gap-2">
            {showSearch && (
              <Button variant="ghost" size="sm">
                <Search className="w-4 h-4" />
              </Button>
            )}
            <Button variant="ghost" size="sm">
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Search Bar */}
        {showSearch && (
          <div className="p-4 border-b">
            <Input
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        )}

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto">
          {filteredConversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
              <MessageCircle className="w-12 h-12 mb-2" />
              <p>No conversations yet</p>
            </div>
          ) : (
            <div className="space-y-1">
              {filteredConversations.map((conversation) => (
                <motion.div
                  key={conversation.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    "flex items-center gap-3 p-4 hover:bg-muted/50 cursor-pointer transition-colors",
                    selectedConversation?.id === conversation.id && "bg-muted"
                  )}
                  onClick={() => setSelectedConversation(conversation)}
                >
                  <div className="relative">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={conversation.avatar} />
                      <AvatarFallback>
                        {conversation.type === 'group' ? (
                          <Users className="w-6 h-6" />
                        ) : (
                          conversation.name.charAt(0)
                        )}
                      </AvatarFallback>
                    </Avatar>
                    {showOnlineStatus && conversation.type === 'direct' && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-background" />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-medium truncate">{conversation.name}</h3>
                      <span className="text-xs text-muted-foreground">
                        {conversation.lastMessage && formatTimestamp(conversation.lastMessage.timestamp)}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-muted-foreground truncate">
                        {conversation.lastMessage?.content || 'No messages yet'}
                      </p>
                      <div className="flex items-center gap-1">
                        {conversation.isPinned && <Star className="w-3 h-3 text-yellow-500" />}
                        {conversation.isMuted && <VolumeX className="w-3 h-3 text-muted-foreground" />}
                        {conversation.unreadCount > 0 && (
                          <Badge variant="secondary" className="text-xs">
                            {conversation.unreadCount}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Thread Mode - Single conversation view
  if (mode === 'thread' && selectedConversation) {
    return (
      <div className={cn("flex flex-col h-full", className)} style={{ maxHeight }}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => setSelectedConversation(null)}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Avatar className="w-8 h-8">
              <AvatarImage src={selectedConversation.avatar} />
              <AvatarFallback>
                {selectedConversation.type === 'group' ? (
                  <Users className="w-4 h-4" />
                ) : (
                  selectedConversation.name.charAt(0)
                )}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-medium">{selectedConversation.name}</h3>
              {showOnlineStatus && selectedConversation.type === 'direct' && (
                <p className="text-xs text-muted-foreground">Online</p>
              )}
            </div>
          </div>
          
          <div className="flex gap-2">
            {enableVideoCalls && (
              <Button variant="ghost" size="sm">
                <Phone className="w-4 h-4" />
              </Button>
            )}
            <Button variant="ghost" size="sm">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "flex gap-3",
                message.senderId === currentUser?.id ? "flex-row-reverse" : "flex-row"
              )}
            >
              <Avatar className="w-8 h-8">
                <AvatarImage src={message.senderId === currentUser?.id ? currentUser?.avatar : selectedConversation.avatar} />
                <AvatarFallback>
                  {message.senderId === currentUser?.id ? 'You' : selectedConversation.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              
              <div className={cn(
                "max-w-[70%] space-y-1",
                message.senderId === currentUser?.id && "items-end"
              )}>
                <div className={cn(
                  "rounded-lg p-3",
                  message.senderId === currentUser?.id 
                    ? "bg-primary text-primary-foreground" 
                    : "bg-muted"
                )}>
                  <p>{message.content}</p>
                </div>
                
                <div className={cn(
                  "flex items-center gap-2 text-xs text-muted-foreground",
                  message.senderId === currentUser?.id ? "flex-row-reverse" : "flex-row"
                )}>
                  <span>{formatTimestamp(message.timestamp)}</span>
                  {message.senderId === currentUser?.id && showReadReceipts && getMessageStatusIcon(message.status)}
                </div>
              </div>
            </motion.div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <div className="border-t p-4">
          {replyingTo && (
            <div className="mb-2 p-2 bg-muted rounded-lg flex items-center justify-between">
              <span className="text-sm">Replying to: {replyingTo.content}</span>
              <Button variant="ghost" size="sm" onClick={() => setReplyingTo(null)}>
                <X className="w-3 h-3" />
              </Button>
            </div>
          )}
          
          <div className="flex gap-2">
            {enableFileSharing && (
              <>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  className="hidden"
                  onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
                />
                <Button variant="ghost" size="sm" onClick={() => fileInputRef.current?.click()}>
                  <Paperclip className="w-4 h-4" />
                </Button>
              </>
            )}
            
            {enableVoiceMessages && (
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleRecording}
                className={cn(isRecording && "text-red-500")}
              >
                {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </Button>
            )}
            
            <Textarea
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 min-h-[40px] max-h-[120px] resize-none"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
            />
            
            <Button onClick={handleSendMessage} disabled={!messageInput.trim()}>
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Unified Mode - Combined list and thread
  if (mode === 'unified') {
    return (
      <div className={cn("flex h-full", className)} style={{ maxHeight }}>
        {/* Conversation List */}
        <div className="w-80 border-r flex flex-col">
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="font-semibold">Messages</h2>
            <Button variant="ghost" size="sm">
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          
          {showSearch && (
            <div className="p-4 border-b">
              <Input
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          )}
          
          <div className="flex-1 overflow-y-auto">
            {filteredConversations.map((conversation) => (
              <div
                key={conversation.id}
                className={cn(
                  "flex items-center gap-3 p-4 hover:bg-muted/50 cursor-pointer transition-colors",
                  selectedConversation?.id === conversation.id && "bg-muted"
                )}
                onClick={() => setSelectedConversation(conversation)}
              >
                <Avatar className="w-10 h-10">
                  <AvatarImage src={conversation.avatar} />
                  <AvatarFallback>{conversation.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-medium truncate">{conversation.name}</h3>
                    {conversation.unreadCount > 0 && (
                      <Badge variant="secondary" className="text-xs">
                        {conversation.unreadCount}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground truncate">
                    {conversation.lastMessage?.content || 'No messages'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Thread View */}
        <div className="flex-1 flex flex-col">
          {selectedConversation ? (
            <>
              <div className="flex items-center justify-between p-4 border-b">
                <div className="flex items-center gap-3">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={selectedConversation.avatar} />
                    <AvatarFallback>{selectedConversation.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-medium">{selectedConversation.name}</h3>
                    <p className="text-xs text-muted-foreground">
                      {selectedConversation.participants.length} members
                    </p>
                  </div>
                </div>
                <Button variant="ghost" size="sm">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={cn(
                      "flex gap-3 mb-4",
                      message.senderId === currentUser?.id ? "flex-row-reverse" : "flex-row"
                    )}
                  >
                    <Avatar className="w-8 h-8">
                      <AvatarFallback>
                        {message.senderId === currentUser?.id ? 'You' : 'Them'}
                      </AvatarFallback>
                    </Avatar>
                    <div className={cn(
                      "max-w-[70%]",
                      message.senderId === currentUser?.id && "items-end"
                    )}>
                      <div className={cn(
                        "rounded-lg p-3",
                        message.senderId === currentUser?.id 
                          ? "bg-primary text-primary-foreground" 
                          : "bg-muted"
                      )}>
                        <p>{message.content}</p>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {formatTimestamp(message.timestamp)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="border-t p-4">
                <div className="flex gap-2">
                  <Input
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1"
                  />
                  <Button onClick={handleSendMessage}>
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <MessageCircle className="w-12 h-12 mx-auto mb-2" />
                <p>Select a conversation to start messaging</p>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Compact Mode - Minimal chat interface
  if (mode === 'compact') {
    return (
      <div className={cn("space-y-2", className)}>
        {filteredConversations.slice(0, 3).map((conversation) => (
          <div
            key={conversation.id}
            className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
            onClick={() => setSelectedConversation(conversation)}
          >
            <Avatar className="w-8 h-8">
              <AvatarImage src={conversation.avatar} />
              <AvatarFallback>{conversation.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-sm truncate">{conversation.name}</h3>
              <p className="text-xs text-muted-foreground truncate">
                {conversation.lastMessage?.content || 'No messages'}
              </p>
            </div>
            {conversation.unreadCount > 0 && (
              <Badge variant="secondary" className="text-xs">
                {conversation.unreadCount}
              </Badge>
            )}
          </div>
        ))}
      </div>
    );
  }

  return null;
}

export default UnifiedChatProvider;
