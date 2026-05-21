# Revo

Revo is a revenue intelligence platform for Nigerian state internal revenue
services. It gives field agents a fast way to record cash collections and gives
state administrators a live view of what is being collected, by whom, and
where the numbers look wrong.

Every collection creates an instant, tamper-proof digital record, and the
taxpayer receives an SMS confirmation directly — not through the agent — so
the receipt can't be faked or withheld.

## What it does

- **Field agents** log in with a phone number + PIN, pick a revenue type,
  enter the amount and the payer's phone number, and confirm. An SMS receipt
  fires to the payer immediately.
- **State administrators** log in with email + password and see a live
  dashboard: collected today, month-to-date, active agents, and any
  collections flagged for review. The dashboard auto-refreshes every 30s and
  can export the day's records to CSV.
- **Anomaly flags** — collections at or above ₦50,000 are automatically held
  for manual review and surfaced on the dashboard.

## Screens

| Route        | Who      | Purpose                                            |
|--------------|----------|----------------------------------------------------|
| `/login`     | Everyone | Tabbed login — field agent (PIN) or state admin    |
| `/collect`   | Agent    | Record a collection; live receipt + daily totals   |
| `/dashboard` | Admin    | Stat cards + transactions table + flag alerts      |
| `/history`, `/summary`, `/agents`, `/flags`, `/reports` | — | Planned (phase 2) placeholders |

Routes are organised into `(auth)`, `(agent)`, and `(admin)` route groups. The
agent and admin sections share a navy sidebar + topbar shell; login is a
standalone full-viewport screen.

## Stack

- **Next.js 16** (App Router) + **React 19** + **TypeScript**
- **Tailwind CSS v4** — design tokens defined in `app/globals.css` via
  `@theme` (the `rg-*` colour palette), Tabler Icons webfont
- **Prisma** + **PostgreSQL** (Supabase) — `Agent`, `Collection`, `Admin`
- **Termii** — SMS delivery (`lib/sms.ts`)
- **jsonwebtoken** + **bcryptjs** — auth
- Deploys to **Vercel**

## Project layout

```
app/
  (auth)/login/            Standalone login screen
  (agent)/                 Sidebar+topbar shell (agent nav)
    collect/  history/  summary/
  (admin)/                 Sidebar+topbar shell (admin nav)
    dashboard/  agents/  flags/  reports/
  api/
    auth/agent/  auth/admin/   Login endpoints
    collect/                    Record a collection + fire SMS
    dashboard/                  Today's stats, table, flags
    agent/summary/              Per-agent daily totals
components/                Sidebar, Topbar, StatCard, ReceiptCard, PinInput, …
lib/                       db.ts (Prisma singleton), sms.ts (Termii)
prisma/                    schema.prisma, seed.ts
```

## Getting started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create `.env.local` in the project root:

   ```bash
   DATABASE_URL="postgresql://postgres:[password]@db.[ref].supabase.co:5432/postgres"
   JWT_SECRET="a-long-random-string"
   TERMII_API_KEY="your-termii-api-key"
   TERMII_SENDER_ID="REVO"
   ```

3. Push the schema and seed demo data:

   ```bash
   npx prisma db push
   npx prisma db seed
   ```

4. Run the dev server:

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) — `/` redirects to
   `/login`.

## Demo credentials

Created by `prisma/seed.ts`. **Change these before any real usage.**

| Role        | Login                   | Secret      |
|-------------|-------------------------|-------------|
| Field agent | `08012345671`           | PIN `1234`  |
| Field agent | `08012345672`           | PIN `1234`  |
| Field agent | `08012345673`           | PIN `1234`  |
| State admin | `admin@revo.ng` | `admin123`  |

## Scripts

| Command         | Description                          |
|-----------------|--------------------------------------|
| `npm run dev`   | Start the dev server                 |
| `npm run build` | Production build                     |
| `npm run start` | Serve the production build           |
| `npm run lint`  | Run ESLint                           |

---

*Revo — James Ibukunoluwa · Covenant University · 2026*
