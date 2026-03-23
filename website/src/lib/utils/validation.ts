import { z } from "zod";

// Phone number: accepts 0712..., +254712..., 254712..., 712...
export const phoneSchema = z
  .string()
  .min(9, "Phone number is too short")
  .max(15, "Phone number is too long")
  .transform((val) => {
    let cleaned = val.replace(/\s+/g, "").replace(/[^0-9+]/g, "");
    if (cleaned.startsWith("+")) cleaned = cleaned.slice(1);
    if (cleaned.startsWith("0")) cleaned = "254" + cleaned.slice(1);
    if (!cleaned.startsWith("254")) cleaned = "254" + cleaned;
    return cleaned;
  })
  .refine((val) => /^254[17]\d{8}$/.test(val), {
    message: "Enter a valid Kenyan phone number",
  });

// Order creation schema
export const createOrderSchema = z.object({
  customer_name: z.string().min(2, "Name is too short").max(100, "Name is too long"),
  customer_phone: phoneSchema,
  customer_email: z.string().email("Invalid email").nullish().or(z.literal("")),
  delivery_address: z.string().min(3, "Address is too short").max(500),
  delivery_city: z.string().min(2).max(50).default("Nairobi"),
  delivery_type: z.enum(["delivery", "pickup", "shipping"]).default("delivery"),
  order_notes: z.string().max(500).optional().nullable(),
  payment_method: z.enum(["mpesa", "cash_on_delivery"]).default("cash_on_delivery"),
  items: z
    .array(
      z.object({
        product_id: z.string().min(1, "Product ID required"),
        quantity: z.number().int().min(1, "Min quantity is 1").max(50, "Max quantity is 50"),
      })
    )
    .min(1, "At least one item required")
    .max(20, "Maximum 20 items per order"),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;

// Normalize phone for display (0712 345 678)
export function formatPhoneDisplay(phone: string): string {
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.startsWith("254")) {
    const local = "0" + cleaned.slice(3);
    return `${local.slice(0, 4)} ${local.slice(4, 7)} ${local.slice(7)}`;
  }
  return phone;
}

// Normalize phone to 254 format
export function normalizePhone(phone: string): string {
  let cleaned = phone.replace(/\s+/g, "").replace(/[^0-9+]/g, "");
  if (cleaned.startsWith("+")) cleaned = cleaned.slice(1);
  if (cleaned.startsWith("0")) cleaned = "254" + cleaned.slice(1);
  if (!cleaned.startsWith("254")) cleaned = "254" + cleaned;
  return cleaned;
}
