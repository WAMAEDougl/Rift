# Implementation Plan: Admin Recipes Management

## Overview

Migrate static recipe data from `website/src/lib/recipes.ts` to a Supabase-backed database and build a full CRUD admin interface at `/admin/recipes`, consistent with the existing products/payments admin UI. Public recipe pages are updated to read from Supabase. The implementation follows the order: DB schema → API layer → Admin UI → Public integration → Navigation.

## Tasks

- [x] 1. Create Supabase database schema for recipes
  - Write a SQL migration file at `website/src/lib/migrations/recipes.sql` (or apply directly via Supabase dashboard) that creates the `recipes` table with all columns: `id` (UUID PK), `slug` (unique, not null), `title`, `excerpt`, `content`, `category`, `video_url`, `video_platform`, `video_thumbnail_url`, `prep_time`, `servings`, `difficulty`, `ingredients` (text[]), `tags` (text[], default `{}`), `author`, `date` (date), `featured` (bool, default false), `related_product`, `is_published` (bool, default true), `created_at`, `updated_at`
  - Add check constraints on `category` (`cooking-demo`, `beverage`, `how-to`, `health-tip`), `difficulty` (`Easy`, `Medium`, `Advanced`), and `video_platform` (`youtube`, `facebook`, `instagram`, `tiktok`)
  - Add a `moddatetime` or custom trigger to auto-update `updated_at` on row update
  - Seed the table with the 6 existing recipes from `website/src/lib/recipes.ts` so no data is lost
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6_

- [x] 2. Create API validation schema and shared types
  - Create `website/src/app/api/admin/recipes/schema.ts` with a Zod `recipeSchema` (POST) and `recipePatchSchema` (PATCH), mirroring the pattern in `website/src/app/api/admin/products/schema.ts`
  - Define a shared `RecipeRow` TypeScript interface covering all DB columns, exported from `website/src/lib/types/recipe.ts` (or inline in the schema file)
  - _Requirements: 7.2, 7.4_

- [x] 3. Implement `GET /api/admin/recipes` and `POST /api/admin/recipes`
  - Create `website/src/app/api/admin/recipes/route.ts`
  - `GET`: authenticate with `requireAdminSession`, accept query params `q` (title/slug ilike), `category`, `difficulty`, `page`, `per_page` (default 20), return paginated response using `paginatedResponse` helper; order by `created_at DESC`
  - `POST`: authenticate with `requireAdminSession("admin")`, validate body with `recipeSchema`, check slug uniqueness (return 409 on conflict), insert into `recipes` table, return 201 with created row
  - _Requirements: 7.1, 7.2, 7.6, 7.7_

- [x] 4. Implement `GET`, `PATCH`, and `DELETE /api/admin/recipes/[id]`
  - Create `website/src/app/api/admin/recipes/[id]/route.ts`
  - `GET`: authenticate, fetch single recipe by `id`, return 404 if not found
  - `PATCH`: authenticate with `requireAdminSession("admin")`, validate body with `recipePatchSchema`, check slug uniqueness excluding current id (return 409 on conflict), update row, return updated row
  - `DELETE`: authenticate with `requireAdminSession("admin")`, delete row by `id`, return 200 with `{ deleted: true }`
  - _Requirements: 7.3, 7.4, 7.5, 7.6, 7.7_

- [x] 5. Checkpoint — Verify API layer
  - Ensure all four route files compile without TypeScript errors (`tsc --noEmit` in `website/`)
  - Manually verify auth guard returns 401 for unauthenticated requests (or write a quick curl test)
  - Ask the user if any API behaviour needs adjustment before building the UI

- [x] 6. Create the admin recipes list page
  - Create `website/src/app/admin/(protected)/recipes/page.tsx` as a `"use client"` component, mirroring the structure of `website/src/app/admin/(protected)/products/page.tsx`
  - Fetch from `GET /api/admin/recipes` with `page`, `q`, `category`, and `difficulty` query params
  - Render a table with columns: title/slug, category badge, difficulty badge, author, date, featured status, published status, and actions (view, edit, delete)
  - Show skeleton rows (8 rows) while loading, using `@/components/ui/skeleton`
  - Show empty state with `BookOpen` icon and message when no recipes match filters
  - Include "Add Recipe" button linking to `/admin/recipes/new`
  - Include server-side pagination controls (same `getPageNumbers` pattern as products page)
  - Include search input (filters by title/slug), category dropdown, and difficulty dropdown; all reset to page 1 on change
  - Include a "Clear" button to reset all filters
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8_

- [x] 7. Implement delete confirmation dialog on the list page
  - Add `deleteTarget` state (type `RecipeRow | null`) and a `Dialog` from `@/components/ui/dialog` (same pattern as products page)
  - On confirm: call `DELETE /api/admin/recipes/[id]`, show success toast via `sonner`, refresh list; on error show error toast and keep dialog open
  - On cancel: close dialog without changes
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

- [x] 8. Create the shared `RecipeForm` component
  - Create `website/src/components/admin/RecipeForm.tsx` as a `"use client"` component
  - Include all fields from Requirement 3.2: title, slug (auto-generated from title unless manually edited), excerpt, content (textarea), category (select: cooking-demo / beverage / how-to / health-tip), video URL, video platform (select), video thumbnail URL (optional), prep time (optional), servings (optional), difficulty (select: Easy / Medium / Advanced), ingredients (dynamic add/remove list), tags (comma-separated input), author, date, featured (toggle), related product (optional text), is_published (toggle)
  - Implement slug auto-generation: on title change, if slug has not been manually edited, derive slug by lowercasing, replacing spaces with hyphens, and stripping non-alphanumeric characters (Requirement 3.3)
  - Implement inline required-field validation on submit (Requirement 3.6)
  - Accept `initialData` prop (for edit pre-population) and `onSubmit` callback prop
  - _Requirements: 3.1, 3.2, 3.3, 3.6_

- [x] 9. Create the "new recipe" page
  - Create `website/src/app/admin/(protected)/recipes/new/page.tsx`
  - Render `RecipeForm` with empty/default initial values
  - On submit: POST to `/api/admin/recipes`; on 409 show inline slug error; on success show toast and `router.push("/admin/recipes")`
  - _Requirements: 3.1, 3.4, 3.5, 3.7_

- [x] 10. Create the recipe edit page
  - Create `website/src/app/admin/(protected)/recipes/[id]/edit/page.tsx`
  - On mount: fetch recipe from `GET /api/admin/recipes/[id]` and pre-populate `RecipeForm`
  - On submit: PATCH to `/api/admin/recipes/[id]`; on 409 show inline slug error; on success show toast (stay on page or redirect — match products pattern)
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6_

- [x] 11. Create the recipe detail (view) page
  - Create `website/src/app/admin/(protected)/recipes/[id]/page.tsx`
  - Fetch recipe from `GET /api/admin/recipes/[id]` and render all fields in a structured read-only card layout consistent with the admin card design pattern
  - Display video platform and URL as a clickable link (Requirement 5.5)
  - Include "Edit" button linking to `/admin/recipes/[id]/edit` and "Back to Recipes" link to `/admin/recipes`
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [x] 12. Checkpoint — Verify admin UI
  - Ensure all admin pages and the `RecipeForm` component compile without TypeScript errors
  - Verify create → list → edit → delete flow works end-to-end in the browser
  - Ask the user if any UI behaviour or layout needs adjustment before migrating public pages

- [x] 13. Create Supabase data-fetching helpers for public pages
  - Create `website/src/lib/recipes-db.ts` with server-side functions:
    - `getPublishedRecipes(category?: string): Promise<Recipe[]>` — queries `recipes` where `is_published = true`, optionally filtered by category, ordered by `date DESC`
    - `getPublishedRecipeBySlug(slug: string): Promise<Recipe | null>` — queries `recipes` where `slug = $slug AND is_published = true`
    - `getAllRecipeSlugs(): Promise<string[]>` — returns all slugs for `generateStaticParams` (or switch to dynamic rendering)
  - Map DB column names (snake_case) back to the existing `Recipe` interface shape so downstream components need no changes
  - Use the public Supabase client (not admin) since these are read-only public queries
  - _Requirements: 8.1, 8.2, 8.3, 8.4_

- [x] 14. Migrate public `/recipes` page to Supabase
  - Update `website/src/app/recipes/page.tsx` to call `getPublishedRecipes()` from `website/src/lib/recipes-db.ts` instead of importing from `website/src/lib/recipes.ts`
  - Remove the static `recipes` and `recipeCategories` imports; keep `recipeCategories` as a local constant (it's UI-only) or export it from `recipes-db.ts`
  - Ensure only `is_published = true` recipes are shown (Requirement 8.1, 8.3)
  - _Requirements: 8.1, 8.3_

- [x] 15. Migrate public `/recipes/[slug]` page to Supabase
  - Update `website/src/app/recipes/[slug]/page.tsx` to call `getPublishedRecipeBySlug(slug)` from `website/src/lib/recipes-db.ts`
  - Update `generateStaticParams` to call `getAllRecipeSlugs()` (or remove it and use `dynamicParams = true` with `force-dynamic` if preferred)
  - Return `notFound()` when the recipe is not found or `is_published` is false (Requirement 8.2)
  - _Requirements: 8.2, 8.3_

- [x] 16. Add "Recipes" navigation item to the admin sidebar
  - Edit `website/src/components/admin/AdminSidebar.tsx`
  - Import `BookOpen` from `lucide-react`
  - Add `{ label: "Recipes", href: "/admin/recipes", icon: BookOpen, exact: false }` to `allNavItems`, positioned after "Products" (before "Categories")
  - The item is already admin-only by virtue of the `kitchenNavItems` allowlist — kitchen users will not see it unless explicitly added
  - The existing `isActive` logic handles path-prefix matching, so `/admin/recipes/*` will highlight the item automatically
  - _Requirements: 9.1, 9.2, 9.3_

- [x] 17. Final checkpoint — End-to-end verification
  - Ensure all TypeScript files compile without errors (`tsc --noEmit` in `website/`)
  - Verify the full admin flow: sidebar nav → list page → create → edit → delete
  - Verify public `/recipes` and `/recipes/[slug]` pages render data from Supabase
  - Verify that unpublishing a recipe via the admin hides it from the public page on next load
  - Ask the user if any final adjustments are needed

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP
- Each task references specific requirements for traceability
- The `RecipeForm` component (Task 8) is shared between the new (Task 9) and edit (Task 10) pages — build it first
- The public migration (Tasks 13–15) is intentionally last to avoid breaking the live site before the admin UI is ready
- `website/src/lib/recipes.ts` can be kept as a fallback/reference during development and removed once the Supabase migration is confirmed working
