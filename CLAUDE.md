# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Gastify** — Personal finance PWA for tracking income (entradas) and expenses (salidas). Inspired by Monai's minimal aesthetic. Mobile-first, installable, no auth required (optional Supabase Auth).

## Commands

```bash
npm run dev          # Start dev server with Turbopack (http://localhost:3000)
npm run build        # Production build (runs prisma generate first)
npm run start        # Serve production build
npm run lint         # ESLint
npm run db:generate  # Regenerate Prisma client after schema changes
npm run db:push      # Push schema changes to database
npm run db:studio    # Open Prisma Studio (DB GUI)
```

## Tech Stack

- **Next.js 16** (App Router) — pages are client components, data flows through API Route Handlers
- **TypeScript** (strict mode)
- **Tailwind CSS v4** — using CSS custom properties for theming, `@custom-variant dark` for dark mode via class strategy
- **Prisma 7** — ORM with `@prisma/adapter-pg` connecting to Supabase PostgreSQL
- **Supabase** — PostgreSQL hosting (connection via `DATABASE_URL`)
- **Recharts** — pie and bar charts on `/estadisticas`
- **date-fns** with `es` locale — all date formatting in Spanish
- **PWA** — manual service worker (`public/sw.js`) + `manifest.json`

## Architecture

### Data Flow

Client components → `fetch("/api/...")` → Next.js Route Handlers → Prisma → Supabase PostgreSQL

Pages use custom hooks from `src/lib/hooks.ts` that call API routes via `fetch()`. All database access happens server-side through Prisma in the Route Handlers under `src/app/api/`.

### API Routes

| Route | Methods | Purpose |
|-------|---------|---------|
| `/api/registros` | GET, POST, PUT, DELETE | CRUD for registros (income/expenses) |
| `/api/registros/balance` | GET | Current month's totals |
| `/api/registros/delete-all` | DELETE | Wipe all registros |
| `/api/categorias` | GET, POST, PUT, DELETE | CRUD for categorías |
| `/api/estadisticas` | GET | Registros filtered by date range |
| `/api/exportar` | GET | All registros for CSV export |

### State Coordination

Components communicate via `CustomEvent` on `window`:
- `"registro-saved"` — dispatched after creating/updating/deleting a registro; all pages listen to refetch data
- `"moneda-changed"` — dispatched when currency changes in settings; components re-read from localStorage

The `ClientLayout` (`src/app/client-layout.tsx`) manages the NuevoRegistro modal state and passes a `refreshKey` to force re-mount of pages when data changes.

### Theming

Colors are CSS custom properties defined in `globals.css` (not Tailwind config). Dark mode toggles the `.dark` class on `<html>`. Theme preference is stored in `localStorage` as `gastify_theme`. Currency preference is stored as `gastify_moneda`.

### Database

Two Prisma models: `Categoria` (→ `categorias` table) and `Registro` (→ `registros` table). Schema in `prisma/schema.prisma`, SQL seed in `supabase/seed.sql`. The Prisma singleton is in `src/lib/prisma.ts` using `@prisma/adapter-pg`.

### Key Patterns

- All monetary values use `Decimal(12,2)` in Prisma, serialized to `number` in API responses
- API routes serialize `Date` → ISO string and `Decimal` → `Number` before returning JSON
- Categories use emojis as their primary visual identifier (rendered at `text-2xl` minimum)
- The FAB (floating action button) in the Navbar opens a bottom-sheet modal for quick entry
- UI uses CSS custom properties (e.g., `var(--color-accent)`) rather than Tailwind color classes for the custom palette

## Environment Variables

```
DATABASE_URL=postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres
```

## Setup

1. Create a Supabase project
2. Run `supabase/schema.sql` and `supabase/seed.sql` in the SQL Editor
3. Copy the database connection string to `.env.local` as `DATABASE_URL`
4. `npm install && npm run db:generate && npm run dev`
