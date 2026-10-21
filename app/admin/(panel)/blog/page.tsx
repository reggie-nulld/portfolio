import type { Metadata } from "next";
import PageHeader, { ComingSoon } from "@/components/admin/PageHeader";
import { requireAdmin } from "@/lib/auth";

export const metadata: Metadata = { title: "Blog" };

export default async function BlogPage() {
  await requireAdmin();
  return (
    <>
      <PageHeader title="Blog" subtitle="Write and publish posts." />
      <ComingSoon phase={7}>The post editor and blog pages come after the core CMS is done.</ComingSoon>
    </>
  );
}
