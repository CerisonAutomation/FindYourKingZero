// Client-side auth — works without any backend
// In production, replace with real API calls

const DEMO_USERS: Record<string, { password: string; user: any }> = {
  'alex@demo.com': {
    password: 'password123',
    user: { id: 'demo-1', email: 'alex@demo.com', name: 'Alex', age: 28, city: 'Madrid', avatar: 'https://i.pravatar.cc/300?u=alex', tribes: ['Muscle', 'Jock'], lookingFor: ['Dates', 'Friends'], bio: 'Gym rat who loves hiking.', online: true, verified: true, premium: false, authId: 'demo-1', height: '182cm', position: 'Vers', relationshipStatus: 'Single', hivStatus: '', onPrEP: false, photos: [], lat: 40.4, lng: -3.7, h3Hex: '', lastSeen: Date.now(), publicKey: null, createdAt: Date.now() },
  },
  'marcus@demo.com': {
    password: 'password123',
    user: { id: 'demo-2', email: 'marcus@demo.com', name: 'Marcus', age: 32, city: 'Barcelona', avatar: 'https://i.pravatar.cc/300?u=marcus', tribes: ['Bear', 'Daddy'], lookingFor: ['Relationship'], bio: 'Software engineer. Dog dad.', online: true, verified: true, premium: true, authId: 'demo-2', height: '188cm', position: 'Top', relationshipStatus: 'Single', hivStatus: 'Neg', onPrEP: true, photos: [], lat: 41.4, lng: 2.2, h3Hex: '', lastSeen: Date.now(), publicKey: null, createdAt: Date.now() },
  },
};

export const authClient = {
  async login(email: string, password: string) {
    const entry = DEMO_USERS[email];
    if (entry && entry.password === password) {
      const token = btoa(JSON.stringify({ userId: entry.user.id, email, exp: Date.now() + 86400000 }));
      localStorage.setItem('king-auth', JSON.stringify({ user: entry.user, token, isAuthenticated: true }));
      return { user: entry.user, token };
    }
    throw new Error('Invalid email or password. Try alex@demo.com / password123');
  },

  async register(email: string, password: string, name: string, age: number) {
    const user = {
      id: 'user-' + Date.now(), email, name, age,
      city: '', avatar: `https://i.pravatar.cc/300?u=${name}`,
      tribes: [], lookingFor: [], bio: '',
      online: true, verified: false, premium: false,
      authId: 'user-' + Date.now(), height: '', position: '', relationshipStatus: 'Single',
      hivStatus: '', onPrEP: false, photos: [], lat: 0, lng: 0, h3Hex: '',
      lastSeen: Date.now(), publicKey: null, createdAt: Date.now(),
    };
    const token = btoa(JSON.stringify({ userId: user.id, email, exp: Date.now() + 86400000 }));
    localStorage.setItem('king-auth', JSON.stringify({ user, token, isAuthenticated: true }));
    return { user, token };
  },

  getDemoUsers() {
    return Object.values(DEMO_USERS).map(e => e.user);
  },

  getEvents() {
    return [
      { id: 'e1', title: 'Rooftop Party', type: 'Party', date: Date.now() + 86400000, time: '21:00', location: 'Madrid, Malasaña', capacity: 50, attendees: ['demo-1', 'demo-2'], hostId: 'demo-4', description: 'Best rooftop in the city.' },
      { id: 'e2', title: 'Gym Buddies', type: 'Gym', date: Date.now() + 172800000, time: '07:00', location: 'Barcelona, Eixample', capacity: 10, attendees: ['demo-1'], hostId: 'demo-2', description: 'Morning workout. All levels.' },
      { id: 'e3', title: 'Wine Tasting', type: 'Drinks', date: Date.now() + 259200000, time: '19:00', location: 'Lisbon, Chiado', capacity: 20, attendees: [], hostId: 'demo-5', description: 'Portuguese wines + tapas.' },
    ];
  },

  getMatches() {
    return [
      { id: 'm1', userIdA: 'current', userIdB: 'demo-1', lastMessage: 'Hey! How are you?', lastMessageAt: Date.now() - 300000, unreadCount: 2 },
      { id: 'm2', userIdA: 'current', userIdB: 'demo-2', lastMessage: 'See you at the gym tomorrow 💪', lastMessageAt: Date.now() - 3600000, unreadCount: 0 },
      { id: 'm3', userIdA: 'current', userIdB: 'demo-4', lastMessage: 'That party was amazing!', lastMessageAt: Date.now() - 86400000, unreadCount: 1 },
    ];
  },

  getMessages(matchId: string) {
    return [
      { id: '1', matchId, senderId: 'demo-1', content: 'Hey there! 👋', type: 'text', read: true, createdAt: Date.now() - 600000 },
      { id: '2', matchId, senderId: 'current', content: 'Hey! How are you?', type: 'text', read: true, createdAt: Date.now() - 300000 },
    ];
  },
};
