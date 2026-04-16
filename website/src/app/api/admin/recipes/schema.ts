import { z } from "zod";

// Allow empty string or valid URL or null/undefined for optional URL fields
const optionalUrlField = z
  .string()
  .optional()
  .nullable()
  .transform((v) => (v === "" ? null : v))
  .refine((v) => v === null || v === undefined || /^https?:\/\/.+/.test(v), {
    message: "Must be a valid URL",
  });

// Required URL field — uses regex instead of z.string().url() which rejects
// valid social media URLs containing query params (e.g. YouTube ?v=...)
const requiredUrlField = z
  .string()
  .min(1, { message: "URL is required" })
  .refine((v) => /^https?:\/\/.+/.test(v), { message: "Must be a valid URL starting with http:// or https://" });

export const recipeSchema = z.object({
  title: z.string().min(1),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  excerpt: z.string().min(1),
  content: z.string().min(1),
  category: z.enum(["cooking-demo", "beverage", "how-to", "health-tip"]),
  cover_image_url: optionalUrlField,
  video_url: optionalUrlField,
  video_platform: z.enum(["youtube", "facebook", "instagram", "tiktok"]).optional().nullable(),
  video_thumbnail_url: optionalUrlField,
  prep_time: z.string().optional().nullable(),
  servings: z.string().optional().nullable(),
  difficulty: z.enum(["Easy", "Medium", "Advanced"]),
  ingredients: z.array(z.string()).optional().nullable(),
  tags: z.array(z.string()).default([]),
  author: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, {
    message: "Date must be in YYYY-MM-DD format",
  }),
  featured: z.boolean().default(false),
  related_product: z.string().optional().nullable(),
  is_published: z.boolean().default(true),
});

// Partial schema without defaults — used for PATCH so only provided fields are sent
export const recipePatchSchema = z.object({
  title: z.string().min(1).optional(),
  slug: z.string().regex(/^[a-z0-9-]+$/).optional(),
  excerpt: z.string().min(1).optional(),
  content: z.string().min(1).optional(),
  category: z.enum(["cooking-demo", "beverage", "how-to", "health-tip"]).optional(),
  cover_image_url: optionalUrlField,
  video_url: requiredUrlField.optional(),
  video_platform: z.enum(["youtube", "facebook", "instagram", "tiktok"]).optional(),
  video_thumbnail_url: optionalUrlField,
  prep_time: z.string().optional().nullable(),
  servings: z.string().optional().nullable(),
  difficulty: z.enum(["Easy", "Medium", "Advanced"]).optional(),
  ingredients: z.array(z.string()).optional().nullable(),
  tags: z.array(z.string()).optional(),
  author: z.string().min(1).optional(),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, { message: "Date must be in YYYY-MM-DD format" })
    .optional(),
  featured: z.boolean().optional(),
  related_product: z.string().optional().nullable(),
  is_published: z.boolean().optional(),
});
