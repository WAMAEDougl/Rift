import { requireAdminSession } from "@/lib/admin/auth";
import { getAdminClient } from "@/lib/admin/supabase";
import { ok, err } from "@/lib/admin/response";

export async function POST(request: Request) {
  const session = await requireAdminSession(request, "admin");
  if (session instanceof Response) return session;

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return err("No file provided", "VALIDATION_ERROR", 422);
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      return err("Only image files are allowed", "VALIDATION_ERROR", 422);
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return err("File size must be under 5MB", "VALIDATION_ERROR", 422);
    }

    const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
    const fileName = `products/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);

    const admin = getAdminClient();

    const { data, error } = await admin.storage
      .from("product-images")
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (error) {
      // If bucket doesn't exist, try creating it
      if (error.message?.includes("Bucket not found") || error.message?.includes("bucket")) {
        await admin.storage.createBucket("product-images", { public: true });
        const { data: retryData, error: retryError } = await admin.storage
          .from("product-images")
          .upload(fileName, buffer, { contentType: file.type, upsert: false });

        if (retryError) {
          return err(`Upload failed: ${retryError.message}`, "INTERNAL_ERROR", 500);
        }

        const { data: urlData } = admin.storage
          .from("product-images")
          .getPublicUrl(retryData.path);

        return ok({ url: urlData.publicUrl });
      }

      return err(`Upload failed: ${error.message}`, "INTERNAL_ERROR", 500);
    }

    const { data: urlData } = admin.storage
      .from("product-images")
      .getPublicUrl(data.path);

    return ok({ url: urlData.publicUrl });
  } catch (e) {
    return err("Upload failed", "INTERNAL_ERROR", 500);
  }
}

