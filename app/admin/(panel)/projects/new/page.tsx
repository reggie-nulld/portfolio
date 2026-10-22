import type { Metadata } from "next";
import PageHeader from "@/components/admin/PageHeader";
import ProjectForm, { emptyProject } from "@/components/admin/ProjectForm";
import { requireAdmin } from "@/lib/auth";
import { isStorageConfigured } from "@/lib/storage";
import { createProject } from "../actions";

export const metadata: Metadata = { title: "New project" };

export default async function NewProjectPage() {
  await requireAdmin();
  return (
    <>
      <PageHeader title="New project" subtitle="It appears at the end of your projects list." />
      <ProjectForm
        action={createProject}
        project={emptyProject}
        uploadsEnabled={isStorageConfigured}
        submitLabel="Add project"
      />
    </>
  );
}
