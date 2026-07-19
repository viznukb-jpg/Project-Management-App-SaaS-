# Advanced Next.js Project Management SaaS

A full-stack SaaS platform for project and task management built with modern web technologies.

## Architecture

This project follows a modular Feature-Sliced Design (FSD) architecture:

- `src/app/`: Next.js App Router and pages (Authentication, Dashboard, Projects, Admin, etc.)
- `src/features/`: Isolated business features (`projects`, `tasks`, `members`, `notifications`, `workspaces`, `attachments`, `profile`, `auth`)
- `src/entities/`: Domain models and schemas (`user`, `workspace`, `project`, `task`, `comment`, `notification`, `audit`)
- `src/shared/`: Shared utilities, UI components, and hooks (`ui`, `hooks`, `utils`, `store`, `providers`)
- `src/server/`: Server-side code including API route handlers, Services, Queue, Worker, and Database configuration (`db`, `services`)
- `src/widgets/`: Larger components composed of features and shared UI (e.g. `header`, `sidebar`)

## Tech Stack

- **Frontend**: Next.js 16 (App Router), TypeScript, React Server Components, TanStack Query, React Hook Form, Zod, Tailwind CSS, shadcn/ui
- **Backend**: Next.js Server Actions, PostgreSQL, Drizzle ORM
- **Infrastructure**: Redis, BullMQ, Docker
- **Auth**: Better Auth / Auth.js
- **Real-time & Storage**: Supabase

## Trade-offs

During development, several architectural trade-offs were made:
- **API Routes vs Server Actions**: Standard API Routes (`src/app/api/...`) are used for all mutations — **Server Actions are intentionally avoided**. Server Actions compile down to unauthenticated public POST endpoints under the hood. In a setup where the database runs in Docker or is accessible via a direct connection string (like Supabase's Transaction Pooler), a misconfigured or leaked Server Action can expose raw ORM access to anyone who can POST to the route. API Routes give us explicit auth middleware, clear HTTP semantics, and a safe boundary between client and server.
- **Supabase vs Local PostgreSQL**: Supabase is used as the primary database, Auth provider, Realtime engine (WebSockets), and Storage backend. Because Realtime task updates and File Attachments depend on Supabase-specific infrastructure (their `pg_net` extension, WebSocket gateway, and S3-compatible storage), **a local `postgres` container is not included in `docker-compose.yml`** — substituting it would silently break real-time subscriptions and file uploads.
- **Zustand vs URL state**: Zustand is used for `activeWorkspaceId` to persist user selection across browser sessions. URL-based state is used for search parameters in Kanban boards to allow easy linking and sharing.

## Environment Variables

Copy `.env.example` to `.env` and fill in the values:

- `DATABASE_URL`: Your PostgreSQL connection string. (e.g., `postgresql://postgres:password@localhost:5432/postgres` or Supabase Transaction Pooler URL).
- `REDIS_URL`: Connection string for Redis, used by BullMQ for background jobs.
- `AUTH_SECRET`: A secret string used by Better Auth to encrypt session tokens.
- `BETTER_AUTH_URL`: The base URL of your application (e.g., `http://localhost:3000`).
- `NEXT_PUBLIC_APP_URL`: Public URL used for generating links in emails/notifications.
- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase Project URL (Required for Attachments and Real-time).
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase Anon Key (used for client-side subscriptions).
- `SUPABASE_SERVICE_ROLE_KEY`: Supabase Service Role key (used for server-side signed URL generation).

## Database setup

**Important:** To use this application properly, you **MUST** use Supabase as your primary database. 
Set the `DATABASE_URL` in your `.env` file to your Supabase Transaction Pooler URL. 

We deliberately do not provide a local `postgres` Docker container because Real-time task updates and File Attachments rely on Supabase-specific infrastructure.

## Migration commands

We use Drizzle ORM. Standard commands:
- `npm run db:generate`: Generates migration files based on schema changes.
- `npm run db:migrate`: Applies generated migrations to the database.
- `npm run db:push`: Directly pushes schema changes to the database without generating migration files (useful for fast prototyping).
- `npm run db:studio`: Opens Drizzle Studio to inspect database tables locally.

## Seed

To populate the database with dummy data (5 users, 3 workspaces, 10 projects, 50 tasks), run:
```bash
npm run seed
```
**Warning:** This script will clear existing data in the tables before inserting new ones.

## Installation

1. Copy `.env.example` to `.env` and configure your variables.
2. Ensure you have Node.js 20+ installed.
3. Install dependencies: 
```bash
npm install
```

## Docker setup

You can run the background services using Docker Compose, which spins up the Next.js Web app, Background Worker, and Redis.

```bash
docker-compose up --build -d
```

The `docker-compose.yml` defines the following services:
- **web**: The Next.js frontend and backend APIs.
- **worker**: The BullMQ background worker executing delayed jobs.
- **redis**: Local Redis 7 for queueing.

*(Note: `postgres` is not included because the application requires Supabase for full functionality).*
