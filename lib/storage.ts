import "server-only";
import { randomUUID } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { supabaseUrl } from "./supabase/config";

const BUCKET = "media";
const secretKey = process.env.SUPABASE_SECRET_KEY ?? "";

export const isStorageConfigured = Boolean(supabaseUrl && secretKey);

export const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;

const TYPES: Record<string, { ext: string; magic: (b: Buffer) => boolean }> = {
  "image/webp": { ext: "webp", magic: (b) => b.toString("ascii", 0, 4) === "RIFF" && b.toString("ascii", 8, 12) === "WEBP" },
  "image/jpeg": { ext: "jpg", magic: (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff },
  "image/png": { ext: "png", magic: (b) => b.readUInt32BE(0) === 0x89504e47 },
};

function adminStorage() {
  return createClient(supabaseUrl, secretKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  }).storage;
}

/** Creates the public "media" bucket the first time something is uploaded. */
async function ensureBucket(storage: ReturnType<typeof adminStorage>) {
  const { error } = await storage.getBucket(BUCKET);
  if (!error) return;
  const created = await storage.createBucket(BUCKET, {
    public: true,
    fileSizeLimit: MAX_UPLOAD_BYTES,
    allowedMimeTypes: Object.keys(TYPES),
  });
  if (created.error && !/already exists/i.test(created.error.message)) throw created.error;
}

/**
 * Uploads an image to Supabase Storage and returns its public URL. Only WebP, JPEG
 * and PNG are accepted, checked by the file's actual bytes rather than its name.
 */
export async function uploadImage(file: File, folder: "avatar" | "projects") {
  const type = TYPES[file.type];
  if (!type) throw new Error("Use a JPG, PNG or WebP image.");
  if (file.size > MAX_UPLOAD_BYTES) throw new Error("That image is over 4 MB.");
  const bytes = Buffer.from(await file.arrayBuffer());
  if (bytes.length < 12 || !type.magic(bytes)) throw new Error("That file isn't a valid image.");

  const storage = adminStorage();
  await ensureBucket(storage);
  const path = `${folder}/${randomUUID()}.${type.ext}`;
  const { error } = await storage.from(BUCKET).upload(path, bytes, {
    contentType: file.type,
    cacheControl: "31536000",
    upsert: false,
  });
  if (error) throw error;
  return storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
}
