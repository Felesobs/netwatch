# NetWatch

A production-ready web application for monitoring monthly internet usage, built with Next.js 16, TypeScript, Prisma, and PostgreSQL.

## Features

- **Dashboard** — Usage ring hero, quota progress, daily average, month-end prediction, and historical comparison
- **Usage management** — Add, edit, delete records; import CSV; export CSV
- **Charts** — Daily bar, weekly/monthly trend, upload vs download (Recharts)
- **Reports** — Monthly, quarterly, and custom date ranges; export to CSV and PDF (client-side, jsPDF)
- **Notifications** — Threshold alerts at 50%, 80%, 90%, and 100% quota; in-app and browser notification channels
- **Settings** — Billing cycle day (1–28), data unit (MB/GB/TB), monthly quota, theme (light/dark/system)
- **PWA** — Installable, offline fallback page, service worker
- **Authentication** — JWT sessions via httpOnly cookies, bcrypt password hashing

## Stack

| Layer      | Technology                                |
|------------|-------------------------------------------|
| Framework  | Next.js 16 (App Router, Turbopack)        |
| Language   | TypeScript 5 (strict)                     |
| Styling    | Tailwind CSS v4                           |
| Data fetch | TanStack React Query v5                   |
| State      | Zustand v5                                |
| Charts     | Recharts v3                               |
| Database   | PostgreSQL 16 via Prisma 7                |
| Auth       | jose (JWT) + bcryptjs                     |
| Validation | Zod v4                                    |
| Testing    | Vitest + React Testing Library, Playwright |
| Deployment | Vercel + Supabase                         |

## Quick start

### Prerequisites

- Node.js 22+
- Docker (for the local PostgreSQL instance)
- `openssl` (to generate `AUTH_SECRET`)

### 1. Clone and install

```bash
git clone https://github.com/yourorg/netwatch.git
cd netwatch
npm install          # runs prisma generate via postinstall
```

### 2. Configure environment

```bash
cp .env.example .env.local
# Edit .env.local:
# - Set AUTH_SECRET to the output of: openssl rand -base64 32
# - Set DATABASE_URL if not using the Docker default
```

### 3. Start the database

```bash
docker compose up -d    # starts PostgreSQL on localhost:5432
```

### 4. Run migrations and seed

```bash
npm run db:migrate      # creates all tables
npm run db:seed         # creates demo user + 90 days of usage data
```

Demo credentials: `demo@netwatch.app` / `demo12345`

### 5. Start the dev server

```bash
npm run dev             # http://localhost:3000
```

## Scripts

| Command                | Description                                      |
|------------------------|--------------------------------------------------|
| `npm run dev`          | Start Next.js development server                 |
| `npm run build`        | Production build (runs `prisma generate` first)  |
| `npm run start`        | Start production server                          |
| `npm run typecheck`    | Run TypeScript compiler check                    |
| `npm run lint`         | ESLint                                           |
| `npm run format`       | Prettier (write)                                 |
| `npm run test`         | Vitest unit tests                                |
| `npm run test:watch`   | Vitest in watch mode                             |
| `npm run test:coverage`| Vitest with coverage report                      |
| `npm run test:e2e`     | Playwright end-to-end tests                      |
| `npm run db:migrate`   | Run Prisma migrations (dev)                      |
| `npm run db:migrate:deploy` | Run migrations (production/CI)              |
| `npm run db:seed`      | Seed the database with demo data                 |
| `npm run db:studio`    | Open Prisma Studio                               |
| `npm run db:reset`     | Drop and re-migrate (dev only)                   |
| `npm run ci`           | Full CI check: typecheck + lint + test + build   |

## Project structure

```
src/
├── app/
│   ├── (auth)/          # Login and register pages
│   ├── (dashboard)/     # Protected app shell
│   │   ├── dashboard/   # Dashboard page
│   │   ├── usage/       # Usage management
│   │   ├── reports/     # Reports page
│   │   └── settings/    # Settings page
│   └── api/             # API routes (auth, usage, summary, alerts, settings, reports)
├── components/
│   ├── ui/              # Primitive components (Button, Card, Input, UsageRing, …)
│   ├── dashboard/       # Dashboard-specific components
│   ├── usage/           # Usage table, form, import dialog
│   ├── reports/         # Date range picker, report table, export utilities
│   ├── settings/        # Settings form sections
│   ├── charts/          # Recharts wrappers (daily, trend, upload/download)
│   ├── layout/          # Sidebar, mobile tab bar, page header, theme toggle
│   └── providers/       # React Query, Theme, Toast, Service Worker providers
├── hooks/               # React Query hooks and custom hooks
├── lib/
│   ├── api/             # Response helpers and withErrorHandling
│   ├── auth/            # JWT session, password hashing, current-user resolver
│   ├── api-client.ts    # Typed fetch wrapper for same-origin API routes
│   └── prisma.ts        # Prisma client singleton (dev hot-reload safe)
├── services/            # Business logic (auth, usage, summary, alerts, settings, reports)
├── stores/              # Zustand stores (display preferences, UI state)
├── types/               # Domain types (mirrors Prisma models with plain-JS values)
├── utils/               # Pure utilities (billing cycle math, formatting, cn)
└── proxy.ts             # Route protection proxy (Next.js 16)
prisma/
├── schema.prisma        # Database schema
├── migrations/          # SQL migrations
└── seed.ts              # Development seed script
tests/
├── unit/                # Vitest unit & component tests
└── e2e/                 # Playwright end-to-end tests
```

## Architecture decisions

### Why materialized `MonthlySummary`?

The dashboard reads the current month summary on every page load. Computing it inline from raw `UsageRecord` rows with an `aggregate()` every request would be fine at small scale but adds latency as record counts grow. We persist a `MonthlySummary` row, recomputed on every usage record write (create/update/delete). Dashboard reads are O(1) queries. The write overhead is one extra `upsert` per user record write, which is negligible.

### Why JWT cookies instead of database sessions?

Stateless JWT sessions need no session table and no session-invalidation query on every request — the proxy checks the cookie signature cryptographically. Trade-off: tokens live until their 30-day expiry unless the `AUTH_SECRET` is rotated. For a personal usage-monitoring app this is an appropriate trade-off. A future version could add a token-revocation table if multi-device logout is needed.

### Why no Radix UI / shadcn?

The "minimal dependencies" requirement in the brief is genuine — fewer dependencies means fewer supply chain attack surfaces, faster installs, and no risk of upstream breaking changes in major components. All UI primitives are hand-written; the only exceptions are Recharts (charting is genuinely hard to do from scratch) and sonner (toast positioning and accessibility is subtle). The native `<dialog>` element handles modal focus trapping and Escape-to-close without a dependency.

### Why `proxy.ts` (not `middleware.ts`)?

Next.js 16 renamed `middleware.ts` to `proxy.ts` to clarify its network-boundary semantics. See the [migration guide](https://nextjs.org/docs/messages/middleware-to-proxy). The proxy only checks the JWT cookie — it does **not** hit the database. Full authentication happens in API routes and server components.

## Deployment

### Vercel + Supabase

1. Create a Supabase project and copy the **pooled connection string** (port 6543) as `DATABASE_URL` and the **direct connection string** (port 5432) as `DIRECT_URL`.

2. Add environment variables in Vercel:
   ```
   DATABASE_URL=postgresql://...@aws-0-xx-xxx.pooler.supabase.com:6543/postgres?pgbouncer=true
   DIRECT_URL=postgresql://...@aws-0-xx-xxx.supabase.com:5432/postgres
   AUTH_SECRET=<openssl rand -base64 32>
   NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
   ```

3. Update `prisma/schema.prisma` to add the `directUrl`:
   ```prisma
   datasource db {
     provider  = "postgresql"
     url       = env("DATABASE_URL")
     directUrl = env("DIRECT_URL")
   }
   ```

4. Add a build command in Vercel: `prisma migrate deploy && next build`

5. Deploy. Prisma Migrate runs on every deployment; only forward migrations are applied.

## Testing

```bash
# Unit tests (36 tests, ~9s)
npm run test

# With coverage
npm run test:coverage

# E2E (requires running app + database)
npm run db:seed
npm run build && npm run start &
npm run test:e2e
```

## License

MIT
