import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import {
  authCookieOptions,
  isAdminEmail,
  isSessionExpired,
  isSupabaseConfigured,
  supabaseKey,
  supabaseUrl,
  withSessionMaxAge,
} from "./lib/supabase/config";

const LOGIN = "/admin/login";

/**
 * Runs before every /admin request: refreshes the Supabase session cookie and
 * sends anyone who isn't the admin to the login page.
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isLogin = pathname === LOGIN;

  if (!isSupabaseConfigured) {
    return isLogin ? NextResponse.next() : NextResponse.redirect(new URL(LOGIN, request.url));
  }

  let response = NextResponse.next({ request });
  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookieOptions: authCookieOptions,
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, withSessionMaxAge(options)));
      },
    },
  });

  // getClaims verifies the token's signature locally (no round trip to Supabase once its
  // public keys are cached), and refreshes the session cookie when needed. Pages still
  // do the full server check in requireAdmin(), so this is only the fast first gate.
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;

  const redirectTo = (path: string) => {
    const res = NextResponse.redirect(new URL(path, request.url));
    // Keep any refreshed session cookies on the redirect.
    response.cookies.getAll().forEach((c) => res.cookies.set(c));
    return res;
  };

  // Logins last SESSION_MAX_AGE_SECONDS from sign-in, however active the session is.
  if (claims && isSessionExpired(claims)) {
    await supabase.auth.signOut();
    // signOut clears cookies via an auth event that can land after we respond,
    // so delete the session cookies on this response directly.
    const res = isLogin ? NextResponse.next() : NextResponse.redirect(new URL(`${LOGIN}?expired=1`, request.url));
    request.cookies
      .getAll()
      .filter((c) => c.name.startsWith("sb-") && c.name.includes("auth-token"))
      .forEach((c) => res.cookies.set(c.name, "", { ...authCookieOptions, maxAge: 0 }));
    return res;
  }

  const isAdmin = isAdminEmail(claims?.email as string | undefined);
  if (!isAdmin && !isLogin) return redirectTo(LOGIN);
  if (isAdmin && isLogin) return redirectTo("/admin");
  return response;
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
