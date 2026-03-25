# FIND YOUR KING – Gay Dating & Chat App

## Overview

FIND YOUR KING is a premium gay social/dating platform built with React + Vite + TypeScript. It uses Supabase for
authentication, database (PostgreSQL via Supabase), realtime subscriptions, and edge functions. The frontend is a pure
client-side SPA served by Vite.

## Architecture

- **Frontend**: React 18, TypeScript, Vite, TailwindCSS, shadcn/ui
- **Backend/Auth/DB**: Supabase (hosted at `qcmvgtbvjnhfbgjgafoy.supabase.co`)
- **Realtime**: Supabase Realtime for live chat and notifications
- **Payments**: Stripe (via Supabase Edge Functions)
- **AI**: Lovable AI gateway via Supabase Edge Functions (`ai-chat`, `ai-stream`)
- **PWA**: vite-plugin-pwa with service worker

## Project Structure

- `src/` — React application source
    - `src/App.tsx` — Root component and routing
    - `src/hooks/` — Custom React hooks (auth, profiles, messages, etc.)
    - `src/features/` — Feature modules (grid, chat, events, profile, admin, etc.)
    - `src/components/` — Shared UI components
    - `src/integrations/supabase/` — Supabase client and generated TypeScript types
    - `src/lib/` — Utilities, formatters, validators
    - `src/pages/` — Top-level page components
- `supabase/` — Supabase config, migrations, and edge functions
    - `supabase/migrations/` — Database schema and RLS policies
    - `supabase/functions/` — Edge functions (ai-chat, ai-stream, create-checkout, create-booking-payment,
      stripe-webhook)
- `public/` — Static assets, PWA icons, service worker

## Environment Variables

Stored as Replit env vars (shared):

- `VITE_SUPABASE_URL` — Supabase project URL
- `VITE_SUPABASE_PUBLISHABLE_KEY` — Supabase anon/public key
- `VITE_SUPABASE_PROJECT_ID` — Supabase project ID

## Development

- Run: `npm run dev` (starts Vite dev server on port 5000, bound to 0.0.0.0 for Replit preview)
- Build: `npm run build`

## Replit Configuration

- Vite dev server runs on port 5000 with host `0.0.0.0` (required for Replit preview pane)
- `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set as shared environment variables
- Workflow: `Start application` runs `npm run dev`

## Key Features

- User authentication (email/password, magic link, password reset)
- Profile discovery grid with filters + AI match scoring badge on hover
- Real-time messaging and chat rooms with voice input (Web Speech API)
- Events, house parties, "Right Now" meetup feature
- Notifications
- Photo albums
- Bookings system
- Subscriptions (Basic / Premium / VIP) via Stripe
- AI assistant (companion, dating coach, icebreaker, quick replies)
- GDPR compliance tools
- Admin panel
- PWA (installable on mobile)

## AI System (`src/lib/ai/`)

- **AgentOrchestrator** (`src/lib/ai/agents/AgentOrchestrator.ts`) — 4 stateful agents:
  - `MatchMakerAgent` — heuristic compatibility scoring with caching
  - `ChatAssistAgent` — icebreakers + smart quick replies
  - `SafeGuardianAgent` — safety content checks
  - `ProfileOptimizerAgent` — profile score 0–100 + actionable suggestions
- **ChatAI** (`src/lib/ai/ChatAI.ts`) — contextual quick replies, safety, meet-intent detection, translation (client-side)
- Memory stored in `sessionStorage` under `fyk_agent_memory`

## AI Components (`src/components/ai/`)

- **`ProfileOptimizerPanel`** — expandable panel showing profile score arc + priority suggestions; wire via `AgentOrchestrator.profileOptimizer.analyzeProfile(profile)`
- **`IcebreakerPanel`** — AI-generated opening message suggestions with copy/use-in-chat; wire via `AgentOrchestrator.chatAssist.generateIcebreakers(targetProfile)`
- **`AIMatchBadge`** — compact compatibility % chip on GridCards; lazy-loads on hover after 300ms

## Voice System (`src/hooks/` + `src/components/voice/`)

- **`useVoiceInput`** hook — Web Speech API, "Hey King" wake word, transcript state
- **`VoiceInputButton`** — mic button with ripple rings, live transcript bubble, permission error state
- Wired into `UnifiedChatWindow` replacing the static mic placeholder; transcript appended to draft

## CSS Design Tokens (`src/index.css`)

- `--gradient-gold` = `--gradient-primary` = gold `hsl(42 98% 56%)`
- `--gradient-royal` = blue-purple gradient
- `--radius-sm: 6px`, `--radius-md: 10px`, `--radius-lg: 14px` — always use these, never hardcode
- `photo-overlay-bottom` / `photo-overlay-top` — cinematic gradient overlays for profile cards
- `--status-online/away/busy/offline` — use these for status dots (never hardcode `bg-emerald-500`)

## Notes

- Migrated from Lovable to Replit — `lovable-tagger` dev dependency removed from Vite config
- CSS `@import` moved before `@tailwind` directives in `src/index.css` to fix build warnings
- Supabase edge functions remain in `supabase/functions/` and are deployed separately to Supabase
- Port 5000, host 0.0.0.0; use `fuser -k 5000/tcp` if port is in use before restarting
