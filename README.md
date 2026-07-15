# Advanced Next.js Project Management SaaS

A full-stack SaaS platform for project and task management built with modern web technologies.

## Architecture

This project follows a modular Feature-Sliced Design (FSD) architecture:

- `src/app/`: Next.js App Router and pages (Authentication, Dashboard, Projects, Admin, etc.)
- `src/features/`: Isolated business features (`projects`, `tasks`, `members`, `notifications`)
- `src/entities/`: Domain models and schemas (`user`, `workspace`, `project`, `task`, `comment`, `notification`, `audit`)
- `src/shared/`: Shared utilities, UI components, and hooks (`ui`, `hooks`, `utils`)
- `src/server/`: Server-side code including Server Actions, Services, and Database configuration (`actions`, `db`, `services`)

## Tech Stack

- **Frontend**: Next.js 16 (App Router), TypeScript, React Server Components, TanStack Query, React Hook Form, Zod, Tailwind CSS, shadcn/ui
- **Backend**: Next.js Server Actions, PostgreSQL, Drizzle ORM
- **Infrastructure**: Redis, BullMQ, Docker
- **Auth**: Better Auth / Auth.js

## Local Setup

1. Copy `.env.example` to `.env` and fill in the values.
2. Start the local database and redis via Docker: `docker-compose up -d`
3. Install dependencies: `npm install`
4. Run database migrations (e.g. `npx drizzle-kit push`)
5. Start the development server: `npm run dev`
