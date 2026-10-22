import { asc } from "drizzle-orm";
import type { Metadata } from "next";
import Link from "next/link";
import PageHeader from "@/components/admin/PageHeader";
import ProjectList from "@/components/admin/ProjectList";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { projects } from "@/lib/db/schema";

export const metadata: Metadata = { title: "Projects" };

export default async function ProjectsPage({ searchParams }: { searchParams: Promise<{ saved?: string }> }) {
  await requireAdmin();
  const { saved } = await searchParams;

  if (!db) {
    return (
      <>
        <PageHeader title="Projects" subtitle="Add, edit, reorder and publish your projects." />
        <p className="form-error">No database connection: DATABASE_URL isn&apos;t set.</p>
      </>
    );
  }

  const rows = await db
    .select({
      id: projects.id,
      title: projects.title,
      year: projects.year,
      imageUrl: projects.imageUrl,
      featured: projects.featured,
      published: projects.published,
    })
    .from(projects)
    .orderBy(asc(projects.position), asc(projects.id));

  return (
    <>
      <div className="page-header-row">
        <PageHeader title="Projects" subtitle="Add, edit, reorder and publish your projects." />
        <Link href="/admin/projects/new" className="btn btn-primary">
          + New project
        </Link>
      </div>
      {saved === "created" && <p className="form-note">✓ Project added. Your live site is updated.</p>}
      <ProjectList projects={rows} />
    </>
  );
}
