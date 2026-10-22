"use server";

import { requireAdmin } from "@/lib/auth";
import { isStorageConfigured, uploadImage } from "@/lib/storage";

export type UploadResult = { url?: string; error?: string };

/** Used by the image fields on the Content and Projects pages. */
export async function uploadImageAction(formData: FormData): Promise<UploadResult> {
  await requireAdmin();
  if (!isStorageConfigured) {
    return { error: "Uploads need SUPABASE_SECRET_KEY to be set. You can paste an image path instead." };
  }
  const file = formData.get("file");
  const folder = formData.get("folder") === "avatar" ? "avatar" : "projects";
  if (!(file instanceof File) || file.size === 0) return { error: "Choose an image first." };
  try {
    return { url: await uploadImage(file, folder) };
  } catch (e) {
    console.error("Image upload failed", e);
    const message = e instanceof Error ? e.message : "";
    // Our own validation messages are safe to show; anything else stays generic.
    return { error: /^(Use a|That )/.test(message) ? message : "Upload failed. Please try again." };
  }
}
