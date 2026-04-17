# Requirements Document

## Introduction

The Admin Recipes Management module allows Ayola Foods administrators to create, edit, view, and delete recipes through the existing admin panel at `/admin`. Recipes are currently defined as static data in `website/src/lib/recipes.ts`; this feature migrates them to a Supabase-backed database and provides a full CRUD interface consistent with the existing admin UI (Tailwind CSS, lucide-react icons, card/table design pattern). The public-facing recipes section at `/recipes` will continue to work, reading from Supabase instead of the static file.

## Glossary

- **Admin_Panel**: The protected admin interface at `/admin`, accessible only to authenticated admin users.
- **Recipe**: A content record containing a title, slug, excerpt, rich-text content, category, video embed details, metadata (prep time, servings, difficulty), ingredients list, tags, author, publish date, featured flag, and an optional related product reference.
- **Recipe_List_Page**: The admin page at `/admin/recipes` that displays all recipes in a paginated, searchable table.
- **Recipe_Form**: The shared form component used for both creating and editing a recipe.
- **Recipe_Detail_Page**: The admin read-only view of a single recipe at `/admin/recipes/[id]`.
- **Supabase**: The PostgreSQL-backed database and storage service used by the project.
- **Slug**: A URL-safe, lowercase, hyphen-separated string that uniquely identifies a recipe (e.g., `ceo-making-pilau`).
- **Video_Platform**: One of `youtube`, `facebook`, `instagram`, or `tiktok`.
- **Category**: One of `cooking-demo`, `beverage`, `how-to`, or `health-tip`.
- **Difficulty**: One of `Easy`, `Medium`, or `Advanced`.

---

## Requirements

### Requirement 1: Database Schema

**User Story:** As a developer, I want a Supabase `recipes` table that mirrors the existing `Recipe` interface, so that recipe data is persisted and queryable.

#### Acceptance Criteria

1. THE Supabase database SHALL contain a `recipes` table with columns: `id` (UUID, primary key), `slug` (text, unique, not null), `title` (text, not null), `excerpt` (text, not null), `content` (text, not null), `category` (text, not null), `video_url` (text, not null), `video_platform` (text, not null), `video_thumbnail_url` (text, nullable), `prep_time` (text, nullable), `servings` (text, nullable), `difficulty` (text, not null), `ingredients` (text array, nullable), `tags` (text array, not null, default `{}`), `author` (text, not null), `date` (date, not null), `featured` (boolean, not null, default false), `related_product` (text, nullable), `is_published` (boolean, not null, default true), `created_at` (timestamptz, not null, default now()), `updated_at` (timestamptz, not null, default now()).
2. THE Supabase database SHALL enforce a unique constraint on the `slug` column of the `recipes` table.
3. WHEN a recipe row is updated, THE Supabase database SHALL automatically set `updated_at` to the current timestamp via a trigger.
4. THE Supabase database SHALL enforce a check constraint on `category` to allow only the values `cooking-demo`, `beverage`, `how-to`, and `health-tip`.
5. THE Supabase database SHALL enforce a check constraint on `difficulty` to allow only the values `Easy`, `Medium`, and `Advanced`.
6. THE Supabase database SHALL enforce a check constraint on `video_platform` to allow only the values `youtube`, `facebook`, `instagram`, and `tiktok`.

---

### Requirement 2: List Recipes

**User Story:** As an admin, I want to view all recipes in a paginated table, so that I can quickly scan and manage the recipe catalog.

#### Acceptance Criteria

1. WHEN an admin navigates to `/admin/recipes`, THE Recipe_List_Page SHALL display all recipes in a table with columns: thumbnail/title, category, difficulty, author, publish date, featured status, and actions.
2. THE Recipe_List_Page SHALL support server-side pagination with 20 recipes per page and display total recipe count.
3. WHEN an admin enters text in the search field, THE Recipe_List_Page SHALL filter recipes by title or slug, resetting to page 1.
4. WHEN an admin selects a category from the filter dropdown, THE Recipe_List_Page SHALL filter recipes to show only those matching the selected category, resetting to page 1.
5. WHEN an admin selects a difficulty from the filter dropdown, THE Recipe_List_Page SHALL filter recipes to show only those matching the selected difficulty, resetting to page 1.
6. WHILE recipes are loading, THE Recipe_List_Page SHALL display skeleton placeholder rows in place of recipe data.
7. WHEN no recipes match the active filters, THE Recipe_List_Page SHALL display an empty state with an icon and descriptive message.
8. THE Recipe_List_Page SHALL display an "Add Recipe" button that navigates to `/admin/recipes/new`.

---

### Requirement 3: Create Recipe

**User Story:** As an admin, I want to create a new recipe with all required fields, so that it appears on the public recipes page.

#### Acceptance Criteria

1. WHEN an admin navigates to `/admin/recipes/new`, THE Admin_Panel SHALL display the Recipe_Form pre-populated with empty/default values.
2. THE Recipe_Form SHALL include fields for: title, slug (auto-generated from title, editable), excerpt, content (rich text or textarea), category (select), video URL, video platform (select), video thumbnail URL (optional), prep time (optional), servings (optional), difficulty (select), ingredients (dynamic list), tags (comma-separated or tag input), author, date, featured (toggle), related product (optional text), and is_published (toggle).
3. WHEN an admin types in the title field, THE Recipe_Form SHALL automatically populate the slug field by converting the title to lowercase, replacing spaces with hyphens, and removing non-alphanumeric characters, unless the admin has manually edited the slug.
4. WHEN an admin submits the Recipe_Form with all required fields valid, THE Admin_Panel SHALL send a POST request to `/api/admin/recipes`, create the recipe in Supabase, and redirect to `/admin/recipes`.
5. IF the submitted slug already exists in the `recipes` table, THEN THE Admin_Panel SHALL display an inline error on the slug field without navigating away.
6. IF any required field is empty on form submission, THEN THE Recipe_Form SHALL display an inline validation error for each missing field without submitting.
7. WHEN a recipe is successfully created, THE Admin_Panel SHALL display a success toast notification.

---

### Requirement 4: Edit Recipe

**User Story:** As an admin, I want to edit an existing recipe, so that I can update its content, metadata, or visibility.

#### Acceptance Criteria

1. WHEN an admin clicks the edit action for a recipe in the list, THE Admin_Panel SHALL navigate to `/admin/recipes/[id]/edit`.
2. WHEN the edit page loads, THE Recipe_Form SHALL be pre-populated with the existing recipe data fetched from Supabase.
3. WHEN an admin submits the Recipe_Form with valid data, THE Admin_Panel SHALL send a PATCH request to `/api/admin/recipes/[id]`, update the recipe in Supabase, and display a success toast.
4. IF the updated slug conflicts with another recipe's slug, THEN THE Admin_Panel SHALL display an inline error on the slug field without saving.
5. WHEN an admin toggles the `is_published` field and saves, THE Admin_Panel SHALL update the recipe's published status in Supabase, and the public recipes page SHALL reflect the change on next load.
6. WHEN an admin toggles the `featured` field and saves, THE Admin_Panel SHALL update the recipe's featured status in Supabase.

---

### Requirement 5: View Recipe Detail

**User Story:** As an admin, I want to view a read-only detail page for a recipe, so that I can review its full content before or after editing.

#### Acceptance Criteria

1. WHEN an admin clicks the view action for a recipe in the list, THE Admin_Panel SHALL navigate to `/admin/recipes/[id]`.
2. THE Recipe_Detail_Page SHALL display all recipe fields in a structured, read-only layout consistent with the admin card design pattern.
3. THE Recipe_Detail_Page SHALL include an "Edit" button that navigates to `/admin/recipes/[id]/edit`.
4. THE Recipe_Detail_Page SHALL include a "Back to Recipes" link that navigates to `/admin/recipes`.
5. WHEN the recipe has a video URL, THE Recipe_Detail_Page SHALL display the video platform and URL as a clickable link.

---

### Requirement 6: Delete Recipe

**User Story:** As an admin, I want to delete a recipe, so that outdated or incorrect recipes are removed from the catalog.

#### Acceptance Criteria

1. WHEN an admin clicks the delete action for a recipe in the list, THE Admin_Panel SHALL display a confirmation dialog showing the recipe title.
2. WHEN an admin confirms deletion in the dialog, THE Admin_Panel SHALL send a DELETE request to `/api/admin/recipes/[id]`, remove the recipe from Supabase, and display a success toast.
3. WHEN an admin cancels the deletion dialog, THE Admin_Panel SHALL close the dialog without making any changes.
4. IF the DELETE request fails, THEN THE Admin_Panel SHALL display an error toast with a descriptive message and keep the recipe in the list.
5. WHEN a recipe is successfully deleted, THE Recipe_List_Page SHALL refresh to reflect the removal.

---

### Requirement 7: API Endpoints

**User Story:** As a developer, I want RESTful API routes for recipe CRUD operations, so that the admin UI can interact with Supabase securely.

#### Acceptance Criteria

1. THE Admin_Panel SHALL expose a `GET /api/admin/recipes` endpoint that accepts query parameters `q` (search), `category`, `difficulty`, `page`, and `per_page`, and returns a paginated list of recipes with total count.
2. THE Admin_Panel SHALL expose a `POST /api/admin/recipes` endpoint that accepts a recipe payload, validates required fields, and inserts a new row into the `recipes` table.
3. THE Admin_Panel SHALL expose a `GET /api/admin/recipes/[id]` endpoint that returns a single recipe by ID.
4. THE Admin_Panel SHALL expose a `PATCH /api/admin/recipes/[id]` endpoint that accepts a partial recipe payload and updates the matching row in the `recipes` table.
5. THE Admin_Panel SHALL expose a `DELETE /api/admin/recipes/[id]` endpoint that removes the matching row from the `recipes` table.
6. WHEN a request to any `/api/admin/recipes` endpoint is made by an unauthenticated user, THE Admin_Panel SHALL return a 401 Unauthorized response.
7. IF a `POST` or `PATCH` request contains a slug that conflicts with an existing recipe, THEN THE Admin_Panel SHALL return a 409 Conflict response with a descriptive error message.

---

### Requirement 8: Public Recipes Integration

**User Story:** As a developer, I want the public-facing recipes section to read from Supabase instead of the static file, so that admin-managed recipes are reflected on the website.

#### Acceptance Criteria

1. THE public `/recipes` page SHALL fetch recipes from Supabase and display only those where `is_published` is true.
2. THE public `/recipes/[slug]` page SHALL fetch a single recipe from Supabase by slug and display it, returning a 404 if not found or not published.
3. WHEN a recipe's `is_published` field is set to false by an admin, THE public `/recipes` page SHALL no longer display that recipe on next load.
4. THE public recipes data-fetching logic SHALL be extracted into reusable server-side functions in `website/src/lib/recipes.ts` (or a new `website/src/lib/recipes-db.ts`) that query Supabase.

---

### Requirement 9: Admin Navigation

**User Story:** As an admin, I want a "Recipes" link in the admin sidebar, so that I can navigate to the recipes management section easily.

#### Acceptance Criteria

1. THE Admin_Panel sidebar SHALL include a "Recipes" navigation item with an appropriate icon, linking to `/admin/recipes`.
2. WHEN the current path starts with `/admin/recipes`, THE Admin_Panel sidebar SHALL highlight the "Recipes" navigation item as active.
3. THE "Recipes" navigation item SHALL be visible only to users with the `admin` role, consistent with the existing role-based sidebar filtering pattern.
