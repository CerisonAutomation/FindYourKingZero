export interface Profile {
    id: string;
    name: string;
    age: number;
    location: string;
    distance?: number;
    avatar: string;
    photos: string[];
    bio: string;
    height?: string;
    weight?: string;
    tribes: string[];
    lookingFor: string[];
    isOnline: boolean;
    lastSeen?: Date;
    isVerified: boolean;
    isPremium: boolean;
    role: 'seeker' | 'provider';
    hourlyRate?: number;
    rating?: number;
    reviewCount?: number;
}

export interface Message {
    id: string;
    conversationId: string;
    senderId: string;
    content: string;
    type: 'text' | 'image' | 'voice' | 'booking';
    timestamp: Date;
    status: 'sent' | 'delivered' | 'read';
    isEncrypted: boolean;
}

export interface Conversation {
    id: string;
    participantIds: string[];
    participant: Profile;
    lastMessage?: Message;
    unreadCount: number;
    updatedAt: Date;
}

export interface Booking {
    id: string;
    seekerId: string;
    providerId: string;
    provider?: Profile;
    seeker?: Profile;
    date: Date;
    startTime: string;
    endTime: string;
    duration: number;
    location: string;
    status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
    totalAmount: number;
    notes?: string;
    createdAt: Date;
}

export interface UserStats {
    views: number;
    favorites: number;
    matches: number;
    bookingsCompleted: number;
    rating: number;
}

export interface FilterPreferences {
    ageRange: [number, number];
    distanceRadius: number;
    tribes: string[];
    lookingFor: string[];
    showOnlineOnly: boolean;
    showVerifiedOnly: boolean;
}
