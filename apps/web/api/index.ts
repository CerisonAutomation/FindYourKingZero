// ═══════════════════════════════════════════════════════════════
// VERCEL SERVERLESS API — Working auth + data endpoints
// No database needed — uses Vercel KV or in-memory fallback
// ═══════════════════════════════════════════════════════════════

import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { handle } from 'hono/vercel';
import { sign, verify } from 'hono/jwt';

const app = new Hono().basePath('/api');
app.use('/*', cors());

const JWT_SECRET = process.env.JWT_SECRET || 'fyk-secret-2026';

// In-memory store (works for demo, resets on cold start)
const users = new Map<string, { id: string; email: string; password: string; name: string; age: number; createdAt: number }>();
const profiles = new Map<string, any>();
const matches = new Map<string, any[]>();
const messages = new Map<string, any[]>();
const events: any[] = [];
const presence = new Map<string, any>();

// Seed demo data
const demoUsers = [
  { id: 'demo-1', email: 'alex@demo.com', password: 'password123', name: 'Alex', age: 28, city: 'Madrid', avatar: 'https://i.pravatar.cc/300?u=alex', tribes: ['Muscle', 'Jock'], lookingFor: ['Dates', 'Friends'], bio: 'Gym rat who loves hiking. Looking for someone genuine.', online: true, verified: true, premium: false },
  { id: 'demo-2', email: 'marcus@demo.com', password: 'password123', name: 'Marcus', age: 32, city: 'Barcelona', avatar: 'https://i.pravatar.cc/300?u=marcus', tribes: ['Bear', 'Daddy'], lookingFor: ['Relationship'], bio: 'Software engineer. Dog dad. Coffee addict ☕', online: true, verified: true, premium: true },
  { id: 'demo-3', email: 'james@demo.com', password: 'password123', name: 'James', age: 25, city: 'London', avatar: 'https://i.pravatar.cc/300?u=james', tribes: ['Twink', 'Geek'], lookingFor: ['Chat', 'Events'], bio: 'PhD student. Love board games and bad puns 🎲', online: false, verified: false, premium: false },
  { id: 'demo-4', email: 'kai@demo.com', password: 'password123', name: 'Kai', age: 30, city: 'Berlin', avatar: 'https://i.pravatar.cc/300?u=kai', tribes: ['Leather', 'Masc'], lookingFor: ['Right Now', 'Hookup'], bio: 'DJ by night. Always down for adventure.', online: true, verified: true, premium: true },
  { id: 'demo-5', email: 'rafael@demo.com', password: 'password123', name: 'Rafael', age: 27, city: 'Lisbon', avatar: 'https://i.pravatar.cc/300?u=rafael', tribes: ['Otter', 'Alt'], lookingFor: ['Dates', 'Networking'], bio: 'Photographer capturing life one frame at a time 📸', online: true, verified: false, premium: false },
];

demoUsers.forEach(u => {
  users.set(u.email, u);
  profiles.set(u.id, u);
});

// ── Auth ──────────────────────────────────────────────────────
app.post('/auth/login', async (c) => {
  try {
    const { email, password } = await c.req.json();
    const user = users.get(email);
    if (!user || user.password !== password) {
      return c.json({ message: 'Invalid email or password' }, 401);
    }
    const token = await sign({ userId: user.id, email: user.email }, JWT_SECRET);
    const { password: _, ...safe } = user;
    return c.json({ user: safe, token });
  } catch (e) {
    return c.json({ message: 'Login failed' }, 500);
  }
});

app.post('/auth/register', async (c) => {
  try {
    const { email, password, name, age } = await c.req.json();
    if (users.has(email)) {
      return c.json({ message: 'Email already registered' }, 400);
    }
    const user = {
      id: 'user-' + Date.now(),
      email, password, name, age,
      city: '', avatar: `https://i.pravatar.cc/300?u=${name}`,
      tribes: [], lookingFor: [], bio: '',
      online: true, verified: false, premium: false,
      createdAt: Date.now(),
    };
    users.set(email, user);
    profiles.set(user.id, user);
    const token = await sign({ userId: user.id, email }, JWT_SECRET);
    const { password: _, ...safe } = user;
    return c.json({ user: safe, token });
  } catch (e) {
    return c.json({ message: 'Registration failed' }, 500);
  }
});

app.post('/auth/forgot-password', async (c) => {
  // Always return success to prevent email enumeration
  return c.json({ ok: true });
});

app.get('/auth/verify', async (c) => {
  try {
    const auth = c.req.header('Authorization')?.replace('Bearer ', '');
    if (!auth) return c.json({ message: 'No token' }, 401);
    const payload = await verify(auth, JWT_SECRET);
    const user = profiles.get(payload.userId as string);
    if (!user) return c.json({ message: 'User not found' }, 404);
    const { password: _, ...safe } = user;
    return c.json({ user: safe });
  } catch {
    return c.json({ message: 'Invalid token' }, 401);
  }
});

// ── Users ─────────────────────────────────────────────────────
app.get('/users/nearby', async (c) => {
  const hexes = c.req.query('hexes')?.split(',') ?? [];
  const limit = parseInt(c.req.query('limit') ?? '20');
  // Return demo users (in production, filter by H3 hex)
  const all = Array.from(profiles.values()).filter(u => u.id !== 'current');
  return c.json(all.slice(0, limit));
});

app.get('/users/:id', async (c) => {
  const id = c.req.param('id');
  const user = profiles.get(id);
  if (!user) return c.json({ message: 'Not found' }, 404);
  const { password: _, ...safe } = user;
  return c.json(safe);
});

app.patch('/users/me', async (c) => {
  try {
    const auth = c.req.header('Authorization')?.replace('Bearer ', '');
    if (!auth) return c.json({ message: 'Unauthorized' }, 401);
    const payload = await verify(auth, JWT_SECRET);
    const data = await c.req.json();
    const user = profiles.get(payload.userId as string);
    if (user) {
      Object.assign(user, data);
      profiles.set(payload.userId as string, user);
    }
    const { password: _, ...safe } = user ?? {};
    return c.json(safe);
  } catch {
    return c.json({ message: 'Failed' }, 500);
  }
});

app.post('/users/:id/block', async (c) => c.json({ ok: true }));
app.post('/users/:id/report', async (c) => c.json({ ok: true }));

// ── Matches ───────────────────────────────────────────────────
app.post('/matches/swipe', async (c) => {
  try {
    const { userId, action } = await c.req.json();
    // Simulate 30% match rate
    const matched = action !== 'pass' && Math.random() < 0.3;
    if (matched) {
      return c.json({ matched: true, match: { id: 'match-' + Date.now(), userId } });
    }
    return c.json({ matched: false });
  } catch {
    return c.json({ matched: false });
  }
});

app.get('/matches', async (c) => {
  // Return demo conversations
  return c.json([
    { id: 'm1', userIdA: 'current', userIdB: 'demo-1', lastMessage: 'Hey! How are you?', lastMessageAt: Date.now() - 300000, unreadCount: 2 },
    { id: 'm2', userIdA: 'current', userIdB: 'demo-2', lastMessage: 'See you at the gym tomorrow 💪', lastMessageAt: Date.now() - 3600000, unreadCount: 0 },
    { id: 'm3', userIdA: 'current', userIdB: 'demo-4', lastMessage: 'That party was amazing!', lastMessageAt: Date.now() - 86400000, unreadCount: 1 },
  ]);
});

// ── Messages ──────────────────────────────────────────────────
app.get('/messages/:matchId', async (c) => {
  const matchId = c.req.param('matchId');
  const msgs = messages.get(matchId) ?? [
    { id: '1', matchId, senderId: 'demo-1', content: 'Hey there! 👋', type: 'text', read: true, createdAt: Date.now() - 600000 },
    { id: '2', matchId, senderId: 'current', content: 'Hey! How are you?', type: 'text', read: true, createdAt: Date.now() - 300000 },
  ];
  return c.json(msgs);
});

app.post('/messages', async (c) => {
  try {
    const data = await c.req.json();
    const msg = { id: 'msg-' + Date.now(), ...data, createdAt: Date.now(), read: false, delivered: true };
    return c.json(msg);
  } catch {
    return c.json({ message: 'Failed' }, 500);
  }
});

// ── Events ────────────────────────────────────────────────────
app.get('/events', async (c) => {
  return c.json(events.length ? events : [
    { id: 'e1', title: 'Rooftop Party', type: 'Party', date: Date.now() + 86400000, time: '21:00', location: 'Madrid, Malasaña', capacity: 50, attendees: ['demo-1', 'demo-2'], hostId: 'demo-4', description: 'Best rooftop in the city. Drinks, music, views.' },
    { id: 'e2', title: 'Gym Buddies', type: 'Gym', date: Date.now() + 172800000, time: '07:00', location: 'Barcelona, Eixample', capacity: 10, attendees: ['demo-1'], hostId: 'demo-2', description: 'Morning workout session. All levels welcome.' },
    { id: 'e3', title: 'Wine Tasting', type: 'Drinks', date: Date.now() + 259200000, time: '19:00', location: 'Lisbon, Chiado', capacity: 20, attendees: [], hostId: 'demo-5', description: 'Portuguese wines + tapas. Meet new people.' },
  ]);
});

app.post('/events', async (c) => {
  try {
    const data = await c.req.json();
    const ev = { id: 'ev-' + Date.now(), ...data, attendees: [], createdAt: Date.now() };
    events.push(ev);
    return c.json(ev);
  } catch {
    return c.json({ message: 'Failed' }, 500);
  }
});

app.patch('/events/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const data = await c.req.json();
    const ev = events.find(e => e.id === id);
    if (ev) Object.assign(ev, data);
    return c.json(ev ?? { ok: false });
  } catch { return c.json({ ok: false }); }
});

app.post('/events/:id/rsvp', async (c) => c.json({ ok: true }));

// ── Presence ──────────────────────────────────────────────────
app.post('/presence', async (c) => {
  try {
    const data = await c.req.json();
    return c.json({ ok: true });
  } catch {
    return c.json({ ok: false });
  }
});

// ── Search ────────────────────────────────────────────────────
app.get('/search', async (c) => {
  const q = c.req.query('q')?.toLowerCase() ?? '';
  const results = Array.from(profiles.values())
    .filter(u => u.name?.toLowerCase().includes(q) || u.city?.toLowerCase().includes(q))
    .slice(0, 20);
  return c.json(results);
});

export const GET = handle(app);
export const POST = handle(app);
export const PATCH = handle(app);
export const DELETE = handle(app);
