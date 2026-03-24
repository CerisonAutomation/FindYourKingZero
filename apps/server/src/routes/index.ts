// ═══════════════════════════════════════════════════════════════
// SERVER: Hono — Routes (auth, users, matches, messages, events)
// Self-hosted, zero vendor lock-in
// ═══════════════════════════════════════════════════════════════

import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { sign } from 'hono/jwt';
import { zValidator } from '@hono/zod-validator';
import { LoginSchema, RegisterSchema, UpdateProfileSchema, SendMessageSchema, CreateEventSchema } from '../../packages/shared/schemas';
import type { PrismaClient } from '@prisma/client';

export function createApp(prisma: PrismaClient, JWT_SECRET: string) {
  const app = new Hono();

  // Middleware
  app.use('/*', cors({ origin: '*' }));

  // ── Auth Routes ───────────────────────────────────────────
  const auth = new Hono();

  auth.post('/register', zValidator('json', RegisterSchema), async (c) => {
    const data = c.req.valid('json');
    // Hash password with bcrypt
    const { hash } = await import('bcrypt');
    const passwordHash = await hash(data.password, 12);

    const user = await prisma.user.create({
      data: { email: data.email, passwordHash, name: data.name, age: data.age },
    });

    const token = await signJwt({ userId: user.id }, JWT_SECRET);
    return c.json({ user: sanitizeUser(user), token });
  });

  auth.post('/login', zValidator('json', LoginSchema), async (c) => {
    const { email, password } = c.req.valid('json');
    const { compare } = await import('bcrypt');

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !(await compare(password, user.passwordHash))) {
      return c.json({ message: 'Invalid credentials' }, 401);
    }

    const token = await signJwt({ userId: user.id }, JWT_SECRET);
    return c.json({ user: sanitizeUser(user), token });
  });

  // ── User Routes ──────────────────────────────────────────
  const users = new Hono();

  users.get('/me', async (c) => {
    const userId = c.get('jwtPayload').userId;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true },
    });
    return c.json(user);
  });

  users.patch('/me', zValidator('json', UpdateProfileSchema), async (c) => {
    const userId = c.get('jwtPayload').userId;
    const data = c.req.valid('json');
    const profile = await prisma.profile.upsert({
      where: { userId },
      update: data,
      create: { userId, ...data },
    });
    return c.json(profile);
  });

  users.get('/nearby', async (c) => {
    const hexes = c.req.query('hexes')?.split(',') ?? [];
    const limit = parseInt(c.req.query('limit') ?? '20');
    const users = await prisma.profile.findMany({
      where: { h3Hex: { in: hexes } },
      take: limit,
      orderBy: { lastSeen: 'desc' },
    });
    return c.json(users);
  });

  users.get('/search', async (c) => {
    const q = c.req.query('q') ?? '';
    const users = await prisma.profile.findMany({
      where: { name: { contains: q, mode: 'insensitive' } },
      take: 20,
    });
    return c.json(users);
  });

  // ── Match Routes ─────────────────────────────────────────
  const matches = new Hono();

  matches.post('/swipe', async (c) => {
    const userId = c.get('jwtPayload').userId;
    const { targetUserId, action } = await c.req.json();

    // Record swipe
    await prisma.swipe.create({
      data: { swiperId: userId, targetId: targetUserId, action },
    });

    // Check if mutual like
    if (action === 'like' || action === 'superlike') {
      const mutual = await prisma.swipe.findFirst({
        where: {
          swiperId: targetUserId,
          targetId: userId,
          action: { in: ['like', 'superlike'] },
        },
      });

      if (mutual) {
        // Create match!
        const match = await prisma.match.create({
          data: { userIdA: userId, userIdB: targetUserId },
        });
        return c.json({ matched: true, match });
      }
    }

    return c.json({ matched: false });
  });

  matches.get('/', async (c) => {
    const userId = c.get('jwtPayload').userId;
    const matchList = await prisma.match.findMany({
      where: { OR: [{ userIdA: userId }, { userIdB: userId }] },
      include: {
        userA: { include: { profile: true } },
        userB: { include: { profile: true } },
        messages: { take: 1, orderBy: { createdAt: 'desc' } },
      },
      orderBy: { createdAt: 'desc' },
    });
    return c.json(matchList);
  });

  // ── Message Routes ───────────────────────────────────────
  const messages = new Hono();

  messages.get('/:matchId', async (c) => {
    const matchId = c.req.param('matchId');
    const cursor = c.req.query('cursor');
    const msgs = await prisma.message.findMany({
      where: { matchId },
      take: 50,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      orderBy: { createdAt: 'desc' },
    });
    return c.json(msgs.reverse());
  });

  messages.post('/', zValidator('json', SendMessageSchema), async (c) => {
    const userId = c.get('jwtPayload').userId;
    const data = c.req.valid('json');
    const msg = await prisma.message.create({
      data: { ...data, senderId: userId },
    });
    // Update match's lastMessageAt
    await prisma.match.update({
      where: { id: data.matchId },
      data: { lastMessageAt: Date.now() },
    });
    return c.json(msg);
  });

  messages.post('/:matchId/read', async (c) => {
    const userId = c.get('jwtPayload').userId;
    const matchId = c.req.param('matchId');
    await prisma.message.updateMany({
      where: { matchId, senderId: { not: userId }, read: false },
      data: { read: true },
    });
    return c.json({ ok: true });
  });

  // ── Event Routes ─────────────────────────────────────────
  const events = new Hono();

  events.get('/', async (c) => {
    const type = c.req.query('type');
    const evs = await prisma.event.findMany({
      where: type ? { type } : {},
      orderBy: { date: 'asc' },
      take: 50,
    });
    return c.json(evs);
  });

  events.post('/', zValidator('json', CreateEventSchema), async (c) => {
    const userId = c.get('jwtPayload').userId;
    const data = c.req.valid('json');
    const ev = await prisma.event.create({
      data: { ...data, hostId: userId, attendees: [userId] },
    });
    return c.json(ev);
  });

  events.patch('/:id', zValidator('json', UpdateEventSchema), async (c) => {
    const userId = c.get('jwtPayload').userId;
    const eventId = c.req.param('id');
    const data = c.req.valid('json');

    // Only allow editing if user is host
    const ev = await prisma.event.findUnique({
      where: { id: eventId },
      include: { hostId: true },
    });
    if (!ev) return c.json({ message: 'Event not found' }, 404);
    if (ev.hostId !== userId) return c.json({ message: 'Unauthorized' }, 403);

    const updated = await prisma.event.update({
      where: { id: eventId },
      data: data,
    });
    return c.json(updated);
  });

  events.post('/:id/rsvp', async (c) => {
    const userId = c.get('jwtPayload').userId;
    const eventId = c.req.param('id');
    const { going } = await c.req.json();

    const ev = await prisma.event.findUnique({ where: { id: eventId } });
    if (!ev) return c.json({ message: 'Event not found' }, 404);

    const attendees = going
      ? [...new Set([...ev.attendees, userId])]
      : ev.attendees.filter((id) => id !== userId);

    await prisma.event.update({
      where: { id: eventId },
      data: { attendees },
    });
    return c.json({ ok: true });
  });

  // ── Presence Routes ──────────────────────────────────────
  const presence = new Hono();

  presence.post('/', async (c) => {
    const userId = c.get('jwtPayload').userId;
    const data = await c.req.json();
    await prisma.presence.upsert({
      where: { userId },
      update: { ...data, lastSeen: Date.now() },
      create: { userId, ...data, lastSeen: Date.now() },
    });
    return c.json({ ok: true });
  });

  // Mount routes
  app.route('/auth', auth);
  app.route('/users', users);
  app.route('/matches', matches);
  app.route('/messages', messages);
  app.route('/events', events);
  app.route('/presence', presence);

  return app;
}

// Helpers
async function signJwt(payload: any, secret: string): Promise<string> {
  return sign(payload, secret);
}

function sanitizeUser(user: any) {
  const { passwordHash, ...safe } = user;
  return safe;
}
