// 📝 Dating Feature Types
export interface Profile {
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

export interface Location {
  lat: number;
  lng: number;
  city: string;
  country: string;
}

export interface FilterState {
  ageRange: [number, number];
  distance: number;
  interests: string[];
  relationshipGoals: string[];
  verifiedOnly: boolean;
  onlineOnly: boolean;
  minCompatibility?: number;
}

export interface Match {
  id: string;
  profile: Profile;
  matchedAt: string;
  lastMessage?: string;
  unreadCount?: number;
}

export interface DatingActions {
  loadProfiles: (filters?: Partial<FilterState>) => Promise<void>;
  updateFilters: (filters: Partial<FilterState>) => void;
  likeProfile: (profileId: string) => Promise<void>;
  passProfile: (profileId: string) => Promise<void>;
  setCurrentProfile: (profile: Profile | null) => void;
  resetFilters: () => void;
  clearError: () => void;
}

export interface DatingStore {
  profiles: Profile[];
  matches: Profile[];
  filters: FilterState;
  isLoading: boolean;
  error: string | null;
  currentProfile: Profile | null;
  actions: DatingActions;
}