// 📝 Dating Feature Types
export type Profile  = {
  id: string;
  name: string;
  age: number;
  bio: string;
  avatar: string;
  images: string[];
  location: Location;
  interests: string[];
  relationshipGoals: string[];
  verified: boolean;
  online: boolean;
  lastSeen: string;
  isLiked?: boolean;
  compatibilityScore?: number;
  distance?: number;
}

export type Location  = {
  lat: number;
  lng: number;
  city: string;
  country: string;
}

export type FilterState  = {
  ageRange: [number, number];
  distance: number;
  interests: string[];
  relationshipGoals: string[];
  verifiedOnly: boolean;
  onlineOnly: boolean;
  minCompatibility?: number;
}

export type Match  = {
  id: string;
  profile: Profile;
  matchedAt: string;
  lastMessage?: string;
  unreadCount?: number;
}

export type DatingActions  = {
  loadProfiles: (filters?: Partial<FilterState>) => Promise<void>;
  updateFilters: (filters: Partial<FilterState>) => void;
  likeProfile: (profileId: string) => Promise<void>;
  passProfile: (profileId: string) => Promise<void>;
  setCurrentProfile: (profile: Profile | null) => void;
  resetFilters: () => void;
  clearError: () => void;
}

export type DatingStore  = {
  profiles: Profile[];
  matches: Profile[];
  filters: FilterState;
  isLoading: boolean;
  error: string | null;
  currentProfile: Profile | null;
  actions: DatingActions;
}