-- Patel Power Database Schema
-- Run this in your Supabase SQL Editor

-- Users table (extends Supabase auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  display_name text not null,
  avatar_emoji text default '💪',
  has_completed_onboarding boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.profiles enable row level security;

-- Profiles are viewable by all authenticated users (it's a family app!)
create policy "Profiles are viewable by authenticated users"
  on public.profiles for select
  using (auth.role() = 'authenticated');

-- Users can update their own profile
create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Users can insert their own profile
create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

---

-- Workouts table
create table public.workouts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles on delete cascade not null,
  workout_date date not null,
  note text,
  logged_at timestamp with time zone default timezone('utc'::text, now()) not null,

  -- Prevent duplicate workouts on same day
  unique(user_id, workout_date)
);

-- Enable RLS
alter table public.workouts enable row level security;

-- Workouts are viewable by all authenticated users
create policy "Workouts are viewable by authenticated users"
  on public.workouts for select
  using (auth.role() = 'authenticated');

-- Users can insert their own workouts
create policy "Users can insert own workouts"
  on public.workouts for insert
  with check (auth.uid() = user_id);

-- Users can delete their own workouts (in case of mistakes)
create policy "Users can delete own workouts"
  on public.workouts for delete
  using (auth.uid() = user_id);

---

-- Badges table (tracks earned badges)
create table public.user_badges (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles on delete cascade not null,
  badge_type text not null,
  earned_at timestamp with time zone default timezone('utc'::text, now()) not null,

  unique(user_id, badge_type)
);

-- Enable RLS
alter table public.user_badges enable row level security;

-- Badges are viewable by all authenticated users
create policy "Badges are viewable by authenticated users"
  on public.user_badges for select
  using (auth.role() = 'authenticated');

-- Users can insert their own badges
create policy "Users can insert own badges"
  on public.user_badges for insert
  with check (auth.uid() = user_id);

---

-- Enable realtime for workouts and profiles
alter publication supabase_realtime add table public.workouts;
alter publication supabase_realtime add table public.profiles;

---

-- Function to automatically update updated_at timestamp
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

-- Trigger for profiles updated_at
create trigger on_profile_updated
  before update on public.profiles
  for each row execute procedure public.handle_updated_at();
