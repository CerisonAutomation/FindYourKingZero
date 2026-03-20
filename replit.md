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

- Run: `npm run dev` (starts Vite dev server on port 5000)
- Build: `npm run build`

## Key Features

- User authentication (email/password, magic link, password reset)
- Profile discovery grid with filters
- Real-time messaging and chat rooms
- Events, house parties, "Right Now" meetup feature
- Notifications
- Photo albums
- Bookings system
- Subscriptions (Basic / Premium / VIP) via Stripe
- AI assistant (companion, dating coach, icebreaker, quick replies)
- GDPR compliance tools
- Admin panel
- PWA (installable on mobile)

## Notes

- Migrated from Lovable to Replit — `lovable-tagger` dev dependency removed from Vite config
- CSS `@import` moved before `@tailwind` directives in `src/index.css` to fix build warnings
- Supabase edge functions remain in `supabase/functions/` and are deployed separately to Supabase
