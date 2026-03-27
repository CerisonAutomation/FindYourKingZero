/**
 * =============================================================================
 * CHAT FEATURE MODULE — Canonical Export Index v15.0
 * =============================================================================
 *
 * Single entry point for ALL chat/messaging functionality.
 * Consolidates: 1:1 Chat, Group Chat, Rooms, Reactions, Typing Indicators
 *
 * Standards: 15/10 Legendary | Zero-Trust | WCAG 3.0 AAA
 *
 * @module features/chat
 * @version 15.0.0
 */

// Pages
export { default as ChatPage } from './pages/ChatPage';
export { default as EventChatPage } from './pages/EventChatPage';
export { default as PartyChatPage } from './pages/PartyChatPage';
export { default as RoomChatPage } from './pages/RoomChatPage';
export { default as MessagesPage } from './pages/MessagesPage';

// Hooks (re-exported from hooks directory)
export { useConversations } from '@/hooks/useConversations';
export { useMessages } from '@/hooks/useMessages';
export { useReactions } from '@/hooks/useReactions';
export { useQuickReply } from '@/hooks/useQuickReply';

// Chat room hooks
export {
  useChatRoom,
  useCreateRoom,
  useJoinRoom,
  useRoomMembers,
  useRoomMessages,
  useSendRoomMessage,
  useRoomReaction,
  useRoomTyping,
  useMessageSearch,
  useDeleteMessage,
  useEditMessage,
  usePinMessage,
  usePinnedMessages,
} from '@/hooks/useChatRooms';

// Components (re-exported from components directory)
export { default as MessagingInterface } from '@/components/MessagingInterface';
export { default as MessageReactions } from '@/components/MessageReactions';