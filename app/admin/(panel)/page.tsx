import type { Metadata } from "next";
import Link from "next/link";
import BarList from "@/components/admin/BarList";
import PageHeader from "@/components/admin/PageHeader";
import TrafficChart from "@/components/admin/TrafficChart";
import { RANGES, type RangeKey, getInsights, toRange } from "@/lib/admin/insights";
import { requireAdmin } from "@/lib/auth";

export const metadata: Metadata = { title: "Dashboard" };

const regionNames = new Intl.DisplayNames(["en"], { type: "region" });
function countryName(code: string) {
  if (!/^[A-Z]{2}$/.test(code)) return code;
  const flag = String.fromCodePoint(...[...code].map((c) => 0x1f1a5 + c.charCodeAt(0)));
  try {
    return `${flag} ${regionNames.of(code) ?? code}`;
  } catch {
    return code;
  }
}

/** "+12%" against the previous period of the same length, or null when there's nothing to compare. */
function change(now: number, before: number) {
  if (!before) return null;
  const pct = Math.round(((now - before) / before) * 100);
  return { pct, label: `${pct > 0 ? "+" : ""}${pct}%` };
}

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ range?: string }> }) {
  const admin = await requireAdmin();
  const range: RangeKey = toRange((await searchParams).range);
  const data = await getInsights(range);
  const name = admin.email?.split("@")[0];

  if (!data) {
    return (
      <>
        <PageHeader title={`Welcome back${name ? `, ${name}` : ""}`} subtitle="Here's how your site is doing." />
        <p className="form-error">
          No database connection: DATABASE_URL isn&apos;t set.{" "}
          {process.env.VERCEL
            ? "Add it in Vercel → Settings → Environment Variables (with Production ticked), then redeploy."
            : "Add it to .env.local and restart the dev server."}
        </p>
      </>
    );
  }

  const period = `vs previous ${range} days`;
  const stats = [
    { label: "Visitors", value: data.current.visitors, delta: change(data.current.visitors, data.previous.visitors), note: "unique per day" },
    { label: "Page views", value: data.current.views, delta: change(data.current.views, data.previous.views) },
    { label: "Project clicks", value: data.current.clicks, delta: change(data.current.clicks, data.previous.clicks) },
  ];
  const noVisits = data.current.views === 0;

  return (
    <>
      <PageHeader title={`Welcome back${name ? `, ${name}` : ""}`} subtitle="Here's how your site is doing." />

      <nav className="range-filter" aria-label="Date range">
        {(Object.keys(RANGES) as RangeKey[]).map((key) => (
          <Link
            key={key}
            href={`/admin?range=${key}`}
            className={key === range ? "active" : ""}
            aria-current={key === range ? "page" : undefined}
            scroll={false}
          >
            {RANGES[key]}
          </Link>
        ))}
      </nav>

      <div className="tiles">
        {stats.map((s) => (
          <div key={s.label} className="tile glass">
            <span className="tile-label">{s.label}</span>
            <span className="tile-value">{s.value.toLocaleString()}</span>
            <span className="tile-note mono">
              {s.delta ? (
                <span className={s.delta.pct >= 0 ? "delta-up" : "delta-down"}>
                  {s.delta.pct >= 0 ? "▲" : "▼"} {s.delta.label} <span className="tile-dim">{period}</span>
                </span>
              ) : (
                <span className="tile-dim">{s.note ?? "no earlier data to compare"}</span>
              )}
            </span>
          </div>
        ))}
        <div className="tile glass">
          <span className="tile-label">Right now</span>
          <span className="tile-value">
            {data.live > 0 && <span className="live-dot" aria-hidden="true" />}
            {data.live.toLocaleString()}
          </span>
          <span className="tile-note mono tile-dim">visitors in the last 30 min</span>
        </div>
        <Link href="/admin/messages" className="tile glass tile-link">
          <span className="tile-label">Unread messages</span>
          <span className="tile-value">{data.unread.toLocaleString()}</span>
          <span className="tile-note mono">open inbox →</span>
        </Link>
      </div>

      <section className="panel glass chart-panel">
        <h2 className="panel-title">Traffic</h2>
        <p className="panel-sub">
          Per day (UTC), {RANGES[range].toLowerCase()}.{noVisits && " No visits recorded yet; they'll appear here as people visit your site."}
        </p>
        <TrafficChart data={data.series} />
      </section>

      <div className="breakdowns">
        <BarList title="Top sources" rows={data.sources} />
        <BarList title="Most-clicked projects" rows={data.projects} empty="No project clicks yet" />
        <BarList title="Countries" rows={data.countries} format={countryName} />
        <BarList title="Devices" rows={data.devices} />
        <BarList title="Browsers" rows={data.browsers} />
      </div>

      <p className="privacy-note mono">
        Visits are counted without cookies or storing IP addresses. Your own visits while signed in aren&apos;t counted.
      </p>
    </>
  );
}
