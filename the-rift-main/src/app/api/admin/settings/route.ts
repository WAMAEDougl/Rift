import { z } from "zod";
import { requireAdminSession } from "@/lib/admin/auth";
import { getAdminClient } from "@/lib/admin/supabase";
import { ok, err } from "@/lib/admin/response";

const settingsSchema = z
  .object({
    store_name: z.string().min(1).optional(),
    tagline: z.string().optional(),
    support_email: z.string().email().optional(),
    support_phone: z.string().optional(),
    whatsapp_number: z.string().optional(),
    address: z.string().optional(),
    city: z.string().optional(),
    country: z.string().optional(),
    currency: z.string().optional(),
    default_delivery_fee: z.number().int().min(0).optional(),
    delivery_cities: z.array(z.string()).optional(),
    order_notification_emails: z.array(z.string().email()).optional(),
    mpesa_shortcode: z.string().optional(),
    mpesa_environment: z.enum(["sandbox", "production"]).optional(),
    wasender_api_key: z.string().optional(),
    wasender_phone_id: z.string().optional(),
    tax_rate: z.number().min(0).max(100).optional(),
    free_shipping_threshold: z.number().int().min(0).optional(),
    low_stock_threshold: z.number().int().min(0).optional(),
    tax_inclusive: z.boolean().optional(),
    allow_guest_checkout: z.boolean().optional(),
    new_order_sound_enabled: z.boolean().optional(),
    new_message_sound_enabled: z.boolean().optional(),
    primary_color: z.string().optional(),
    secondary_color: z.string().optional(),
    font_heading: z.string().optional(),
    font_body: z.string().optional(),
  })
  .strict();

export async function GET(request: Request) {
  const session = await requireAdminSession(request);
  if (session instanceof Response) return session;

  try {
    const admin = getAdminClient();
    const { data: settings, error } = await admin
      .from("store_settings")
      .select("*")
      .eq("id", 1)
      .single();

    if (error || !settings) {
      return err("Settings not found", "NOT_FOUND", 404);
    }

    return ok(settings);
  } catch {
    return err("Internal server error", "INTERNAL_ERROR", 500);
  }
}

export async function PATCH(request: Request) {
  const session = await requireAdminSession(request, "admin");
  if (session instanceof Response) return session;

  try {
    const body = await request.json();
    const parsed = settingsSchema.safeParse(body);

    if (!parsed.success) {
      return err(parsed.error.issues[0].message, "VALIDATION_ERROR", 422);
    }

    if (Object.keys(parsed.data).length === 0) {
      return err("No fields provided to update", "VALIDATION_ERROR", 422);
    }

    const admin = getAdminClient();
    const { data: updatedSettings, error } = await admin
      .from("store_settings")
      .update(parsed.data as never)
      .eq("id", 1)
      .select()
      .single();

    if (error || !updatedSettings) {
      return err("Failed to update settings", "INTERNAL_ERROR", 500);
    }

    return ok(updatedSettings);
  } catch {
    return err("Internal server error", "INTERNAL_ERROR", 500);
  }
}

