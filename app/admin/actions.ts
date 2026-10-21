"use server";

import { redirect } from "next/navigation";
import { isAdminEmail, isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

export type LoginState = { error?: string; email?: string };

export async function signIn(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!isSupabaseConfigured) {
    return { email, error: "Supabase isn't configured. Add the Supabase settings to .env.local and restart." };
  }
  if (!email || !password) return { email, error: "Enter your email and password." };

  const supabase = await createClient();
  let data, error;
  try {
    ({ data, error } = await supabase.auth.signInWithPassword({ email, password }));
  } catch {
    return { email, error: "Couldn't reach Supabase. Check your connection and try again." };
  }

  if (error || !data.user) {
    const wrong = error?.code === "invalid_credentials" || error?.status === 400;
    return {
      email,
      error: wrong ? "Wrong email or password." : "Couldn't sign in. Please try again in a moment.",
    };
  }

  // A valid Supabase user who isn't on ADMIN_EMAILS doesn't get a session.
  if (!isAdminEmail(data.user.email)) {
    await supabase.auth.signOut();
    return { email, error: "This account doesn't have admin access." };
  }

  redirect("/admin");
}

export async function signOut() {
  if (isSupabaseConfigured) {
    const supabase = await createClient();
    await supabase.auth.signOut();
  }
  redirect("/admin/login");
}
