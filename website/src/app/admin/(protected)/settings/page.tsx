import { getAdminClient } from "@/lib/admin/supabase";
import SettingsPageClient from "./SettingsPageClient";

export default async function SettingsPage() {
  const supabase = getAdminClient();

  const [{ data: settings }, { data: adminUsers }] = await Promise.all([
    supabase.from("store_settings").select("id, store_name, support_email, support_phone, default_delivery_fee, delivery_cities, order_notification_emails, updated_at").eq("id", 1).single(),
    supabase
      .from("profiles")
      .select("id, full_name, email, role, created_at")
      .in("role", ["admin", "kitchen"])
      .order("created_at", { ascending: false }),
  ]);

  return (
    <SettingsPageClient
      settings={settings}
      users={adminUsers ?? []}
      mpesaEnv={process.env.MPESA_ENVIRONMENT === "production" ? "production" : "sandbox"}
    />
  );
}
