# AI App Builder

A production-oriented Next.js app that generates full-stack app scaffolds from natural language prompts.

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **AI:** OpenAI + pluggable model providers
- **Database/Auth/Storage:** Supabase
- **Billing:** Stripe
- **Deploy API:** Vercel
- **Styling:** Tailwind CSS
- **Monitoring:** Sentry

---

## Setup

### 1. Clone and install

```bash
git clone https://github.com/mcmillianeugene30-hub/ai-builder.git
cd ai-builder
npm install
```

### 2. Configure environment

```bash
cp .env.local.example .env.local
```

Fill `.env.local` with the required credentials (Supabase, OpenAI, Vercel, Stripe).

### 3. Initialize Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Run `supabase_schema.sql` in SQL Editor
3. Apply migrations from `supabase/migrations`
4. Create storage bucket `project-assets`

### 4. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Current Features

- Prompt-driven scaffold generation through `/api/generate` with model selection and provider fallback
- Project CRUD endpoints backed by Supabase
- Asset upload/list/delete endpoints using Supabase Storage
- Auth endpoints for register/login/signout
- Stripe checkout + billing portal + webhook handlers
- Deploy trigger + status polling endpoints for Vercel
- Built-in per-IP rate limiting on generation endpoint
- Prompt template catalog endpoint for faster project starts
- Client/server error logging endpoint

---

## API Routes

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| `POST` | `/api/auth/login` | None | Sign in with email/password |
| `POST` | `/api/auth/register` | None | Create account |
| `POST` | `/api/auth/signout` | Optional | Clear app auth cookie |
| `GET` | `/api/projects` | Required | List user's projects |
| `POST` | `/api/projects` | Required | Create project |
| `GET` | `/api/projects/[id]` | Required | Get single project |
| `PATCH` | `/api/projects/[id]` | Required | Update project |
| `DELETE` | `/api/projects/[id]` | Required | Delete project |
| `POST` | `/api/generate` | Required | Generate app scaffold (supports `modelId`, `maxTokens`, `temperature`) |
| `POST` | `/api/deploy` | Required | Trigger Vercel deploy |
| `GET` | `/api/deploy/status` | Required | Check deploy status |
| `GET` | `/api/storage` | Required | List uploaded assets |
| `POST` | `/api/storage` | Required | Upload asset (multipart `file`) |
| `DELETE` | `/api/storage/[filename]` | Required | Delete asset |
| `POST` | `/api/errors` | Optional | Log client error |
| `GET` | `/api/models` | None | List available AI models |
| `GET` | `/api/templates` | None | List starter prompt templates by category |

---

## Deploy

```bash
npm run build
vercel --prod
```
