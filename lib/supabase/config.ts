/**
 * Just the origin (https://<id>.supabase.co). Supabase's dashboard shows the API URL
 * with /rest/v1 on the end; keeping it would send logins to a path that 404s.
 */
export const supabaseUrl = toOrigin(
  process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL ?? ""
);

function toOrigin(value: string) {
  try {
    return value ? new URL(value.trim()).origin : "";
  } catch {
    return value.trim();
  }
}

// Only server code uses these, so the private names (no NEXT_PUBLIC_ prefix) are preferred.
// The NEXT_PUBLIC_ names still work so existing setups don't break.
export const supabaseKey =
  process.env.SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "";

/**
 * Auth cookies are httpOnly because the admin never uses Supabase in the browser,
 * so scripts on the page can't read the session.
 */
export const authCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
};

/** False until the Supabase settings are in .env.local / Vercel. */
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseKey);

/** Emails allowed into /admin, from ADMIN_EMAILS (comma-separated). Empty means nobody. */
export function isAdminEmail(email: string | undefined | null) {
  if (!email) return false;
  const allowed = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return allowed.includes(email.toLowerCase());
}
