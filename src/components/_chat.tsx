/**
 * MeetIntentCTA — Floating "Schedule a Date" button
 *
 * Appears (with spring animation) when the AI detects a "meet now" intent
 * in an incoming message. Tap to open a lightweight date/time planner.
 */

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Calendar, MapPin, Clock, X, Check } from 'lucide-react';

interface MeetIntentCTAProps {
  otherUserName: string;
  visible: boolean;
  onDismiss: () => void;
  onScheduled?: (details: ScheduledDate) => void;
}

export interface ScheduledDate {
  date: string;
  time: string;
  location: string;
  note: string;
}

const TIME_OPTIONS = [
  'Tonight, 8 PM',
  'Tonight, 9 PM',
  'Tomorrow, 7 PM',
  'Tomorrow, 8 PM',
  'This weekend',
  'Next week',
];

const LOCATION_OPTIONS = [
  'Coffee shop nearby ☕',
  'Bar / drinks 🍹',
  'Dinner 🍽️',
  'Park walk 🌿',
  'Your place / mine 🏠',
  'We\'ll figure it out',
];

export function MeetIntentCTA({
  otherUserName,
  visible,
  onDismiss,
  onScheduled,
}: MeetIntentCTAProps) {
  const [expanded, setExpanded] = useState(false);
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [note, setNote] = useState('');
  const [done, setDone] = useState(false);

  const handleConfirm = () => {
    if (!selectedTime || !selectedLocation) return;
    setDone(true);
    onScheduled?.({
      date: new Date().toLocaleDateString(),
      time: selectedTime,
      location: selectedLocation,
      note,
    });
    setTimeout(() => {
      setDone(false);
      setExpanded(false);
      onDismiss();
    }, 1800);
  };

  const handleDismiss = () => {
    setExpanded(false);
    setSelectedTime('');
    setSelectedLocation('');
    setNote('');
    onDismiss();
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="meet-cta"
          initial={{ opacity: 0, y: 20, scale: 0.92 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.92 }}
          transition={{ type: 'spring', stiffness: 420, damping: 26 }}
          className="flex-shrink-0 mx-3 mb-1.5"
        >
          <div
            className="relative rounded-2xl border border-primary/25 overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, hsl(var(--primary)/0.08) 0%, hsl(var(--card)) 100%)',
            }}
          >
            {/* Pulsing accent line */}
            <div className="absolute top-0 inset-x-0 h-0.5 rounded-full"
              style={{ background: 'var(--gradient-primary)' }} />

            {!expanded && !done && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-2.5 px-3.5 py-2.5"
              >
                {/* Pulsing icon */}
                <motion.div
                  animate={{ scale: [1, 1.15, 1] }}
                  transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
                  className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: 'var(--gradient-primary)' }}
                >
                  <Calendar className="w-4 h-4 text-white" />
                </motion.div>

                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-bold text-foreground leading-tight">
                    {otherUserName} wants to meet! 🔥
                  </p>
                  <p className="text-[10px] text-muted-foreground leading-tight">
                    AI detected meet intent — schedule a date?
                  </p>
                </div>

                <div className="flex items-center gap-1.5">
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setExpanded(true)}
                    className="px-2.5 py-1 rounded-lg text-[11px] font-bold text-white shrink-0"
                    style={{ background: 'var(--gradient-primary)' }}
                  >
                    Plan it
                  </motion.button>
                  <button
                    onClick={handleDismiss}
                    className="w-6 h-6 rounded-full flex items-center justify-center bg-secondary/60 shrink-0"
                  >
                    <X className="w-3 h-3 text-muted-foreground" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* Expanded planner */}
            <AnimatePresence>
              {expanded && !done && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="px-3.5 py-3 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-[13px] font-bold flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-primary" />
                      Plan a date with {otherUserName}
                    </p>
                    <button onClick={handleDismiss}>
                      <X className="w-4 h-4 text-muted-foreground" />
                    </button>
                  </div>

                  {/* Time selection */}
                  <div>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide mb-1.5 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> When
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {TIME_OPTIONS.map(t => (
                        <button
                          key={t}
                          onClick={() => setSelectedTime(t)}
                          className={[
                            'px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-all',
                            selectedTime === t
                              ? 'border-primary bg-primary/15 text-primary'
                              : 'border-border/30 bg-secondary/50 text-foreground',
                          ].join(' ')}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Location selection */}
                  <div>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide mb-1.5 flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> Where
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {LOCATION_OPTIONS.map(l => (
                        <button
                          key={l}
                          onClick={() => setSelectedLocation(l)}
                          className={[
                            'px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-all',
                            selectedLocation === l
                              ? 'border-primary bg-primary/15 text-primary'
                              : 'border-border/30 bg-secondary/50 text-foreground',
                          ].join(' ')}
                        >
                          {l}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Optional note */}
                  <input
                    value={note}
                    onChange={e => setNote(e.target.value)}
                    placeholder="Add a note (optional)…"
                    className="w-full bg-secondary/40 border border-border/25 rounded-xl px-3 py-2 text-[12px] placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/40"
                  />

                  <button
                    onClick={handleConfirm}
                    disabled={!selectedTime || !selectedLocation}
                    className="w-full py-2 rounded-xl text-[12px] font-bold text-white disabled:opacity-40 transition-opacity"
                    style={{ background: 'var(--gradient-primary)' }}
                  >
                    Confirm Date 🗓️
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Done state */}
            <AnimatePresence>
              {done && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center justify-center gap-2 py-3 px-4"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 22 }}
                    className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center"
                  >
                    <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
                  </motion.div>
                  <p className="text-[12px] font-bold text-green-500">Date planned! 🎉</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
import {useState} from 'react';
import {AnimatePresence, motion} from 'framer-motion';
import * as LucideIcons from 'lucide-react';
import {QUICK_REPLIES, QUICK_REPLY_CATEGORIES} from '@/lib/quickReplies';
import {cn} from '@/lib/utils';

const {ChevronDown, ChevronUp} = LucideIcons;

function DynamicIcon({name, className}: {name: string; className?: string}) {
    const Icon = (LucideIcons as any)[name];
    return Icon ? <Icon className={className} strokeWidth={2}/> : null;
}

interface QuickReplyBarProps {
    onSend: (message: string) => void;
    disabled?: boolean;
}

export function QuickReplyBar({onSend, disabled}: QuickReplyBarProps) {
    const [selectedCategory, setSelectedCategory] = useState<string>('icebreakers');
    const [expanded, setExpanded] = useState(false);

    const filteredReplies = QUICK_REPLIES.filter(
        (r) => r.category === selectedCategory
    );

    return (
        <div className="border-t border-border/30">
            {/* Toggle */}
            <button
                onClick={() => setExpanded(!expanded)}
                className="w-full flex items-center justify-center gap-1.5 py-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
                {expanded ? <ChevronDown className="w-3.5 h-3.5"/> : <ChevronUp className="w-3.5 h-3.5"/>}
                Quick Replies
            </button>

            <AnimatePresence>
                {expanded && (
                    <motion.div
                        initial={{height: 0, opacity: 0}}
                        animate={{height: 'auto', opacity: 1}}
                        exit={{height: 0, opacity: 0}}
                        transition={{duration: 0.2}}
                        className="overflow-hidden"
                    >
                        {/* Category Tabs */}
                        <div className="flex gap-1.5 px-3 pb-2 overflow-x-auto scrollbar-hide">
                            {QUICK_REPLY_CATEGORIES.map((cat) => (
                                <button
                                    key={cat.id}
                                    onClick={() => setSelectedCategory(cat.id)}
                                    className={cn(
                                        'px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors',
                                        selectedCategory === cat.id
                                            ? 'bg-primary text-primary-foreground'
                                            : 'bg-secondary text-muted-foreground hover:text-foreground'
                                    )}
                                >
                                    <DynamicIcon name={cat.icon} className="w-3.5 h-3.5 inline mr-1" /> {cat.label}
                                </button>
                            ))}
                        </div>

                        {/* Reply Chips */}
                        <div className="flex gap-2 px-3 pb-3 overflow-x-auto scrollbar-hide">
                            {filteredReplies.map((reply) => (
                                <motion.button
                                    key={reply.id}
                                    whileTap={{scale: 0.95}}
                                    onClick={() => {
                                        onSend(reply.text);
                                        setExpanded(false);
                                    }}
                                    disabled={disabled}
                                    className="px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap bg-secondary/80 border border-border/50 text-foreground hover:bg-primary/10 hover:border-primary/30 transition-colors disabled:opacity-50"
                                >
                                    <DynamicIcon name={reply.icon} className="w-3.5 h-3.5 inline mr-1" /> {reply.text}
                                </motion.button>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
/**
 * SafetyShield — Pre-send content safety indicator
 *
 * Sits above the input area and shows a contextual warning when
 * the typed message is flagged. Offers a one-tap "Soften" rewrite.
 */

import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, XCircle, Sparkles } from 'lucide-react';
import type { SafetyResult } from '@/lib/ai/ChatAI';

interface SafetyShieldProps {
  result: SafetyResult | null;
  onApplySoftened: (text: string) => void;
}

export function SafetyShield({ result, onApplySoftened }: SafetyShieldProps) {
  const visible = result !== null && result.category !== 'ok';

  const isBlock = result?.category === 'block';
  const color = isBlock ? 'text-red-400' : 'text-amber-400';
  const bg = isBlock ? 'bg-red-500/10 border-red-500/20' : 'bg-amber-500/10 border-amber-500/20';
  const Icon = isBlock ? XCircle : AlertTriangle;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="safety-shield"
          initial={{ opacity: 0, height: 0, y: 4 }}
          animate={{ opacity: 1, height: 'auto', y: 0 }}
          exit={{ opacity: 0, height: 0, y: 4 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className={`mx-3 mb-1.5 px-3 py-2 rounded-xl border flex items-center gap-2.5 ${bg}`}
        >
          <Icon className={`w-3.5 h-3.5 shrink-0 ${color}`} />
          <p className={`text-[11px] font-semibold flex-1 leading-tight ${color}`}>
            {result?.reason}
          </p>
          {!isBlock && result?.softened && (
            <motion.button
              whileTap={{ scale: 0.92 }}
              onClick={() => onApplySoftened(result.softened!)}
              className="flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-500/15 border border-amber-500/25 shrink-0"
            >
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span className="text-[10px] font-bold text-amber-400">Soften</span>
            </motion.button>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
/**
 * 💬 UNIFIED CHAT PROVIDER COMPONENT
 * Consolidates MessagingInterface, UnifiedChatWindow, ChatThread into single component
 * Supports multiple chat modes and conversation types for maximum flexibility
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import {
  MessageCircle,
  Send,
  Paperclip,
  Smile,
  Phone,
  Video,
  MoreVertical,
  Search,
  Users,
  Settings,
  Archive,
  Trash2,
  Check,
  CheckCheck,
  Clock,
  User,
  Heart,
  Star,
  Shield,
  Activity,
  RefreshCw,
  Plus,
  X,
  ChevronLeft,
  ChevronRight,
  Mic,
  MicOff,
  Volume2,
  VolumeX
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
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Check,
  CheckCheck,
  ChevronLeft,
  Globe,
  ImagePlus,
  Lock,
  Mic,
  MoreVertical,
  Phone,
  CornerUpLeft,
  Send,
  Smile,
  Video,
  Zap,
  Calendar,
  Crown,
  BadgeCheck,
  X,
  Paperclip,
  ShieldCheck,
} from 'lucide-react';
import { Conversation, Message, useMessages, useSendMessage } from '@/hooks/useMessages';
import { useConversationPresence } from '@/hooks/usePresence';
import { REACTION_EMOJIS, useReactions } from '@/hooks/useReactions';
import { useAuth } from '@/hooks/useAuth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { chatAI, type QuickReply, type SafetyResult } from '@/lib/ai/ChatAI';
import { MeetIntentCTA } from './MeetIntentCTA';
import { SafetyShield } from './SafetyShield';
import { QuickReplyBar } from './QuickReplyBar';

// ─────────────────────────────────────────────────────────────
// Config
// ─────────────────────────────────────────────────────────────

interface ChatWindowConfig {
  enableAIReactions?: boolean;
  enableQuickReplies?: boolean;
  enableEmojiPicker?: boolean;
  enableFileUpload?: boolean;
  enableVoiceMessages?: boolean;
  enableVideoCall?: boolean;
  enableEncryptionNotice?: boolean;
  enableMeetIntent?: boolean;
  enableSafetyShield?: boolean;
  enableGhostText?: boolean;
  enableTranslation?: boolean;
  maxMessageLength?: number;
  typingTimeout?: number;
}

interface UnifiedChatWindowProps {
  conversation: Conversation;
  onBack: () => void;
  onViewProfile: (profileId: string) => void;
  config?: Partial<ChatWindowConfig>;
  mockMode?: boolean;
}

const DEFAULT_CONFIG: Required<ChatWindowConfig> = {
  enableAIReactions: true,
  enableQuickReplies: true,
  enableEmojiPicker: true,
  enableFileUpload: true,
  enableVoiceMessages: true,
  enableVideoCall: true,
  enableEncryptionNotice: true,
  enableMeetIntent: true,
  enableSafetyShield: true,
  enableGhostText: true,
  enableTranslation: true,
  maxMessageLength: 1000,
  typingTimeout: 2000,
};

// ─────────────────────────────────────────────────────────────
// Translation cache (avoids re-loading model per message)
// ─────────────────────────────────────────────────────────────

const translationCache = new Map<string, string>();

// ─────────────────────────────────────────────────────────────
// Reaction Picker
// ─────────────────────────────────────────────────────────────

function ReactionPicker({ messageId, onClose }: { messageId: string; onClose: () => void }) {
  const { toggleReaction, hasUserReacted } = useReactions(messageId);
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85, y: 6 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.85, y: 6 }}
      transition={{ type: 'spring', stiffness: 500, damping: 32 }}
      className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 flex gap-1 px-2.5 py-2 rounded-full z-30 border border-border/20"
      style={{ background: 'hsl(var(--card))', boxShadow: '0 8px 32px hsl(0 0% 0%/0.5)' }}
      onClick={e => e.stopPropagation()}
    >
      {REACTION_EMOJIS.slice(0, 8).map(emoji => (
        <motion.button
          key={emoji}
          whileTap={{ scale: 1.35 }}
          onClick={() => { toggleReaction(emoji); onClose(); }}
          className={cn(
            'text-[18px] leading-none w-8 h-8 flex items-center justify-center rounded-full transition-all',
            hasUserReacted(emoji) ? 'bg-primary/20' : 'hover:bg-secondary/60',
          )}
        >
          {emoji}
        </motion.button>
      ))}
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────
// Message Reactions Row
// ─────────────────────────────────────────────────────────────

function MessageReactionsRow({ messageId }: { messageId: string }) {
  const { reactions, toggleReaction, hasUserReacted } = useReactions(messageId);
  const grouped = useMemo(() => {
    const map = new Map<string, number>();
    reactions.forEach(r => map.set(r.emoji, (map.get(r.emoji) || 0) + 1));
    return [...map.entries()];
  }, [reactions]);
  if (!grouped.length) return null;
  return (
    <div className="flex flex-wrap gap-1 mt-1">
      {grouped.map(([emoji, count]) => (
        <button
          key={emoji}
          onClick={() => toggleReaction(emoji)}
          className={cn(
            'flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[11px] font-bold border transition-all',
            hasUserReacted(emoji)
              ? 'border-primary/50 bg-primary/15 text-primary'
              : 'border-border/30 bg-secondary/50 text-foreground',
          )}
        >
          <span>{emoji}</span>
          {count > 1 && <span className="text-[9px]">{count}</span>}
        </button>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Message Status
// ─────────────────────────────────────────────────────────────

function MessageStatus({ message, isOwn }: { message: Message; isOwn: boolean }) {
  if (!isOwn) return null;
  const isRead = message.is_read || (message as any).status === 'read';
  const isDelivered = (message as any).status === 'delivered' || (message as any).status === 'sent';
  if (isRead) return <CheckCheck className="w-3 h-3 text-primary shrink-0" />;
  if (isDelivered) return <Check className="w-3 h-3 text-muted-foreground/50 shrink-0" />;
  return null;
}

// ─────────────────────────────────────────────────────────────
// Sentiment dot (colour-codes message positivity)
// ─────────────────────────────────────────────────────────────

const SENTIMENT_COLOUR: Record<string, string> = {
  positive: 'bg-green-500/60',
  neutral: 'bg-muted-foreground/30',
  negative: 'bg-red-500/60',
};

// ─────────────────────────────────────────────────────────────
// Message Bubble
// ─────────────────────────────────────────────────────────────

function MessageBubble({
  message,
  isOwn,
  showAvatar,
  avatarUrl,
  displayName,
  config,
  onReply,
  enableTranslation,
}: {
  message: Message;
  isOwn: boolean;
  showAvatar: boolean;
  avatarUrl: string;
  displayName: string;
  config: Required<ChatWindowConfig>;
  onReply: (message: Message) => void;
  enableTranslation: boolean;
}) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [translating, setTranslating] = useState(false);
  const [translatedText, setTranslatedText] = useState<string | null>(null);
  const longPressRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const sentiment = useMemo(() =>
    chatAI.getMessageSentiment(message.content), [message.content]);

  const formatTime = useCallback((date: string | Date) => {
    try {
      const d = typeof date === 'string' ? new Date(date) : date;
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch { return ''; }
  }, []);

  const handleTranslate = useCallback(async () => {
    if (translatedText) { setTranslatedText(null); return; }
    const cached = translationCache.get(message.content);
    if (cached) { setTranslatedText(cached); return; }
    setTranslating(true);
    try {
      // Lazy-load transformers.js pipeline — only loads once, cached in IndexedDB
      const result = await chatAI.translateMessage(message.content);
      translationCache.set(message.content, result);
      setTranslatedText(result);
    } catch {
      /* fail silently */
    } finally {
      setTranslating(false);
    }
  }, [message.content, translatedText]);

  const displayContent = translatedText ?? message.content;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.92 }}
      transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
      className={cn('flex items-end gap-2 group', isOwn && 'flex-row-reverse')}
    >
      {/* Avatar */}
      <div className="w-7 shrink-0">
        {!isOwn && showAvatar && (
          <Avatar className="w-7 h-7">
            <AvatarImage src={avatarUrl} />
            <AvatarFallback className="text-[10px] font-bold bg-secondary">
              {displayName[0]}
            </AvatarFallback>
          </Avatar>
        )}
      </div>

      <div className={cn('flex flex-col max-w-[75%]', isOwn && 'items-end')}>
        {/* Swipe-to-reply action (appears on group hover) */}
        <div className={cn(
          'flex items-center gap-1.5 mb-0.5 opacity-0 group-hover:opacity-100 transition-opacity',
          isOwn ? 'flex-row-reverse' : 'flex-row',
        )}>
          <button
            onClick={() => onReply(message)}
            className="w-6 h-6 rounded-full bg-secondary/70 flex items-center justify-center active:scale-90 transition-all"
            title="Reply"
          >
            <CornerUpLeft className="w-3 h-3 text-muted-foreground" />
          </button>
          {enableTranslation && (
            <button
              onClick={handleTranslate}
              className={cn(
                'w-6 h-6 rounded-full flex items-center justify-center active:scale-90 transition-all',
                translatedText
                  ? 'bg-primary/20 text-primary'
                  : 'bg-secondary/70 text-muted-foreground',
              )}
              title={translatedText ? 'Show original' : 'Translate'}
              disabled={translating}
            >
              <Globe className={cn('w-3 h-3', translating && 'animate-spin')} />
            </button>
          )}
        </div>

        <div className="relative">
          {/* Reaction picker */}
          <AnimatePresence>
            {config.enableAIReactions && pickerOpen && (
              <ReactionPicker messageId={message.id} onClose={() => setPickerOpen(false)} />
            )}
          </AnimatePresence>

          {/* Bubble */}
          <motion.div
            whileTap={{ scale: 0.97 }}
            onPointerDown={() => {
              if (config.enableAIReactions) {
                longPressRef.current = setTimeout(() => setPickerOpen(true), 450);
              }
            }}
            onPointerUp={() => { if (longPressRef.current) clearTimeout(longPressRef.current); }}
            onPointerLeave={() => { if (longPressRef.current) clearTimeout(longPressRef.current); }}
            className={cn(
              'px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed cursor-pointer select-none',
              isOwn
                ? 'rounded-br-md text-white'
                : 'rounded-bl-md border border-border/20',
            )}
            style={isOwn
              ? { background: 'var(--gradient-primary)' }
              : { background: 'hsl(var(--card))' }
            }
          >
            {/* Translated badge */}
            {translatedText && (
              <p className="text-[9px] font-bold opacity-60 mb-0.5 uppercase tracking-wide">
                Translated · tap 🌐 to revert
              </p>
            )}
            <p style={{ whiteSpace: 'pre-wrap' }}>{displayContent}</p>
            <div className={cn('flex items-center gap-1 mt-1', isOwn ? 'justify-end' : 'justify-start')}>
              {/* Sentiment dot for inbound only */}
              {!isOwn && (
                <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', SENTIMENT_COLOUR[sentiment])} />
              )}
              <span className={cn('text-[10px]', isOwn ? 'text-white/55' : 'text-muted-foreground/60')}>
                {formatTime(message.created_at)}
              </span>
              <MessageStatus message={message} isOwn={isOwn} />
            </div>
          </motion.div>
        </div>

        <MessageReactionsRow messageId={message.id} />
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────
// Reply Preview Banner
// ─────────────────────────────────────────────────────────────

function ReplyPreview({ message, onClear }: { message: Message; onClear: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="mx-3 mb-1 px-3 py-2 rounded-xl border-l-2 border-primary bg-primary/5 flex items-center justify-between gap-2"
    >
      <div className="min-w-0">
        <p className="text-[10px] font-bold text-primary mb-0.5">Replying to</p>
        <p className="text-[11px] text-muted-foreground truncate">{message.content}</p>
      </div>
      <button onClick={onClear} className="shrink-0">
        <X className="w-3.5 h-3.5 text-muted-foreground" />
      </button>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────
// Typing Indicator
// ─────────────────────────────────────────────────────────────

function TypingIndicator({ avatarUrl, name }: { avatarUrl: string; name: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      className="flex items-end gap-2"
    >
      <Avatar className="w-7 h-7">
        <AvatarImage src={avatarUrl} />
        <AvatarFallback className="text-[10px] font-bold bg-secondary">{name[0]}</AvatarFallback>
      </Avatar>
      <div
        className="px-3.5 py-3 rounded-2xl rounded-bl-md border border-border/20"
        style={{ background: 'hsl(var(--card))' }}
      >
        <div className="flex gap-1 items-center">
          {[0, 1, 2].map(i => (
            <motion.div
              key={i}
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: 'hsl(var(--muted-foreground)/0.55)' }}
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 0.55, repeat: Infinity, delay: i * 0.14 }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────
// Ghost Text Hint Chip
// ─────────────────────────────────────────────────────────────

function GhostHint({ hint, onAccept }: { hint: string; onAccept: () => void }) {
  return (
    <motion.div
      key={hint}
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      className="flex items-center gap-1.5 px-3 pt-1"
    >
      <span className="text-[11px] text-muted-foreground/50 italic truncate flex-1">{hint}</span>
      <button
        onClick={onAccept}
        className="text-[10px] font-bold text-primary/60 border border-primary/20 rounded px-1.5 py-0.5 shrink-0 hover:bg-primary/10 transition-all"
      >
        Tab ↹
      </button>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────

export function UnifiedChatWindow({
  conversation,
  onBack,
  onViewProfile,
  config = {},
  mockMode = false,
}: UnifiedChatWindowProps) {
  const finalConfig = useMemo(() => ({ ...DEFAULT_CONFIG, ...config }), [config]);
  const { user } = useAuth();

  // ── State ─────────────────────────────────────────────────
  const [draft, setDraft] = useState('');
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [replyTo, setReplyTo] = useState<Message | null>(null);

  // AI quick replies (local — no network)
  const [aiReplies, setAiReplies] = useState<QuickReply[]>([]);

  // Meet intent CTA
  const [meetIntentVisible, setMeetIntentVisible] = useState(false);
  const [meetIntentChecked, setMeetIntentChecked] = useState(''); // last checked msg id

  // Safety shield
  const [safetyResult, setSafetyResult] = useState<SafetyResult | null>(null);
  const safetyDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Ghost text
  const [ghostCompletion, setGhostCompletion] = useState<string | null>(null);

  // File upload
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Data ─────────────────────────────────────────────────
  const mockMessages = useMemo<Message[]>(() => {
    if (!mockMode) return [];
    return [
      {
        id: '1', conversation_id: conversation.id, sender_id: 'other',
        content: 'Hey! Want to meet up tonight? I\'m free from 8pm 🔥',
        message_type: 'text', media_url: null, is_read: true, read_at: null,
        created_at: new Date(Date.now() - 3600000).toISOString(),
      },
      {
        id: '2', conversation_id: conversation.id, sender_id: 'current-user',
        content: 'Sounds amazing! Where were you thinking?',
        message_type: 'text', media_url: null, is_read: true, read_at: null,
        created_at: new Date(Date.now() - 3500000).toISOString(),
      },
    ];
  }, [mockMode, conversation.id]);

  const { messages: liveMessages, isLoading } = mockMode
    ? { messages: mockMessages, isLoading: false }
    // eslint-disable-next-line react-hooks/rules-of-hooks
    : useMessages(conversation.id);

  const messages = mockMode ? mockMessages : liveMessages;
  const sendMessage = useSendMessage();
  const { setTyping, isUserTyping } = useConversationPresence(conversation.id);

  const otherUserId = conversation.participant_one === user?.id
    ? conversation.participant_two
    : conversation.participant_one;

  const isOtherTyping = isUserTyping(otherUserId);
  const otherUser = conversation.other_user;
  const displayName = otherUser?.display_name || (conversation as any).participant?.name || 'User';
  const avatarUrl = otherUser?.avatar_url || (conversation as any).participant?.avatar || '';

  // ── Scroll ────────────────────────────────────────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOtherTyping]);

  // ── Typing indicator ──────────────────────────────────────
  useEffect(() => {
    let t: ReturnType<typeof setTimeout>;
    if (draft) {
      setTyping(true);
      t = setTimeout(() => setTyping(false), finalConfig.typingTimeout);
    } else {
      setTyping(false);
    }
    return () => clearTimeout(t);
  }, [draft, setTyping, finalConfig.typingTimeout]);

  // ── ChatAI: smart quick replies (instant, local) ──────────
  useEffect(() => {
    if (!finalConfig.enableQuickReplies || messages.length === 0) return;
    const context = messages.slice(-6).map(m => ({
      content: m.content,
      isOwn: m.sender_id === user?.id,
    }));
    const replies = chatAI.getContextualQuickReplies(context, 3);
    setAiReplies(replies);
  }, [messages, user?.id, finalConfig.enableQuickReplies]);

  // ── ChatAI: meet intent detection ─────────────────────────
  useEffect(() => {
    if (!finalConfig.enableMeetIntent) return;
    const lastInbound = [...messages].reverse().find(m => m.sender_id !== user?.id);
    if (!lastInbound || lastInbound.id === meetIntentChecked) return;
    setMeetIntentChecked(lastInbound.id);
    if (chatAI.isMeetNowIntent(lastInbound.content)) {
      setMeetIntentVisible(true);
    }
  }, [messages, user?.id, finalConfig.enableMeetIntent, meetIntentChecked]);

  // ── ChatAI: safety shield (debounced 280ms) ───────────────
  useEffect(() => {
    if (!finalConfig.enableSafetyShield) return;
    if (safetyDebounceRef.current) clearTimeout(safetyDebounceRef.current);
    if (!draft.trim()) { setSafetyResult(null); return; }
    safetyDebounceRef.current = setTimeout(() => {
      const result = chatAI.checkSafety(draft);
      setSafetyResult(result.category === 'ok' ? null : result);
    }, 280);
    return () => { if (safetyDebounceRef.current) clearTimeout(safetyDebounceRef.current); };
  }, [draft, finalConfig.enableSafetyShield]);

  // ── ChatAI: ghost text autocomplete ───────────────────────
  useEffect(() => {
    if (!finalConfig.enableGhostText || !draft) {
      setGhostCompletion(null);
      return;
    }
    const hint = chatAI.getCompletionHint(draft);
    setGhostCompletion(hint ? hint.completion : null);
  }, [draft, finalConfig.enableGhostText]);

  // ── Resize textarea ───────────────────────────────────────
  const resizeTextarea = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  }, []);

  // ── Send ──────────────────────────────────────────────────
  const handleSend = useCallback((text?: string) => {
    const content = (text ?? draft).trim();
    if (!content || content.length > finalConfig.maxMessageLength) return;
    // Block if safety check is blocking
    if (safetyResult?.category === 'block') return;

    setDraft('');
    setEmojiOpen(false);
    setReplyTo(null);
    setSafetyResult(null);
    setGhostCompletion(null);
    if (textareaRef.current) textareaRef.current.style.height = 'auto';

    if (!mockMode) {
      sendMessage.mutate({ conversationId: conversation.id, content });
    }
  }, [draft, sendMessage, conversation.id, finalConfig.maxMessageLength, mockMode, safetyResult]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Tab to accept ghost text
    if (e.key === 'Tab' && ghostCompletion) {
      e.preventDefault();
      setDraft(d => d + ghostCompletion);
      setGhostCompletion(null);
      return;
    }
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // ── Emoji rows ────────────────────────────────────────────
  const EMOJI_ROWS = [
    ['😊', '😂', '🥰', '😍', '🤩', '😎', '😏', '🤭'],
    ['❤️', '🔥', '👑', '💋', '💦', '😈', '🌹', '✨'],
    ['👍', '👋', '🫶', '🙌', '💪', '🍆', '🍑', '💯'],
  ];

  // ── Char count colour ─────────────────────────────────────
  const charRatio = draft.length / finalConfig.maxMessageLength;
  const charColour = charRatio > 0.9 ? 'text-red-400' : charRatio > 0.7 ? 'text-amber-400' : 'text-muted-foreground/40';

  // ── Whether send should be blocked ────────────────────────
  const isSendBlocked = safetyResult?.category === 'block';

  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 26, stiffness: 220 }}
      className="fixed inset-0 z-50 flex flex-col bg-background"
    >
      {/* ── Header ── */}
      <header
        className="flex-shrink-0 flex items-center gap-2 px-3 py-2.5 border-b border-border/20"
        style={{ background: 'hsl(var(--card)/0.9)', backdropFilter: 'blur(20px)' }}
      >
        <button
          onClick={onBack}
          className="w-9 h-9 rounded-full flex items-center justify-center active:scale-90 transition-all bg-secondary/60"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <button
          onClick={() => onViewProfile(otherUserId)}
          className="flex items-center gap-2.5 flex-1 min-w-0"
        >
          <div className="relative shrink-0">
            <Avatar className="w-9 h-9 border border-border/30">
              <AvatarImage src={avatarUrl} />
              <AvatarFallback className="text-[11px] font-black bg-secondary">{displayName[0]}</AvatarFallback>
            </Avatar>
            {(otherUser?.is_online || (conversation as any).participant?.isOnline) && (
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-background bg-status-online">
                <span className="absolute inset-0 rounded-full bg-status-online animate-ping opacity-70" />
              </span>
            )}
          </div>
          <div className="text-left min-w-0">
            <p className="font-bold text-[13px] truncate leading-tight flex items-center gap-1.5">
              {displayName}
              {(otherUser as any)?.is_verified && <BadgeCheck className="w-3.5 h-3.5 text-primary" />}
              {(otherUser as any)?.is_premium && <Crown className="w-3.5 h-3.5 text-gold" />}
            </p>
            <p className="text-[10px] text-muted-foreground leading-tight">
              {isOtherTyping ? (
                <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-primary font-semibold">
                  typing…
                </motion.span>
              ) : otherUser?.is_online ? (
                <span className="text-status-online font-semibold">Online</span>
              ) : (
                'Offline'
              )}
            </p>
          </div>
        </button>

        <div className="flex items-center gap-0.5">
          {finalConfig.enableVideoCall && (
            <button className="w-9 h-9 rounded-full flex items-center justify-center active:scale-90 transition-all hover:bg-secondary/60">
              <Phone className="w-4 h-4 text-muted-foreground" />
            </button>
          )}
          {finalConfig.enableVideoCall && (
            <button className="w-9 h-9 rounded-full flex items-center justify-center active:scale-90 transition-all hover:bg-secondary/60">
              <Video className="w-4 h-4 text-muted-foreground" />
            </button>
          )}
          <button className="w-9 h-9 rounded-full flex items-center justify-center active:scale-90 transition-all hover:bg-secondary/60">
            <MoreVertical className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
      </header>

      {/* ── Messages ── */}
      <div className="flex-1 overflow-y-auto scrollbar-hide px-3 py-3 space-y-1.5 min-h-0">
        {finalConfig.enableEncryptionNotice && (
          <div className="flex items-center justify-center gap-1.5 mb-3">
            <Lock className="w-3 h-3 text-muted-foreground/50" />
            <span className="text-[10px] text-muted-foreground/50 font-medium">End-to-end encrypted</span>
            <ShieldCheck className="w-3 h-3 text-muted-foreground/50" />
          </div>
        )}

        {isLoading ? (
          <div className="space-y-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className={cn('flex items-end gap-2', i % 2 === 0 ? '' : 'flex-row-reverse')}>
                <Skeleton className="w-7 h-7 rounded-full shrink-0" />
                <Skeleton className={cn('h-10 rounded-2xl', i % 2 === 0 ? 'w-52' : 'w-40')} />
              </div>
            ))}
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-center px-8">
            <div className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center">
              <span className="text-2xl">👋</span>
            </div>
            <p className="font-bold text-[15px]">Say hello!</p>
            <p className="text-[13px] text-muted-foreground">You matched — break the ice.</p>
            {/* Seed with AI icebreaker chips */}
            <div className="flex flex-wrap gap-2 justify-center mt-2">
              {[
                "Hey! Your profile caught my eye 😊",
                "What are you up to today? 👀",
                "Love your vibe ✨",
              ].map(text => (
                <button
                  key={text}
                  onClick={() => handleSend(text)}
                  className="px-3 py-1.5 rounded-full text-[11px] font-semibold border border-primary/30 bg-primary/8 text-primary whitespace-nowrap active:scale-95 transition-all"
                >
                  {text}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {messages.map((message, i) => {
              const isOwn = message.sender_id === user?.id;
              const showAvatar = !isOwn && (i === 0 || messages[i - 1]?.sender_id !== message.sender_id);
              return (
                <MessageBubble
                  key={message.id}
                  message={message}
                  isOwn={isOwn}
                  showAvatar={showAvatar}
                  avatarUrl={avatarUrl}
                  displayName={displayName}
                  config={finalConfig}
                  onReply={setReplyTo}
                  enableTranslation={finalConfig.enableTranslation}
                />
              );
            })}
          </AnimatePresence>
        )}

        <AnimatePresence>
          {isOtherTyping && <TypingIndicator avatarUrl={avatarUrl} name={displayName} />}
        </AnimatePresence>

        <div ref={messagesEndRef} className="h-1" />
      </div>

      {/* ── Meet Intent CTA ── */}
      <MeetIntentCTA
        otherUserName={displayName}
        visible={meetIntentVisible}
        onDismiss={() => setMeetIntentVisible(false)}
        onScheduled={(details) => {
          // Send the plan as a message
          handleSend(`📅 Date planned! ${details.time} — ${details.location}${details.note ? ` · ${details.note}` : ''}`);
        }}
      />

      {/* ── AI Quick Replies (local ChatAI — instant) ── */}
      <AnimatePresence>
        {finalConfig.enableQuickReplies && aiReplies.length > 0 && !draft && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            className="flex-shrink-0 px-3 py-1.5 border-t border-border/15 overflow-x-auto scrollbar-hide"
          >
            <div className="flex gap-1.5 items-center">
              <Zap className="w-3 h-3 text-primary shrink-0" strokeWidth={3} />
              {aiReplies.map((reply, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(reply.text)}
                  className="px-2.5 py-1 rounded-full text-[11px] font-semibold border border-border/30 bg-secondary/50 text-foreground whitespace-nowrap hover:border-primary/40 active:scale-95 transition-all shrink-0"
                >
                  {reply.text}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Static Quick Reply Bar ── */}
      {finalConfig.enableQuickReplies && !draft && (
        <QuickReplyBar onSend={handleSend} disabled={sendMessage.isPending || isSendBlocked} />
      )}

      {/* ── Safety Shield ── */}
      <SafetyShield
        result={safetyResult}
        onApplySoftened={(softened) => {
          setDraft(softened);
          setSafetyResult(null);
          resizeTextarea();
        }}
      />

      {/* ── Reply Preview ── */}
      <AnimatePresence>
        {replyTo && <ReplyPreview message={replyTo} onClear={() => setReplyTo(null)} />}
      </AnimatePresence>

      {/* ── Ghost Text Hint ── */}
      <AnimatePresence>
        {finalConfig.enableGhostText && ghostCompletion && (
          <GhostHint
            hint={draft + ghostCompletion}
            onAccept={() => {
              setDraft(d => d + ghostCompletion);
              setGhostCompletion(null);
              textareaRef.current?.focus();
            }}
          />
        )}
      </AnimatePresence>

      {/* ── Emoji Picker ── */}
      <AnimatePresence>
        {finalConfig.enableEmojiPicker && emojiOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="flex-shrink-0 overflow-hidden border-t border-border/20 px-3 py-2"
            style={{ background: 'hsl(var(--card))' }}
          >
            {EMOJI_ROWS.map((row, ri) => (
              <div key={ri} className="flex gap-1 mb-1">
                {row.map(emoji => (
                  <button
                    key={emoji}
                    onClick={() => setDraft(d => d + emoji)}
                    className="w-8 h-8 flex items-center justify-center text-xl rounded-lg hover:bg-secondary/60 active:scale-90 transition-all"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Input Area ── */}
      <div
        className="flex-shrink-0 px-3 pt-2 pb-2 border-t border-border/15"
        style={{
          paddingBottom: 'max(env(safe-area-inset-bottom), 10px)',
          background: 'hsl(var(--background)/0.97)',
          backdropFilter: 'blur(24px)',
        }}
      >
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*,.pdf,.doc,.docx"
          className="hidden"
          disabled={!finalConfig.enableFileUpload || mockMode}
          onChange={async (e) => {
            const file = e.target.files?.[0];
            if (!file || !user || mockMode) return;
            try {
              const ext = file.name.split('.').pop();
              const path = `chat/${user.id}/${Date.now()}.${ext}`;
              const { error } = await supabase.storage.from('chat-media').upload(path, file);
              if (!error) {
                const { data: urlData } = supabase.storage.from('chat-media').getPublicUrl(path);
                handleSend(urlData.publicUrl);
              }
            } catch {
              /* fail silently */
            }
            e.target.value = '';
          }}
        />

        <div className="flex items-end gap-1.5">
          {/* Media / file button */}
          {finalConfig.enableFileUpload && (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 bg-secondary/60 border border-border/25 active:scale-90 transition-all"
              title="Attach file"
            >
              <Paperclip className="w-4 h-4 text-muted-foreground" />
            </button>
          )}

          {/* Emoji toggle */}
          {finalConfig.enableEmojiPicker && (
            <button
              onClick={() => setEmojiOpen(v => !v)}
              className={cn(
                'w-9 h-9 rounded-full flex items-center justify-center shrink-0 border transition-all active:scale-90',
                emojiOpen
                  ? 'bg-primary/15 border-primary/40 text-primary'
                  : 'bg-secondary/60 border-border/25 text-muted-foreground',
              )}
            >
              <Smile className="w-4 h-4" />
            </button>
          )}

          {/* Textarea */}
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              rows={1}
              placeholder="Message…"
              value={draft}
              onChange={e => {
                const value = e.target.value;
                if (value.length <= finalConfig.maxMessageLength) {
                  setDraft(value);
                  resizeTextarea();
                }
              }}
              onKeyDown={handleKeyDown}
              className={cn(
                'w-full resize-none border rounded-2xl px-3.5 py-2.5 text-[13px] text-foreground placeholder:text-muted-foreground/40 focus:outline-none leading-snug min-h-[40px] max-h-[120px] transition-colors bg-secondary/40',
                isSendBlocked
                  ? 'border-red-500/40 focus:border-red-500/60'
                  : 'border-border/25 focus:border-primary/40',
              )}
            />
            {/* Char counter (only visible when > 70%) */}
            {charRatio > 0.7 && (
              <span className={cn('absolute bottom-2 right-2.5 text-[9px] font-mono pointer-events-none', charColour)}>
                {draft.length}/{finalConfig.maxMessageLength}
              </span>
            )}
          </div>

          {/* Send / Mic */}
          <AnimatePresence mode="wait">
            {draft.trim() ? (
              <motion.button
                key="send"
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.6, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 600, damping: 30 }}
                whileTap={{ scale: 0.88 }}
                onClick={() => handleSend()}
                disabled={sendMessage.isPending || isSendBlocked}
                title={isSendBlocked ? 'Message blocked — see warning above' : 'Send'}
                className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 disabled:opacity-40 transition-opacity"
                style={{ background: isSendBlocked ? 'hsl(var(--muted))' : 'var(--gradient-primary)', boxShadow: isSendBlocked ? 'none' : '0 4px 16px hsl(var(--primary)/0.45)' }}
              >
                <Send className="w-4 h-4 text-white" strokeWidth={2.5} />
              </motion.button>
            ) : (
              <motion.button
                key="mic"
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.6, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 600, damping: 30 }}
                whileTap={{ scale: 0.88 }}
                disabled={!finalConfig.enableVoiceMessages}
                className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 bg-secondary/60 border border-border/25"
              >
                <Mic className="w-4 h-4 text-muted-foreground" />
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}

export default UnifiedChatWindow;
