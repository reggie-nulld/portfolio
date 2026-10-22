import { z } from "zod";
import { supabaseUrl } from "../supabase/config";

/** What every admin form action returns to the page. */
export type FormState = {
  ok?: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
  /** Changes on every successful save so the page can show "Saved" again. */
  savedAt?: number;
};

export const NO_DB = "No database connection: DATABASE_URL isn't set, so changes can't be saved.";

/** The first message for each field, in the shape the forms display. */
export function toFieldErrors(error: z.ZodError): FormState {
  const fieldErrors: Record<string, string> = {};
  let formError = "";
  for (const issue of error.issues) {
    const key = issue.path.join(".");
    if (!key) formError ||= issue.message;
    else if (!fieldErrors[key]) fieldErrors[key] = issue.message;
  }
  return { error: formError || "Some fields need fixing.", fieldErrors };
}

export const str = (max: number, label: string) =>
  z.string().trim().min(1, `${label} is required.`).max(max, `${label} must be ${max} characters or fewer.`);

export const optionalStr = (max: number, label: string) =>
  z.string().trim().max(max, `${label} must be ${max} characters or fewer.`);

/**
 * Links shown on the public site. Only web, mailto, in-page (#) and site-relative
 * links are allowed, so a saved value can never be a javascript: URL.
 */
export const safeHref = (label: string) =>
  z
    .string()
    .trim()
    .max(500, `${label} is too long.`)
    .refine(
      (v) => v === "" || v.startsWith("#") || /^\/(?!\/)/.test(v) || /^(https?:\/\/[^\s]+|mailto:[^\s]+)$/i.test(v),
      `${label} must start with https://, mailto:, / or #.`
    );

/** Public URL prefix for images uploaded through the admin. */
export const storagePublicPrefix = supabaseUrl ? `${supabaseUrl}/storage/v1/object/public/` : "";

/**
 * Images are rendered with next/image, which only loads from this site or from
 * Supabase Storage (see next.config.ts), so other hosts are rejected here.
 */
export const imageSrc = (label: string) =>
  z
    .string()
    .trim()
    .max(500, `${label} is too long.`)
    .refine(
      (v) =>
        v === "" ||
        (/^\/(?!\/)[^\s]*$/.test(v)) ||
        (!!storagePublicPrefix && v.startsWith(storagePublicPrefix)) ||
        /^https:\/\/[a-z0-9]+\.supabase\.co\/storage\/v1\/object\/public\//.test(v),
      `${label} must be an uploaded image or a path like /photo.webp.`
    );

/** "a, b, c" or one per line → ["a", "b", "c"]. */
export const splitList = (value: string) =>
  value
    .split(/[\n,]/)
    .map((s) => s.trim())
    .filter(Boolean);

export const splitLines = (value: string) =>
  value
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);

/** Paragraphs separated by a blank line. */
export const splitParagraphs = (value: string) =>
  value
    .replace(/\r\n/g, "\n")
    .split(/\n\s*\n/)
    .map((p) => p.replace(/\s*\n\s*/g, " ").trim())
    .filter(Boolean);

export const text = (formData: FormData, name: string) => String(formData.get(name) ?? "");
export const texts = (formData: FormData, name: string) => formData.getAll(name).map((v) => String(v));
