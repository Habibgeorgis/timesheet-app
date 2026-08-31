# Tempo Timesheets

Production-oriented employee time tracking with weekly timesheets, manager approvals, audit history, charts, and PDF reports.

## Stack

- Next.js 16 App Router, React 19, TypeScript, and Tailwind CSS 4
- PostgreSQL 16 and Prisma ORM
- Database-backed opaque sessions, bcrypt password hashing, HTTP-only cookies, and role guards
- Recharts for reporting and React PDF for downloadable weekly records
- Zod validation and Vitest unit tests

## Architecture

```text
src/
  actions/        authenticated mutations and workflow transitions
  app/            pages, layouts, REST endpoints, and report downloads
  components/     reusable application and chart components
  lib/            auth, database, validation, dates, and PDF documents
prisma/
  migrations/     checked-in PostgreSQL migration history
  schema.prisma   relational domain model
  seed.ts         deterministic development accounts and sample data
```

Server components query Prisma directly for page reads. Server actions own validated UI mutations. Route handlers provide integration endpoints and binary PDF responses. Every privileged operation verifies the session and role on the server; UI visibility is not treated as authorization.

## Local setup

Requirements: Node.js 20.9+, npm, and Docker.

```bash
cp .env.example .env
docker compose up -d
npm install
npm run db:generate
npm run db:migrate
npm run db:seed
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Development accounts use `Timesheet123!`:

- `employee@acme.test` - employee workflow
- `manager@acme.test` - manager approval and team reporting

## Commands

```bash
npm run dev          # development server
npm run build        # production build
npm run lint         # static checks
npm test             # unit tests
npm run db:migrate   # create/apply development migrations
npm run db:seed      # load development data
npm run db:studio    # inspect data with Prisma Studio
```

## Production notes

Use a managed PostgreSQL database, a unique database role, TLS, and platform-managed secrets. Set `DATABASE_URL`, `APP_URL`, and `SESSION_COOKIE_NAME`; run `prisma migrate deploy` as a release step. The session cookie automatically becomes `Secure` in production. Production seeding requires a strong `SEED_PASSWORD`; the development fallback is never shown in production. Put the application behind HTTPS and add scheduled cleanup for expired `Session` records.

The `/api/health` endpoint verifies database connectivity. `/api/timesheets` exposes the signed-in employee's records, and `/api/reports/timesheets/:id` enforces owner/manager access before returning a PDF.
