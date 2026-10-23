import "server-only";
import { and, count, countDistinct, desc, eq, gte, lt, sql } from "drizzle-orm";
import { db } from "../db";
import { events, messages, pageViews } from "../db/schema";

export const RANGES = { "7": "Last 7 days", "30": "Last 30 days", "90": "Last 90 days" } as const;
export type RangeKey = keyof typeof RANGES;
export const toRange = (v: string | undefined): RangeKey => (v && v in RANGES ? (v as RangeKey) : "30");

export type DayPoint = { day: string; views: number; visitors: number };
export type Breakdown = { label: string; value: number }[];

const DAY_MS = 86_400_000;
const TOP = 6;

/** Top rows of a column, with the remainder folded into "Other". */
type BreakdownColumn = typeof pageViews.referrer | typeof pageViews.country | typeof pageViews.device | typeof pageViews.browser;

async function breakdown(column: BreakdownColumn, since: Date, emptyLabel: string): Promise<Breakdown> {
  const rows = await db!
    .select({ label: column, value: count() })
    .from(pageViews)
    .where(gte(pageViews.createdAt, since))
    .groupBy(column)
    .orderBy(desc(count()));
  const out = rows.slice(0, TOP).map((r) => ({ label: r.label ?? emptyLabel, value: r.value }));
  const rest = rows.slice(TOP).reduce((n, r) => n + r.value, 0);
  if (rest) out.push({ label: "Other", value: rest });
  return out;
}

function totals(from: Date, to: Date) {
  const inRange = and(gte(pageViews.createdAt, from), lt(pageViews.createdAt, to));
  return Promise.all([
    db!
      .select({ views: count(), visitors: countDistinct(pageViews.visitorHash) })
      .from(pageViews)
      .where(inRange),
    db!
      .select({ n: count() })
      .from(events)
      .where(and(eq(events.type, "project_click"), gte(events.createdAt, from), lt(events.createdAt, to))),
  ]).then(([[t], [c]]) => ({ views: t.views, visitors: t.visitors, clicks: c.n }));
}

export async function getInsights(range: RangeKey) {
  if (!db) return null;
  const days = Number(range);
  const now = new Date();
  // Whole UTC days, ending today.
  const todayStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const since = new Date(todayStart.getTime() - (days - 1) * DAY_MS);
  const prevSince = new Date(since.getTime() - days * DAY_MS);
  const recent = new Date(now.getTime() - 30 * 60_000);

  const [current, previous, daily, [live], [unread], sources, countries, devices, browsers, projects] =
    await Promise.all([
      totals(since, now),
      totals(prevSince, since),
      db
        .select({
          day: sql<string>`to_char(date_trunc('day', ${pageViews.createdAt} at time zone 'UTC'), 'YYYY-MM-DD')`,
          views: count(),
          visitors: countDistinct(pageViews.visitorHash),
        })
        .from(pageViews)
        .where(gte(pageViews.createdAt, since))
        .groupBy(sql`1`),
      db.select({ n: countDistinct(pageViews.visitorHash) }).from(pageViews).where(gte(pageViews.createdAt, recent)),
      db.select({ n: count() }).from(messages).where(eq(messages.read, false)),
      breakdown(pageViews.referrer, since, "Direct"),
      breakdown(pageViews.country, since, "Unknown"),
      breakdown(pageViews.device, since, "Unknown"),
      breakdown(pageViews.browser, since, "Unknown"),
      db
        .select({ label: events.target, value: count() })
        .from(events)
        .where(and(eq(events.type, "project_click"), gte(events.createdAt, since)))
        .groupBy(events.target)
        .orderBy(desc(count()))
        .limit(8),
    ]);

  // Fill in days with no visits so the chart has every day.
  const byDay = new Map(daily.map((d) => [d.day, d]));
  const series: DayPoint[] = Array.from({ length: days }, (_, i) => {
    const day = new Date(since.getTime() + i * DAY_MS).toISOString().slice(0, 10);
    const d = byDay.get(day);
    return { day, views: d?.views ?? 0, visitors: d?.visitors ?? 0 };
  });

  return {
    current,
    previous,
    series,
    live: live.n,
    unread: unread.n,
    sources,
    countries,
    devices,
    browsers,
    projects: projects.map((p) => ({ label: p.label ?? "Unknown", value: p.value })),
  };
}
