-- Jalankan SETELAH schema awal yang sudah kamu punya.

alter table settings add column if not exists reminder_enabled boolean not null default false;
alter table settings add column if not exists timezone text not null default 'Asia/Makassar';
alter table settings add column if not exists last_push_day date;

create table if not exists push_subscriptions (
  endpoint text primary key,
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  p256dh text not null,
  auth text not null,
  created_at timestamptz not null default now()
);
alter table push_subscriptions enable row level security;
create policy own_push on push_subscriptions for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Cron tiap 5 menit memanggil Edge Function.
-- Ganti YOUR_PROJECT_REF dan YOUR_CRON_SECRET (harus sama dengan secret CRON_SECRET di function).
create extension if not exists pg_cron;
create extension if not exists pg_net;

select cron.schedule(
  'send-reminders',
  '*/5 * * * *',
  $$
  select net.http_post(
    url := 'https://sdclayyuljzinoolnema.supabase.co/functions/v1/send-reminders',
    headers := jsonb_build_object('Content-Type', 'application/json', 'x-cron-secret', '9a3e885d571899199c010aeb4b8e323bd02d310dc8a9e65953d44f4feb9feea1')
  );
  $$
);
