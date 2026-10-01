-- Base schema (final state). Run this first, then 002_push_reminders.sql.

create table habits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  name text not null,
  icon text not null default '🔥',
  created_at timestamptz default now()
);

create table checkins (
  habit_id uuid references habits on delete cascade,
  day date not null,
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  primary key (habit_id, day)
);

create table settings (
  user_id uuid primary key default auth.uid() references auth.users on delete cascade,
  muted boolean not null default false,
  reminder_time time not null default '20:00',
  sound_mode text not null default 'random' check (sound_mode in ('random', 'sequential'))
);

create table sounds (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  kind text not null check (kind in ('check', 'milestone')),
  path text not null,
  name text not null,
  hidden boolean not null default false,
  created_at timestamptz not null default now()
);

alter table habits enable row level security;
alter table checkins enable row level security;
alter table settings enable row level security;
alter table sounds enable row level security;

create policy own_habits on habits for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy own_checkins on checkins for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy own_settings on settings for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy own_sounds_rows on sounds for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Storage: private bucket, each user only accesses their own uid folder.
-- 2 MB limit and audio only, enforced server-side.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('sounds', 'sounds', false, 2097152, array['audio/*']);

create policy own_sounds on storage.objects for all
  using (bucket_id = 'sounds' and (storage.foldername(name))[1] = auth.uid()::text)
  with check (bucket_id = 'sounds' and (storage.foldername(name))[1] = auth.uid()::text);
