// Canonical types barrel — re-exports from canonical + stubs for legacy imports
export * from './canonical'

// Legacy stubs for dead imports
export type VerificationStatus = 'pending' | 'verified' | 'rejected'
export type UserStats = { matches: number; likes: number; views: number }
export type SocialLinks = { instagram?: string; twitter?: string; tiktok?: string }
export type Call = { id: string; caller_id: string; receiver_id: string; status: string }
export type PaymentRequest = { id: string; amount: number; currency: string; status: string }

// P2P types used by HybridP2PDatingEngine and related modules
export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy?: number;
  city?: string;
  country?: string;
  timestamp: number;
  geohash?: string;
}

export interface P2PConfig {
  appId: string;
  password?: string;
  relayUrls?: string[];
  iceServers?: RTCIceServer[];
  strategy?: 'nostr' | 'supabase' | 'torrent' | 'mqtt' | 'firebase';
  // BitTorrent strategy
  trackerUrls?: string[];
  // Nostr strategy
  nostrRelays?: string[];
  nostrPrivateKey?: string;
  // MQTT strategy
  mqttBrokerUrl?: string;
  mqttUsername?: string;
  mqttPassword?: string;
  // IPFS strategy
  ipfsGateways?: string[];
}

export interface P2PMessage {
  id: string;
  from: string;
  to?: string;
  type: string;
  payload: unknown;
  timestamp: number;
  encrypted?: boolean;
}

export interface P2PCall {
  id: string;
  callerId: string;
  receiverId: string;
  status: 'ringing' | 'accepted' | 'rejected' | 'ended' | 'missed';
  type: 'voice' | 'video';
  startedAt: number;
  endedAt?: number;
}

export interface Photo {
  id: string;
  url: string;
  thumbnailUrl?: string;
  caption?: string;
  isPrivate?: boolean;
  createdAt: string;
}
