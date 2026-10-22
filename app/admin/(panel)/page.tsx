import { count, eq } from "drizzle-orm";
import type { Metadata } from "next";
import Link from "next/link";
import PageHeader, { ComingSoon } from "@/components/admin/PageHeader";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { messages, pageViews, projects } from "@/lib/db/schema";

export const metadata: Metadata = { title: "Dashboard" };

async function getCounts() {
  if (!db) return null;
  const [[proj], [pub], [unread], [views]] = await Promise.all([
    db.select({ n: count() }).from(projects),
    db.select({ n: count() }).from(projects).where(eq(projects.published, true)),
    db.select({ n: count() }).from(messages).where(eq(messages.read, false)),
    db.select({ n: count() }).from(pageViews),
  ]);
  return { projects: proj.n, published: pub.n, unread: unread.n, views: views.n };
}

export default async function DashboardPage() {
  const admin = await requireAdmin();
  const counts = await getCounts();
  const name = admin.email?.split("@")[0];

  const tiles = [
    { label: "Page views", value: counts?.views, note: "all time", href: "/admin" },
    { label: "Projects", value: counts?.projects, note: `${counts?.published ?? 0} published`, href: "/admin/projects" },
    { label: "Unread messages", value: counts?.unread, note: "in your inbox", href: "/admin/messages" },
  ];

  return (
    <>
      <PageHeader title={`Welcome back${name ? `, ${name}` : ""}`} subtitle="Here's what's happening on your site." />

      {!counts && (
        <p className="form-error">
          No database connection: DATABASE_URL isn&apos;t set.{" "}
          {process.env.VERCEL
            ? "Add it in Vercel → Settings → Environment Variables (with Production ticked), then redeploy."
            : "Add it to .env.local and restart the dev server."}
        </p>
      )}

      <div className="tiles">
        {tiles.map((t) => (
          <Link key={t.label} href={t.href} className="tile glass">
            <span className="tile-label">{t.label}</span>
            <span className="tile-value">{t.value ?? "—"}</span>
            <span className="tile-note mono">{t.note}</span>
          </Link>
        ))}
      </div>

      <ComingSoon phase={4}>
        Traffic charts, top referrers, countries, devices and project clicks will appear here once
        visitor tracking is added.
      </ComingSoon>
    </>
  );
}
