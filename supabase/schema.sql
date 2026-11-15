-- Weight Target: every table holds rows for many people; each person can read and write only their own.
-- Run once in the Supabase SQL editor (SQL Editor > New query > paste > Run). Safe to run again.
-- The food library and recipes are not here: they ship with the site (data/library.js) and are the same for everyone.

-- ---------- tables ----------
create table if not exists public.settings (
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  key     text not null,
  value   text not null default '',
  primary key (user_id, key)
);

create table if not exists public.weight_log (
  id      bigint generated always as identity primary key,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  date    date not null,
  weight  real not null check (weight > 50 and weight < 800),
  note    text not null default '',
  unique (user_id, date)
);

create table if not exists public.bp_log (
  id        bigint generated always as identity primary key,
  user_id   uuid not null default auth.uid() references auth.users (id) on delete cascade,
  taken_at  text not null,                -- local time, YYYY-MM-DDTHH:MM
  systolic  int not null check (systolic between 60 and 260),
  diastolic int not null check (diastolic between 30 and 160),
  pulse     int check (pulse between 30 and 220),
  context   text not null default 'morning',
  note      text not null default ''
);

-- A person's changes to a library food (unlock a yellow one, a note) or a food they added (id starts with "u-").
create table if not exists public.foods_custom (
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  food_id text not null,
  data    jsonb not null default '{}'::jsonb,
  primary key (user_id, food_id)
);

create table if not exists public.meal_prefs (
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  meal_id text not null,
  enabled boolean not null default true,
  primary key (user_id, meal_id)
);

-- A week's plan: days = [{date, away, slots: [{slot, meal_id}]}], checks = {food_id: true} for the shopping list.
create table if not exists public.plans (
  id         bigint generated always as identity primary key,
  user_id    uuid not null default auth.uid() references auth.users (id) on delete cascade,
  week_start date not null,
  created_at timestamptz not null default now(),
  days       jsonb not null default '[]'::jsonb,
  checks     jsonb not null default '{}'::jsonb,
  unique (user_id, week_start)
);

create table if not exists public.gym_sets (
  id         bigint generated always as identity primary key,
  user_id    uuid not null default auth.uid() references auth.users (id) on delete cascade,
  gymace_id  bigint,                       -- Gym ACE's set id for imported sets; null for sets logged here
  session_ms bigint not null,
  set_ms     bigint not null,
  date       date not null,
  workout    text not null default '',
  exercise   text not null,
  weight     real,
  reps       int,
  note       text not null default '',
  unique (user_id, gymace_id)
);
create index if not exists gym_sets_user_date on public.gym_sets (user_id, date);

create table if not exists public.gym_workouts (
  user_id     uuid not null default auth.uid() references auth.users (id) on delete cascade,
  workout     text not null,
  exercise    text not null,
  ord         int not null default 0,
  note        text not null default '',
  target_sets int,
  target_reps int,
  primary key (user_id, workout, exercise)
);

create table if not exists public.blog_posts (
  user_id      uuid not null default auth.uid() references auth.users (id) on delete cascade,
  date         date not null,
  title        text,
  commentary   text not null default '',
  published_at timestamptz,
  updated_at   timestamptz,
  primary key (user_id, date)
);

-- A day's check-in: energy, focus and mood out of 10, hours slept, ounces of water, habits kept ({key: true}).
create table if not exists public.checkins (
  user_id     uuid not null default auth.uid() references auth.users (id) on delete cascade,
  date        date not null,
  energy      int check (energy between 1 and 10),
  focus       int check (focus between 1 and 10),
  mood        int check (mood between 1 and 10),
  sleep_hours real check (sleep_hours between 0 and 24),
  water_oz    real not null default 0 check (water_oz between 0 and 400),
  habits      jsonb not null default '{}'::jsonb,
  note        text not null default '',
  primary key (user_id, date)
);

-- ---------- each person's rows are their own ----------
do $$
declare t text;
begin
  foreach t in array array['settings', 'weight_log', 'bp_log', 'foods_custom', 'meal_prefs', 'plans', 'gym_sets', 'gym_workouts', 'blog_posts', 'checkins'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('revoke all on public.%I from anon', t);
    execute format('grant select, insert, update, delete on public.%I to authenticated', t);
    execute format('drop policy if exists "own rows" on public.%I', t);
    execute format('create policy "own rows" on public.%I for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id)', t);
  end loop;
end $$;

-- ---------- delete my account: the sign-in and, through the cascades, every row ----------
create or replace function public.delete_me() returns void
language plpgsql security definer set search_path = public, auth as $$
begin
  if auth.uid() is null then
    raise exception 'not signed in';
  end if;
  delete from auth.users where id = auth.uid();
end $$;
revoke all on function public.delete_me() from public;
grant execute on function public.delete_me() to authenticated;
