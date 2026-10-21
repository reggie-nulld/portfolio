import type { Metadata } from "next";
import PageHeader, { ComingSoon } from "@/components/admin/PageHeader";
import { requireAdmin } from "@/lib/auth";

export const metadata: Metadata = { title: "Content" };

export default async function ContentPage() {
  await requireAdmin();
  return (
    <>
      <PageHeader title="Content" subtitle="Your profile, hero, about, skills and social links." />
      <ComingSoon phase={3}>Edit forms for every section of your site will live here.</ComingSoon>
    </>
  );
}
