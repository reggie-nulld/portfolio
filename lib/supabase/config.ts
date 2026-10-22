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

/** How long an admin login lasts, counted from when you signed in (not from last activity). */
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24;

/**
 * True once the login is older than SESSION_MAX_AGE_SECONDS. Uses the `amr` claim,
 * which records when the user actually authenticated; `iat` can't be used because it
 * changes every time the token is refreshed.
 */
export function isSessionExpired(claims: Record<string, unknown> | null | undefined) {
  const amr = claims?.amr;
  if (!Array.isArray(amr) || amr.length === 0) return false;
  const signedInAt = Math.max(...amr.map((a) => Number((a as { timestamp?: number }).timestamp) || 0));
  return signedInAt > 0 && Date.now() / 1000 - signedInAt > SESSION_MAX_AGE_SECONDS;
}

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

/**
 * @supabase/ssr always writes auth cookies with a 400-day maxAge, ignoring cookieOptions.
 * Apply our own limit when the cookie is written (deletions keep maxAge 0).
 */
export function withSessionMaxAge<T extends { maxAge?: number }>(options: T): T {
  return options.maxAge === 0 ? options : { ...options, maxAge: SESSION_MAX_AGE_SECONDS };
}

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
