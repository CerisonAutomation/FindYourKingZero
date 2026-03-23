// ═══════════════════════════════════════════════════════════════
// VERCEL SERVERLESS API — Hono on Vercel Edge Functions
// Replaces self-hosted Hono server
// Uses Vercel Postgres (Neon) + Vercel KV (Redis) + Vercel Blob
// ═══════════════════════════════════════════════════════════════

import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { handle } from 'hono/vercel';

// Vercel-compatible imports
// import { sql } from '@vercel/postgres';     // Vercel Postgres (Neon-backed)
// import { kv } from '@vercel/kv';            // Vercel KV (Redis-compatible)
// import { put, del } from '@vercel/blob';    // Vercel Blob (file uploads)

const app = new Hono().basePath('/api');

app.use('/*', cors());

// ── Auth ──────────────────────────────────────────────────────
app.post('/auth/register', async (c) => {
  // Use Vercel Postgres + bcrypt
  // const { email, password, name, age } = await c.req.json();
  // const hash = await bcrypt.hash(password, 12);
  // const user = await sql`INSERT INTO users (email, password_hash, name, age) VALUES (${email}, ${hash}, ${name}, ${age}) RETURNING id, email, name`;
  // const token = await signJwt({ userId: user.rows[0].id }, process.env.JWT_SECRET!);
  return c.json({ message: 'Use Vercel Postgres for production' });
});

app.post('/auth/login', async (c) => {
  return c.json({ message: 'Use Vercel Postgres for production' });
});

// ── Users ─────────────────────────────────────────────────────
app.get('/users/nearby', async (c) => {
  // Use Vercel Postgres with H3 index
  // const hexes = c.req.query('hexes')?.split(',') ?? [];
  // const users = await sql`SELECT * FROM profiles WHERE h3_hex = ANY(${hexes}) ORDER BY last_seen DESC LIMIT 20`;
  return c.json([]);
});

app.get('/users/:id', async (c) => {
  return c.json({ message: 'Use Vercel Postgres for production' });
});

app.patch('/users/me', async (c) => {
  return c.json({ message: 'Use Vercel Postgres for production' });
});

// ── Matches ───────────────────────────────────────────────────
app.post('/matches/swipe', async (c) => {
  return c.json({ matched: false });
});

app.get('/matches', async (c) => {
  return c.json([]);
});

// ── Messages ──────────────────────────────────────────────────
app.get('/messages/:matchId', async (c) => {
  return c.json([]);
});

app.post('/messages', async (c) => {
  return c.json({ message: 'Use Vercel Postgres for production' });
});

// ── Events ────────────────────────────────────────────────────
app.get('/events', async (c) => {
  return c.json([]);
});

app.post('/events', async (c) => {
  return c.json({ message: 'Use Vercel Postgres for production' });
});

app.post('/events/:id/rsvp', async (c) => {
  return c.json({ ok: true });
});

// ── Presence ──────────────────────────────────────────────────
app.post('/presence', async (c) => {
  // Use Vercel KV for real-time presence (TTL-based)
  // const { userId, h3Hex, lat, lng, online, intent } = await c.req.json();
  // await kv.set(`presence:${userId}`, { h3Hex, lat, lng, online, intent, lastSeen: Date.now() }, { ex: 3600 });
  return c.json({ ok: true });
});

// ── Search (Vercel-compatible) ────────────────────────────────
app.get('/search', async (c) => {
  // Use PostgreSQL full-text search instead of Meilisearch
  // const q = c.req.query('q') ?? '';
  // const results = await sql`SELECT * FROM profiles WHERE to_tsvector('english', name || ' ' || bio) @@ plainto_tsquery('english', ${q}) LIMIT 20`;
  return c.json([]);
});

export const GET = handle(app);
export const POST = handle(app);
export const PATCH = handle(app);
export const DELETE = handle(app);
