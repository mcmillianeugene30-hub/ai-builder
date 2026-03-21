-- ============================================================
-- AI App Builder — Supabase Schema
-- Run this in your Supabase SQL editor:
-- https://app.supabase.com → Your project → SQL Editor
-- ============================================================

<<<<<<< HEAD
-- ─── AI Logs ─────────────────────────────────────────────────

=======
-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ─── Projects ────────────────────────────────────────────────
create table if not exists public.projects (
  id          uuid        primary key default uuid_generate_v4(),
  user_id     uuid        not null references auth.users(id) on delete cascade,
  name        text        not null,
  description text,
  files       jsonb       not null default '[]',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table public.projects enable row level security;

-- Users can only see and manage their own projects
create policy "Users manage own projects"
  on public.projects
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ─── Deployments ─────────────────────────────────────────────
create table if not exists public.deployments (
  id             uuid        primary key default uuid_generate_v4(),
  project_id     uuid        not null references public.projects(id) on delete cascade,
  user_id        uuid        not null references auth.users(id) on delete cascade,
  vercel_id      text        unique not null,
  status         text        not null check (status in ('queued', 'building', 'ready', 'error', 'canceled')),
  url            text,
  error_message  text,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

alter table public.deployments enable row level security;

create policy "Users manage own deployments"
  on public.deployments
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ─── AI Generation Logs ──────────────────────────────────────
>>>>>>> 640877f (fix: resolve all 14 production issues)
create table if not exists public.ai_logs (
  id          uuid        primary key default uuid_generate_v4(),
  user_id     uuid        references auth.users(id) on delete set null,
  prompt      text        not null,
  model       text,
  tokens_used integer,
  latency_ms  integer,
  success     boolean,
  error       text,
  attempt     integer     not null default 1,
  created_at  timestamptz not null default now()
);

alter table public.ai_logs enable row level security;

-- Allow anyone to read logs (for debugging), only service role can insert
create policy "Service role can manage ai_logs"
  on public.ai_logs
  for all
  using (true)
  with check (true);

<<<<<<< HEAD
-- ─── Projects ────────────────────────────────────────────────

create table if not exists public.projects (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  description text,
  files jsonb not null default '[]'::jsonb,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

alter table public.projects enable row level security;

create policy "Users can view own projects"
  on public.projects for select
  using (auth.uid() = user_id);

create policy "Users can insert own projects"
  on public.projects for insert
  with check (auth.uid() = user_id);

create policy "Users can update own projects"
  on public.projects for update
  using (auth.uid() = user_id);

create policy "Users can delete own projects"
  on public.projects for delete
  using (auth.uid() = user_id);

-- Auto-update updated_at on changes
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger projects_updated_at
  before update on public.projects
  for each row execute function public.handle_updated_at();

-- ─── Deployments ─────────────────────────────────────────────

create table if not exists public.deployments (
  id uuid default gen_random_uuid() primary key,
  project_id uuid references public.projects(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  vercel_id text not null unique,
  status text not null default 'queued',
  url text,
  error_message text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

alter table public.deployments enable row level security;

create policy "Users can view own deployments"
  on public.deployments for select
  using (auth.uid() = user_id);

create policy "Users can insert own deployments"
  on public.deployments for insert
  with check (auth.uid() = user_id);

create policy "Users can update own deployments"
  on public.deployments for update
  using (auth.uid() = user_id);

create trigger deployments_updated_at
  before update on public.deployments
  for each row execute function public.handle_updated_at();

-- ─── Error Logs ──────────────────────────────────────────────

create table if not exists public.error_logs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete set null,
  module text not null,
  error_code text not null,
  message text not null,
  stack text,
  context jsonb,
  severity text not null default 'medium',
  created_at timestamp with time zone default now()
);

alter table public.error_logs enable row level security;

create policy "Users can view own error logs"
  on public.error_logs for select
  using (auth.uid() = user_id);

create policy "Service role can insert error logs"
  on public.error_logs for insert
  with check (true);

-- ─── Storage bucket ──────────────────────────────────────────
-- Create the 'project-assets' bucket via Supabase Dashboard > Storage
-- or run: insert into storage.buckets (id, name, public) values ('project-assets', 'project-assets', false);
=======
-- ─── Storage Bucket ──────────────────────────────────────────
-- Run in Supabase dashboard → Storage → New bucket
-- Name: project-assets
-- Public: false
-- File size limit: 10MB
-- Allowed MIME types: image/png, image/jpeg, image/gif, image/svg+xml, image/webp

-- Storage RLS policies (run after creating the bucket):
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'project-assets',
  'project-assets',
  false,
  10 * 1024 * 1024,
  array['image/png', 'image/jpeg', 'image/gif', 'image/svg+xml', 'image/webp', 'font/woff', 'font/woff2', 'font/ttf', 'application/octet-stream']
)
on conflict (id) do update set
  file_size_limit = 10 * 1024 * 1024,
  allowed_mime_types = array['image/png', 'image/jpeg', 'image/gif', 'image/svg+xml', 'image/webp', 'font/woff', 'font/woff2', 'font/ttf', 'application/octet-stream'];

create policy "Users manage own assets"
  on storage.objects
  for all
  using (bucket_id = 'project-assets' and auth.uid()::text = (storage.foldername(name))[1])
  with check (bucket_id = 'project-assets' and auth.uid()::text = (storage.foldername(name))[1]);
>>>>>>> 640877f (fix: resolve all 14 production issues)
