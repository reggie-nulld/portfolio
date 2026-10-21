import type { Metadata } from "next";
import PageHeader, { ComingSoon } from "@/components/admin/PageHeader";
import { requireAdmin } from "@/lib/auth";

export const metadata: Metadata = { title: "Messages" };

export default async function MessagesPage() {
  await requireAdmin();
  return (
    <>
      <PageHeader title="Messages" subtitle="Messages sent through your contact form." />
      <ComingSoon phase={5}>Your inbox appears here once the contact form is built.</ComingSoon>
    </>
  );
}
