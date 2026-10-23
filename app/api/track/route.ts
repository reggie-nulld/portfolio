import { z } from "zod";
import { browserOf, deviceOf, isBot, sourceOf, visitorHash } from "@/lib/analytics";
import { db } from "@/lib/db";
import { events, pageViews } from "@/lib/db/schema";

const bodySchema = z.object({
  type: z.enum(["pageview", "project_click"]),
  path: z.string().max(200).startsWith("/"),
  referrer: z.string().max(500).optional(),
  target: z.string().max(120).optional(),
});

const done = () => new Response(null, { status: 204 });

/** Receives page views and project clicks from components/Tracker.tsx. Always answers 204. */
export async function POST(request: Request) {
  if (!db) return done();
  // Browsers send Origin on these requests; ignore events posted from other websites.
  const origin = request.headers.get("origin");
  if (origin && URL.parse(origin)?.host !== request.headers.get("host")) return done();
  const ua = request.headers.get("user-agent") ?? "";
  if (isBot(ua)) return done();
  // Signed-in admins (you) aren't counted.
  if (/(?:^|;\s*)sb-[^=]*-auth-token/.test(request.headers.get("cookie") ?? "")) return done();

  let body: z.infer<typeof bodySchema>;
  try {
    body = bodySchema.parse(JSON.parse(await request.text()));
  } catch {
    return new Response(null, { status: 400 });
  }
  if (body.path.startsWith("/admin")) return done();

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "";
  const hash = visitorHash(ip, ua);

  try {
    if (body.type === "pageview") {
      const country = request.headers.get("x-vercel-ip-country");
      await db.insert(pageViews).values({
        path: body.path,
        referrer: sourceOf(body.referrer, request.headers.get("host")),
        country: country && /^[A-Z]{2}$/.test(country) ? country : null,
        device: deviceOf(ua),
        browser: browserOf(ua),
        visitorHash: hash,
      });
    } else if (body.target) {
      await db.insert(events).values({ type: body.type, target: body.target, path: body.path, visitorHash: hash });
    }
  } catch (e) {
    console.error("Tracking insert failed", e);
  }
  return done();
}
