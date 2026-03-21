# Testing ai-builder

## Overview
ai-builder is a Next.js 15 full-stack app with Supabase auth, OpenAI integration, and Vercel deployment. It uses Tailwind CSS v4 for styling.

## Local Dev Server
```bash
npm install
npm run dev  # starts on port 3000
```

## Environment Variables
Copy `.env.local.example` to `.env.local` and fill in:
- `OPENAI_API_KEY` — for AI app generation
- `NEXT_PUBLIC_SUPABASE_URL` — Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Supabase anon/public key (client-side)
- `VERCEL_API_TOKEN` — for deployment integration
- `VERCEL_TEAM_ID` — for deployment integration

For basic page rendering tests, dummy values work (the app will load but auth calls will fail gracefully).

## Devin Secrets Needed
- `NEXT_PUBLIC_SUPABASE_URL` — for full auth testing
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — for full auth testing
- `OPENAI_API_KEY` — for AI generation testing
- `VERCEL_API_TOKEN` — for deployment testing
- `VERCEL_TEAM_ID` — for deployment testing

## What Can Be Tested Without Real Credentials
- Public pages: `/` (homepage), `/login`, `/register` — render with dark theme
- Auth API response format: POST to `/api/auth/login`, `/api/auth/register`, `/api/auth/signout` — verify they return JSON (`application/json`), not redirects
- Login/Register form UX: fill in credentials and submit — verify error messages appear in red text on the page, no crashes or redirects
- Middleware redirect: navigate to `/dashboard`, `/editor`, `/projects` — verify redirect to `/login?redirect=...`
- Tailwind CSS: check compiled CSS at `/_next/static/css/app/layout.css` for Tailwind v4 preflight
- Build: `npm run build` should pass cleanly

## What Requires Real Supabase Credentials
- Full auth flow (register → confirm email → login → dashboard)
- Project CRUD (create, list, update, delete)
- Editor page with preview panel (requires auth + project)
- Real-time collaboration features
- File storage operations

## What Requires Vercel Credentials
- Deployment flow (deploy project to Vercel)
- Deployment status checking

## App Architecture Notes
- **Middleware** (`middleware.ts`): Redirects `/dashboard`, `/editor`, `/projects` to `/login` if no supabase cookie
- **Auth API routes**: Return `NextResponse.json()` responses (not redirects). Client code uses `fetch()` + `res.json()` then `router.push()` for navigation
- **Layout** (`app/layout.tsx`): Wraps everything in `ErrorBoundary > ErrorProvider > AuthProvider`. AuthProvider creates a Supabase browser client on mount
- **Nav**: Hidden on `/`, `/login`, `/register`. Shown on all other pages with Dashboard/Projects links
- **Editor**: Server component that requires `projectId` query param and authenticated user. Renders `EditorApp` with Monaco editor, file explorer, preview panel
- **PreviewPanel**: Uses `useEffect` to auto-compile when `project.files` changes

## Vercel Preview Deployments
The Vercel preview might be behind deployment protection (redirects to vercel.com/login). If so, test locally instead.

## Testing Tips
- The `browser_console` tool may have focus issues — use `xdotool` to activate Chrome, or use `curl` for API testing
- For CSS verification, curl the compiled CSS file directly rather than relying on browser console computed styles
- The app uses a mix of inline styles and Tailwind classes — public pages mostly use inline styles, editor components use Tailwind
