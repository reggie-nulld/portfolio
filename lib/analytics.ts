import "server-only";
import { createHash } from "node:crypto";

// Visitors are counted with a hash of (day, IP, browser) plus a private salt. The
// IP is never stored, and because the day is part of the hash the same person can't
// be followed from one day to the next. No cookies are set.
const SALT =
  process.env.ANALYTICS_SALT ?? process.env.SUPABASE_SECRET_KEY ?? process.env.DATABASE_URL ?? "portfolio";

export function visitorHash(ip: string, userAgent: string, now = new Date()) {
  const day = now.toISOString().slice(0, 10);
  return createHash("sha256").update(`${day}|${ip}|${userAgent}|${SALT}`).digest("hex").slice(0, 32);
}

const BOT = /bot|crawl|spider|slurp|facebookexternalhit|embedly|preview|headless|lighthouse|pingdom|monitor|curl|wget|python|axios|node-fetch|go-http/i;
export const isBot = (ua: string) => !ua || BOT.test(ua);

export function deviceOf(ua: string) {
  if (/ipad|tablet|(android(?!.*mobile))/i.test(ua)) return "Tablet";
  if (/mobi|iphone|ipod|android/i.test(ua)) return "Mobile";
  return "Desktop";
}

export function browserOf(ua: string) {
  if (/edg\//i.test(ua)) return "Edge";
  if (/opr\/|opera/i.test(ua)) return "Opera";
  if (/samsungbrowser/i.test(ua)) return "Samsung Internet";
  if (/firefox|fxios/i.test(ua)) return "Firefox";
  if (/chrome|crios/i.test(ua)) return "Chrome";
  if (/safari/i.test(ua)) return "Safari";
  return "Other";
}

/** "https://www.google.com/search?q=…" → "google.com". Visits from this site itself count as direct. */
export function sourceOf(referrer: string | undefined, ownHost: string | null) {
  if (!referrer) return null;
  try {
    const host = new URL(referrer).hostname.replace(/^www\./, "").toLowerCase();
    if (!host || (ownHost && host === ownHost.replace(/^www\./, "").split(":")[0])) return null;
    return host.slice(0, 100);
  } catch {
    // A campaign tag like ?ref=linkedin arrives as a plain word.
    const tag = referrer.trim().toLowerCase();
    return /^[a-z0-9._-]{1,40}$/.test(tag) ? tag : null;
  }
}
