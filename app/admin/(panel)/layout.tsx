import Sidebar from "@/components/admin/Sidebar";
import { requireAdmin } from "@/lib/auth";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();

  return (
    <div className="admin-shell">
      <Sidebar email={admin.email ?? ""} />
      <main className="admin-main">{children}</main>
    </div>
  );
}
