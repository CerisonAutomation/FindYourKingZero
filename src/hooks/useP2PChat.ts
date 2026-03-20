import { useState } from 'react';

export interface P2PMessage {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: number;
  type: 'text' | 'image' | 'audio' | 'video' | 'location' | 'reaction';
}

export interface P2PProfile {
  id: string;
  name: string;
  age: number;
  bio: string;
  photos: string[];
  location: { lat: number; lng: number };
  isOnline: boolean;
  isVerified: boolean;
  membershipTier: 'free' | 'premium' | 'vip';
}

export function useP2PChat(peerId?: string) {
  const [messages, setMessages] = useState<P2PMessage[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async (content: string, type: P2PMessage['type'] = 'text') => {
    const newMessage: P2PMessage = {
      id: Date.now().toString(),
      senderId: 'current-user',
      receiverId: peerId || '',
      content,
      timestamp: Date.now(),
      type
    };

    setMessages(prev => [...prev, newMessage]);
    
    // Simulate sending
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    setIsLoading(false);
  };

  const connect = async (targetPeerId: string) => {
    setIsLoading(true);
    // Simulate connection
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsConnected(true);
    setIsLoading(false);
  };

  const disconnect = () => {
    setIsConnected(false);
    setMessages([]);
  };

  return {
    messages,
    isConnected,
    isTyping,
    isLoading,
    sendMessage,
    connect,
    disconnect
  };
}

export function useP2PChatWithProfile(peerId: string, profile: P2PProfile) {
  const chat = useP2PChat(peerId);
  
  return {
    ...chat,
    profile
  };
}

export function useMultiP2PChat(peerIds: string[]) {
  const [chats, setChats] = useState<Record<string, ReturnType<typeof useP2PChat>>>({});
  
  const connectToAll = async () => {
    for (const peerId of peerIds) {
      // Simulate multi-chat connection
      await new Promise(resolve => setTimeout(resolve, 200));
    }
  };

  return {
    chats,
    connectToAll,
    isMultiConnected: Object.keys(chats).length === peerIds.length
  };
}
