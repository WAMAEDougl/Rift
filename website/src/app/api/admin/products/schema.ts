import { z } from "zod";

export const productSchema = z.object({
  name: z.string().min(1),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  category_id: z.string().uuid(),
  description: z.string().optional(),
  long_description: z.string().optional(),
  price: z.number().int().min(1),
  size: z.string().optional(),
  image_url: z.string().url().optional(),
  features: z.array(z.string()).optional(),
  ingredients: z.string().optional(),
  nutrition_highlights: z.array(z.string()).optional(),
  badge: z.string().optional(),
  in_stock: z.boolean().default(true),
  is_active: z.boolean().default(true),
  sort_order: z.number().int().default(0),
});

// Partial schema without defaults — used for PATCH so only provided fields are sent
export const productPatchSchema = z.object({
  name: z.string().min(1).optional(),
  slug: z.string().regex(/^[a-z0-9-]+$/).optional(),
  category_id: z.string().uuid().optional(),
  description: z.string().optional(),
  long_description: z.string().optional(),
  price: z.number().int().min(1).optional(),
  size: z.string().optional(),
  image_url: z.string().url().optional(),
  features: z.array(z.string()).optional(),
  ingredients: z.string().optional(),
  nutrition_highlights: z.array(z.string()).optional(),
  badge: z.string().optional(),
  in_stock: z.boolean().optional(),
  is_active: z.boolean().optional(),
  sort_order: z.number().int().optional(),
});
