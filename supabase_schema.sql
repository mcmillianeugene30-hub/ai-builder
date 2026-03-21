-- Run this in Supabase Dashboard > SQL Editor

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
