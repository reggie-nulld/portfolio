import { count, eq } from "drizzle-orm";
import Sidebar from "@/components/admin/Sidebar";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { messages } from "@/lib/db/schema";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();
  const unread = db
    ? await db
        .select({ n: count() })
        .from(messages)
        .where(eq(messages.read, false))
        .then(([r]) => r.n)
        .catch(() => 0)
    : 0;

  return (
    <div className="admin-shell">
      <Sidebar email={admin.email ?? ""} unread={unread} />
      <main className="admin-main">{children}</main>
    </div>
  );
}
