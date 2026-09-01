# Time Track

A direct-access weekly employee time tracker with manager reporting and PDF exports.

## Stack

- Next.js 16, React 19, TypeScript, and Tailwind CSS 4
- PostgreSQL and Prisma ORM
- Recharts, React PDF, Zod, and Vitest

## Application Flow

The home page offers Employee and Manager modes. Employee mode stores the selected employee ID in a convenience cookie so refreshes retain the selection; it is not authentication. Manager mode is intentionally public and opens the team view directly.

```text
Home -> Employee selection -> Weekly timesheet
Home -> Manager view -> Team timesheets
```

Employee records, weekly timesheets, and daily minutes remain in PostgreSQL. Server actions own validated mutations, while route handlers provide data and weekly PDF downloads.

## Local Setup

```bash
cp .env.example .env
docker compose up -d
npm install
npm run db:generate
npm run db:migrate
npm run db:seed
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). No credentials are required.

## Commands

```bash
npm run dev
npm run build
npm run lint
npm test
npm run db:migrate
npm run db:seed
npm run db:studio
```

For production, configure `DATABASE_URL`, run `prisma migrate deploy`, and deploy behind HTTPS. This intentionally open version provides no access control; real authorization can be added later without changing the time-calculation or persistence layers.
