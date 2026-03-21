# AI App Builder

A production Next.js 14 app that generates complete app scaffolds from natural language prompts using OpenAI, with real-time collaboration, Monaco code editor, live preview, and one-click Vercel deploy.

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **AI:** OpenAI GPT-4o
- **Database:** Supabase (Postgres + Auth + Realtime + Storage)
- **Editor:** Monaco Editor
- **Deploy:** Vercel API
- **Styling:** Inline styles (no Tailwind)

---

## Setup

### 1. Clone and install

```bash
git clone https://github.com/mcmillianeugene30-hub/ai-builder.git
cd ai-builder
npm install
```

### 2. Supabase project

1. Create a project at [supabase.com](https://supabase.com)
2. Run `supabase_schema.sql` in the SQL Editor
3. Enable **Email** auth in Authentication → Providers
4. Copy your project URL and keys (Authentication → URL Configuration)

### 3. Vercel project

1. Create a project at [vercel.com](https://vercel.com)
2. Connect the GitHub repo
3. Add environment variables (see below)
4. Deploy

### 4. Environment variables

Copy `.env.local.example` to `.env.local` and fill in all values:

```bash
cp .env.local.example .env.local
```

Required variables:

| Variable | Where to find |
|---|---|
| `OPENAI_API_KEY` | [platform.openai.com](https://platform.openai.com/api-keys) |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Settings → API (never expose this) |
| `VERCEL_API_TOKEN` | [vercel.com/account/tokens](https://vercel.com/account/tokens) |
| `VERCEL_TEAM_ID` | Vercel → Settings → General (or leave blank for personal) |

### 5. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Features

- **AI Generation** — Describe an app, get a complete scaffold with frontend, backend, and database schema
- **Code Editor** — Full Monaco editor with syntax highlighting, file tree, and tabbed editing
- **Live Preview** — See your generated app rendered in an iframe
- **Auto-save** — Changes save automatically with debounce
- **Real-time collaboration** — See collaborator presence and edits via Supabase Realtime
- **One-click deploy** — Push directly to Vercel with status polling
- **Deployment history** — Track all deploys per project
- **Error boundary** — Client-side errors caught and displayed with retry actions

---

## Database Schema

Tables required in Supabase:

- `projects` — stores app scaffolds (user_id, name, description, files JSONB)
- `deployments` — Vercel deploy records (project_id, vercel_id, status, url)
- `ai_logs` — AI generation audit log (prompt, model, tokens, latency, success)
- Storage bucket `project-assets` — uploaded images and assets

See `supabase_schema.sql` for the full schema with RLS policies.

---

## API Routes

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| `POST` | `/api/auth/login` | None | Sign in with email/password |
| `POST` | `/api/auth/register` | None | Create account |
| `POST` | `/api/auth/signout` | Required | Sign out |
| `GET` | `/api/projects` | Required | List user&apos;s projects |
| `POST` | `/api/projects` | Required | Create project |
| `GET` | `/api/projects/[id]` | Required | Get single project |
| `PATCH` | `/api/projects/[id]` | Required | Update project (auto-save) |
| `DELETE` | `/api/projects/[id]` | Required | Delete project |
| `POST` | `/api/generate` | Required | Generate app scaffold with AI |
| `POST` | `/api/deploy` | Required | Trigger Vercel deploy (max 60s) |
| `GET` | `/api/deploy/status` | Required | Check deploy status |
| `POST` | `/api/storage` | Required | Upload asset |
| `DELETE` | `/api/storage/[filename]` | Required | Delete asset |
| `POST` | `/api/errors` | None | Log client error |

---

## Deploy to Vercel

```bash
npm run build
vercel --prod
```

Or connect the GitHub repo to Vercel for automatic deploys on push to `master`.
