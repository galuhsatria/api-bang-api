# 🔥 API BANG API

A habit streak tracker you can install on your phone. Check off your habits every day, keep the flame alive, and get a nudge in Gen Z Indonesian when you forget.

Built with TanStack Start, Tailwind CSS, and Supabase.

## Features

- **Streaks** with a 7-day strip, best streak, total check-ins, and a monthly calendar per habit
- **Freeze state**: when a streak breaks, the card turns icy with ❄️ and shows how long the lost streak was
- **Google sign-in** (Supabase Auth); every row is protected by Row Level Security
- **Icon picker**: preset grid plus any emoji or symbol typed from your keyboard
- **Custom sounds** for check-ins and milestones (3, 7, 14, 30, 50, 100, 365 days)
  - upload multiple files, max 2 MB each, audio only
  - mute, random or sequential playback, hide, delete
  - only one sound plays at a time, with a Stop button
  - files live in a private Supabase Storage bucket
- **Push reminders** when habits are still unchecked after your reminder time (default 20:00, once per day)
- **Short motivational messages** (max 4 syllables) that change with the time of day: morning, noon, afternoon, evening
- **Installable PWA**, with a floating bottom nav and light/dark theme

## Tech stack

| Area | Tool |
| --- | --- |
| Framework | TanStack Start (React), file-based routing |
| Styling | Tailwind CSS v4 |
| Data fetching | TanStack Query |
| Backend | Supabase (Postgres, Auth, Storage, Edge Functions, pg_cron) |
| Push | Web Push (VAPID) via `web-push` |
| Icons | lucide-react |

## Getting started

### 1. Install

```bash
npm install
npm i @supabase/supabase-js @tanstack/react-query lucide-react
npm i -D tailwindcss @tailwindcss/vite   # skip if your Start template already has them
```

`vite.config.ts` needs the `tailwindcss()` plugin from `@tailwindcss/vite` alongside `tanstackStart()` and `viteReact()`.

### 2. Environment

```bash
cp .env.example .env
```

| Variable | Where to get it |
| --- | --- |
| `VITE_SUPABASE_URL` | Supabase → Project Settings → API |
| `VITE_SUPABASE_ANON_KEY` | Same page (anon public key) |
| `VITE_VAPID_PUBLIC_KEY` | `npx web-push generate-vapid-keys` |

### 3. Supabase

1. **Auth → Providers → Google**: enable it with a Client ID and Secret from Google Cloud Console.
2. **Auth → URL Configuration**: add `http://localhost:3000` (match your dev port) and your production domain to the Redirect URLs.
3. Run the SQL in the Supabase SQL editor, in order:
   - `supabase/migrations/001_init.sql`
   - `supabase/migrations/002_push_reminders.sql` (replace `YOUR_PROJECT_REF` and `YOUR_CRON_SECRET` first)
4. Deploy the reminder function:

```bash
supabase secrets set \
  VAPID_PUBLIC_KEY=... \
  VAPID_PRIVATE_KEY=... \
  VAPID_SUBJECT=mailto:you@example.com \
  CRON_SECRET=...

supabase functions deploy send-reminders --no-verify-jwt
```

`CRON_SECRET` must match the `x-cron-secret` header in the cron job from `002_push_reminders.sql`.

Test the function before relying on cron:

```bash
curl -X POST https://YOUR_PROJECT_REF.supabase.co/functions/v1/send-reminders \
  -H "x-cron-secret: YOUR_CRON_SECRET"
```

`{"sent":0}` means it runs but nothing was due or nobody is subscribed yet.

### 4. Run

```bash
npm run dev
```

Push notifications and PWA install need HTTPS (`localhost` is the exception), so test push on a deployed build.

## Project structure

```
public/
  manifest.webmanifest      PWA manifest
  sw.js                     service worker (install + push only, no caching)
  icon.svg, icon-*.png
src/
  components/               HabitCard, DetailSheet, IconPicker, Widget, BottomNav, ...
  lib/
    supabase.ts             client
    queries.ts              TanStack Query hooks for habits, settings, sounds
    streak.ts               streak, best, and frozen calculation
    sounds.ts               playback, prefetch, one-at-a-time control
    messages.ts             time-of-day motivational messages
    push.ts                 push subscribe/unsubscribe
  routes/
    __root.tsx              document shell, manifest, theme
    login.tsx               Google sign-in
    _app.tsx                auth guard layout
    _app/index.tsx          streak page (/)
    _app/settings.tsx       settings page (/settings)
  styles/app.css            Tailwind theme tokens and button styles
supabase/
  migrations/               001_init.sql, 002_push_reminders.sql
  functions/send-reminders/ Edge Function that sends the pushes
```

## How it works

- **Auth guard**: `_app.tsx` checks the Supabase session before loading any page and redirects to `/login` if there is none. These routes render on the client only, since the session lives in the browser.
- **Dates**: a check-in is stored as a plain `date` using the device's local day.
- **Sounds**: files are downloaded once from the private bucket, cached as object URLs, and prefetched so playback is instant after a check-in. Sequential mode keeps its position in `localStorage`.
- **Reminders**: pg_cron calls the Edge Function every 5 minutes. For each user with reminders on, it computes the local time from their stored timezone and sends one push if any habit is still unchecked within two hours after their reminder time.
- **New habit button**: the `+` in the bottom nav links to `/?new=true`, which opens the sheet and is cleared on close.

## Known limitations

- **No real home-screen widget.** Web apps cannot create widgets on Android or iOS. Install the PWA to the home screen instead; the motivational messages appear in notifications and in the card on the Streak page. A true widget needs a native wrapper such as Capacitor.
- **iPhone push** only works after the app is added to the home screen.
- **Titles are not encrypted.** Habit names are readable in the database by anyone with dashboard or service-role access. RLS only keeps other users out.

## Scripts

```bash
npm run dev      # development server
npm run build    # production build
```

## License

Choose a license before publishing, for example MIT.
