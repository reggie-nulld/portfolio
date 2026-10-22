import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { authCookieOptions, supabaseKey, supabaseUrl, withSessionMaxAge } from "./config";

/** Supabase client for Server Components and Server Actions, using the auth cookies. */
export async function createClient() {
  const cookieStore = await cookies();
  return createServerClient(supabaseUrl, supabaseKey, {
    cookieOptions: authCookieOptions,
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, withSessionMaxAge(options)));
        } catch {
          // Server Components can't set cookies; proxy.ts keeps the session fresh instead.
        }
      },
    },
  });
}

/**
 * Deletes the session cookies (sb-<project>-auth-token and any .0/.1 chunks) directly.
 * signOut() clears them via an auth event that isn't guaranteed to land before we respond.
 */
export async function clearAuthCookies() {
  const cookieStore = await cookies();
  cookieStore
    .getAll()
    .filter((c) => c.name.startsWith("sb-") && c.name.includes("-auth-token"))
    .forEach((c) => cookieStore.set(c.name, "", { ...authCookieOptions, maxAge: 0 }));
}
