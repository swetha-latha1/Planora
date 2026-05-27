-- Run this in your Supabase SQL Editor

-- ── Habits ────────────────────────────────────────────────────────────────────
create table if not exists habits (
  id              text primary key,
  user_id         uuid references auth.users(id) on delete cascade not null,
  name            text not null,
  description     text,
  category        text not null,
  frequency       text not null,
  color           text not null,
  icon            text not null,
  target_days     int not null default 7,
  completed_dates text[] not null default '{}',
  streak          int not null default 0,
  best_streak     int not null default 0,
  created_at      timestamptz not null default now()
);
alter table habits enable row level security;
drop policy if exists "habits_own" on habits;
create policy "habits_own" on habits using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ── Tasks ─────────────────────────────────────────────────────────────────────
create table if not exists tasks (
  id              text primary key,
  user_id         uuid references auth.users(id) on delete cascade not null,
  title           text not null,
  description     text,
  priority        text not null default 'medium',
  category        text not null default 'work',
  custom_category text,
  completed       boolean not null default false,
  due_date        text,
  created_at      timestamptz not null default now()
);
alter table tasks enable row level security;
drop policy if exists "tasks_own" on tasks;
create policy "tasks_own" on tasks using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ── Projects ──────────────────────────────────────────────────────────────────
create table if not exists projects (
  id           text primary key,
  user_id      uuid references auth.users(id) on delete cascade not null,
  name         text not null,
  description  text,
  category     text not null,
  priority     text not null,
  status       text not null default 'pending',
  color        text not null,
  icon         text not null,
  due_date     text,
  notes        text,
  pinned       boolean not null default false,
  subtasks     jsonb not null default '[]',
  time_entries jsonb not null default '[]',
  created_at   timestamptz not null default now()
);
alter table projects enable row level security;
drop policy if exists "projects_own" on projects;
create policy "projects_own" on projects using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ── Gamification profiles ─────────────────────────────────────────────────────
create table if not exists gamification_profiles (
  user_id           uuid primary key references auth.users(id) on delete cascade,
  xp                int not null default 0,
  level             int not null default 1,
  badges            jsonb not null default '[]',
  total_completions int not null default 0,
  perfect_days      int not null default 0,
  last_perfect_day  text,
  milestones        text[] not null default '{}'
);
alter table gamification_profiles enable row level security;
drop policy if exists "gamification_own" on gamification_profiles;
create policy "gamification_own" on gamification_profiles using (auth.uid() = user_id) with check (auth.uid() = user_id);
