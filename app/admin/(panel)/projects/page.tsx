import type { Metadata } from "next";
import PageHeader, { ComingSoon } from "@/components/admin/PageHeader";
import { requireAdmin } from "@/lib/auth";

export const metadata: Metadata = { title: "Projects" };

export default async function ProjectsPage() {
  await requireAdmin();
  return (
    <>
      <PageHeader title="Projects" subtitle="Add, edit, reorder and publish your projects." />
      <ComingSoon phase={3}>The projects manager (with screenshots and drag-to-reorder) is coming next.</ComingSoon>
    </>
  );
}
