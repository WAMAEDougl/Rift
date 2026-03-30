# Website — Agent Instructions

Read `../CLAUDE.md` first. This file adds codebase-specific rules.

## Your Working Directory

All work happens inside `website/`. Do not create files outside this directory.

## Coding Conventions

### TypeScript
- Use TypeScript for all new files
- Use types from `src/lib/supabase/types.ts` for any database record shapes
- Use types from `src/types/api.ts` for API request/response shapes
- Do not use `any`. If you do not know the type, look it up in the existing type files.

### API Routes
- All admin API routes go under `src/app/api/admin/`
- All admin routes must be protected — check for an authenticated admin session before returning data
- Use the server Supabase client (`src/lib/supabase/server.ts`) in API routes and server components, never the browser client
- Use the browser Supabase client (`src/lib/supabase/client.ts`) only in client components
- Return consistent JSON: `{ data, error }` — match the pattern in existing routes

### Components
- Use shadcn/ui components where possible (Button, Table, Badge, Input, etc.)
  - Check `src/components/ui/` before building anything from scratch
- New admin components go in `src/components/admin/`
- Client components must have `"use client"` at the top
- Server components (default in App Router) must not use browser APIs or useState

### Styling
- Use Tailwind CSS utility classes only
- Do not write custom CSS unless Tailwind cannot achieve it
- Match the visual style of existing pages (spacing, font sizes, border radius)
- The admin UI should be clean and functional, not fancy

### Forms and Validation
- Use Zod for all input validation
- Check `src/lib/utils/validation.ts` for existing schemas before writing new ones

## Database Access Rules

- Never write raw SQL in application code — use the Supabase JS client
- All admin queries use the service role client (requires `SUPABASE_SERVICE_ROLE_KEY`)
- Never expose the service role key to the browser
- The `orders` table status field accepts: `pending`, `confirmed`, `preparing`, `ready`, `dispatched`, `delivered`, `cancelled`
  - For the admin dashboard, map these to: NEW (pending/confirmed), IN_PROGRESS (preparing/ready/dispatched), COMPLETED (delivered/cancelled)

## File Naming

- Pages: `page.tsx`
- Layouts: `layout.tsx`
- API routes: `route.ts`
- Components: PascalCase (`OrdersTable.tsx`)
- Utilities/helpers: camelCase (`orderUtils.ts`)

## What Not To Do

- Do not use `fetch()` in server components to call your own API routes — query Supabase directly
- Do not duplicate data fetching logic — check `src/lib/` before writing new helpers
- Do not install UI animation libraries — Framer Motion is already available if needed
- Do not create a new cart, auth, or product management system
- Do not add loading skeletons, empty states, or error boundaries unless the task explicitly requires it
