// ═══════════════════════════════════════════════════════════════
// SERVER: Entry point — Hono on Node.js
// ═══════════════════════════════════════════════════════════════

import { serve } from '@hono/node-server';
import { createApp } from './routes/index.js';
import { PrismaClient } from '@prisma/client';

const PORT = parseInt(process.env.PORT ?? '3000');
const JWT_SECRET = process.env.JWT_SECRET ?? 'change_this_in_production';

const prisma = new PrismaClient();

const app = createApp(prisma, JWT_SECRET);

serve({ fetch: app.fetch, port: PORT }, (info) => {
  console.log(`[King Server] Listening on http://localhost:${info.port}`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('[King Server] Shutting down...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('[King Server] Interrupted');
  await prisma.$disconnect();
  process.exit(0);
});
