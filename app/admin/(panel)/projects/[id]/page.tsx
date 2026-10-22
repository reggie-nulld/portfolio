import { eq } from "drizzle-orm";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PageHeader from "@/components/admin/PageHeader";
import ProjectForm from "@/components/admin/ProjectForm";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { projects } from "@/lib/db/schema";
import { isStorageConfigured } from "@/lib/storage";
import { updateProject } from "../actions";

export const metadata: Metadata = { title: "Edit project" };

export default async function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const id = Number((await params).id);
  if (!db || !Number.isInteger(id) || id <= 0) notFound();

  const [project] = await db.select().from(projects).where(eq(projects.id, id)).limit(1);
  if (!project) notFound();

  return (
    <>
      <PageHeader title={project.title} subtitle="Edit this project. Saving updates your live site." />
      <ProjectForm
        action={updateProject.bind(null, project.id)}
        project={project}
        uploadsEnabled={isStorageConfigured}
        submitLabel="Save changes"
      />
    </>
  );
}
