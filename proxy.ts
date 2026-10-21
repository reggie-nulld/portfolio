import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import {
  authCookieOptions,
  isAdminEmail,
  isSupabaseConfigured,
  supabaseKey,
  supabaseUrl,
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
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  const { data } = await supabase.auth.getUser();
  const isAdmin = isAdminEmail(data.user?.email);

  const redirectTo = (path: string) => {
    const res = NextResponse.redirect(new URL(path, request.url));
    // Keep any refreshed session cookies on the redirect.
    response.cookies.getAll().forEach((c) => res.cookies.set(c));
    return res;
  };

  if (!isAdmin && !isLogin) return redirectTo(LOGIN);
  if (isAdmin && isLogin) return redirectTo("/admin");
  return response;
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
