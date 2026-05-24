-- Trackr: Supabase schema
-- Run this in the Supabase SQL editor after creating your project

-- Applications table
create table if not exists public.applications (
  id            uuid        default gen_random_uuid() primary key,
  user_id       uuid        references auth.users(id) on delete cascade not null,
  company       text        not null,
  job_title     text        not null,
  date_applied  date,
  url           text        default '',
  salary_range  text        default '',
  notes         text        default '',
  status        text        default 'wishlist'
                            check (status in ('wishlist','applied','interview','offer','rejected')),
  reminder_date date,
  created_at    timestamptz default now()
);

-- Row Level Security: users only see their own data
alter table public.applications enable row level security;

create policy "select_own_applications"
  on public.applications for select
  using (auth.uid() = user_id);

create policy "insert_own_applications"
  on public.applications for insert
  with check (auth.uid() = user_id);

create policy "update_own_applications"
  on public.applications for update
  using (auth.uid() = user_id);

create policy "delete_own_applications"
  on public.applications for delete
  using (auth.uid() = user_id);

-- Index for fast per-user queries
create index if not exists applications_user_id_idx on public.applications (user_id);
