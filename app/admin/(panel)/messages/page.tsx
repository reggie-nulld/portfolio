import { count, desc, eq } from "drizzle-orm";
import type { Metadata } from "next";
import Link from "next/link";
import MessageList from "@/components/admin/MessageList";
import PageHeader from "@/components/admin/PageHeader";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { messages } from "@/lib/db/schema";
import { isEmailConfigured } from "@/lib/email";

export const metadata: Metadata = { title: "Messages" };

export default async function MessagesPage({ searchParams }: { searchParams: Promise<{ filter?: string }> }) {
  await requireAdmin();
  const unreadOnly = (await searchParams).filter === "unread";

  if (!db) {
    return (
      <>
        <PageHeader title="Messages" subtitle="Messages sent through your contact form." />
        <p className="form-error">No database connection: DATABASE_URL isn&apos;t set.</p>
      </>
    );
  }

  const [rows, [{ total }], [{ unread }]] = await Promise.all([
    db
      .select()
      .from(messages)
      .where(unreadOnly ? eq(messages.read, false) : undefined)
      .orderBy(desc(messages.createdAt))
      .limit(200),
    db.select({ total: count() }).from(messages),
    db.select({ unread: count() }).from(messages).where(eq(messages.read, false)),
  ]);

  return (
    <>
      <PageHeader title="Messages" subtitle="Messages sent through the contact form on your site." />

      {!isEmailConfigured && (
        <p className="form-note">
          Email alerts are off. Add <code>RESEND_API_KEY</code> to get an email whenever someone writes to you.
        </p>
      )}

      <nav className="range-filter" aria-label="Filter messages">
        <Link href="/admin/messages" className={unreadOnly ? "" : "active"} aria-current={unreadOnly ? undefined : "page"}>
          All ({total})
        </Link>
        <Link
          href="/admin/messages?filter=unread"
          className={unreadOnly ? "active" : ""}
          aria-current={unreadOnly ? "page" : undefined}
        >
          Unread ({unread})
        </Link>
      </nav>

      <MessageList
        key={unreadOnly ? "unread" : "all"}
        messages={rows.map((m) => ({ ...m, createdAt: m.createdAt.toISOString() }))}
        emptyText={unreadOnly ? "No unread messages. You're all caught up." : "No messages yet. They'll appear here when someone uses your contact form."}
      />
    </>
  );
}
