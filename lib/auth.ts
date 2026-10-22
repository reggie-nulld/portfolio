import "server-only";
import { redirect } from "next/navigation";
import { cache } from "react";
import { isAdminEmail, isSessionExpired, isSupabaseConfigured } from "./supabase/config";
import { createClient } from "./supabase/server";

/** The signed-in admin, or null. Verified with Supabase on every request, not just read from the cookie. */
export const getAdmin = cache(async () => {
  if (!isSupabaseConfigured) return null;
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  if (isSessionExpired(claimsData?.claims)) return null;
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user || !isAdminEmail(data.user.email)) return null;
  return data.user;
});

/**
 * Call at the top of every admin page and Server Action. The proxy also guards
 * /admin, but this is the check that actually protects data.
 */
export async function requireAdmin() {
  const admin = await getAdmin();
  if (!admin) redirect("/admin/login");
  return admin;
}
