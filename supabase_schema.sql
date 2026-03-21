-- Run this in Supabase Dashboard > SQL Editor

-- ─── AI Logs ─────────────────────────────────────────────────

create table if not exists public.ai_logs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete set null,
  prompt text not null,
  response text,
  success boolean not null default false,
  error text,
  attempt integer not null default 1,
  created_at timestamp with time zone default now()
);

alter table public.ai_logs enable row level security;

create policy "Users can view own logs"
  on public.ai_logs for select
  using (auth.uid() = user_id);

create policy "Service role can do anything"
  on public.ai_logs using (true)
  with check (true);

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
