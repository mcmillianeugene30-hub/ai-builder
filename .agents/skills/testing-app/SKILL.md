# Testing ai-builder App

## Overview
Next.js 15 full-stack app with Supabase auth, OpenAI code generation, Monaco editor, and Vercel deployment.

## Devin Secrets Needed
- `NEXT_PUBLIC_SUPABASE_URL` — Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Supabase anon/public key
- `SUPABASE_SERVICE_ROLE_KEY` — Supabase service role key (server-side only)
- `OPENAI_API_KEY` — OpenAI API key for AI generation
- `VERCEL_API_TOKEN` — Vercel API token for deployments (optional)

## Local Dev Setup
1. `cd /home/ubuntu/repos/ai-builder`
2. `npm install`
3. Create `.env.local` with required env vars (see `.env.local.example`)
4. `npx next dev -p 3000`
5. App available at `http://localhost:3000`

## Testing Without Real Credentials
If real Supabase credentials are not available, you can still test with placeholder values:
```
NEXT_PUBLIC_SUPABASE_URL=https://placeholder.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.placeholder
SUPABASE_SERVICE_ROLE_KEY=placeholder
OPENAI_API_KEY=placeholder
```

The app uses lazy initialization for Supabase, OpenAI, and Vercel clients, so it won't crash at startup with missing/invalid credentials.

### What's Testable Without Credentials
- **Home page** (`/`) — landing page with styling, buttons, navigation
- **Login page** (`/login`) — form rendering, client-side auth.ts module loading
- **Register page** (`/register`) — form rendering, navigation links
- **Security headers** — verify via `curl -sI http://localhost:3000` (X-Content-Type-Options, X-Frame-Options, Referrer-Policy, Permissions-Policy)
- **No X-Powered-By header** — confirm it's absent
- **Console errors** — verify no JS initialization crashes on public pages

### What Requires Real Credentials
- **Dashboard** (`/dashboard`) — needs authenticated Supabase session
- **Editor** (`/editor?projectId=...`) — needs auth + valid project
- **AI Generation** — needs valid OpenAI API key
- **Deployment** — needs valid Vercel API token
- **Auth flows** (sign up, sign in, sign out) — needs real Supabase project

## Vercel Preview Deployments
The repo has Vercel CI integration. Preview deployments may have deployment protection enabled, requiring Vercel account login to access. In that case, test locally instead.

## Key Architecture Notes
- Middleware (`middleware.ts`) protects `/dashboard`, `/editor`, `/projects` routes — unauthenticated users are redirected to `/login`
- Auth pages (`/login`, `/register`) redirect authenticated users to `/dashboard`
- The editor page requires a `projectId` query parameter; without it, shows an error state
- Client-side modules use lazy initialization patterns (Proxy for supabase-browser, getter functions for OpenAI/Vercel) to prevent build/import-time crashes
