"use server";

import { asc, eq, inArray, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import {
  type FormState,
  NO_DB,
  imageSrc,
  optionalStr,
  safeHref,
  splitList,
  str,
  text,
  toFieldErrors,
} from "@/lib/admin/validation";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { projects } from "@/lib/db/schema";

const projectSchema = z.object({
  title: str(80, "Title"),
  description: str(600, "Description"),
  tags: z.array(z.string().max(30, "Each tag must be 30 characters or fewer.")).max(10, "Use 10 tags or fewer."),
  href: safeHref("Live link"),
  githubUrl: safeHref("GitHub link"),
  imageUrl: imageSrc("Screenshot"),
  year: optionalStr(12, "Year"),
  featured: z.boolean(),
  published: z.boolean(),
});

function parseProject(formData: FormData) {
  return projectSchema.safeParse({
    title: text(formData, "title"),
    description: text(formData, "description"),
    tags: splitList(text(formData, "tags")),
    href: text(formData, "href"),
    githubUrl: text(formData, "githubUrl"),
    imageUrl: text(formData, "imageUrl"),
    year: text(formData, "year"),
    featured: formData.get("featured") === "on",
    published: formData.get("published") === "on",
  });
}

function toRow(data: z.infer<typeof projectSchema>) {
  return {
    ...data,
    href: data.href || "#",
    githubUrl: data.githubUrl || null,
    imageUrl: data.imageUrl || null,
    year: data.year || null,
  };
}

function refresh() {
  revalidatePath("/");
  revalidatePath("/admin/projects");
}

export async function createProject(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  if (!db) return { error: NO_DB };
  const parsed = parseProject(formData);
  if (!parsed.success) return toFieldErrors(parsed.error);

  // New projects go to the end of the list.
  const [{ next }] = await db
    .select({ next: sql<number>`coalesce(max(${projects.position}) + 1, 0)::int` })
    .from(projects);
  await db.insert(projects).values({ ...toRow(parsed.data), position: next });
  refresh();
  redirect("/admin/projects?saved=created");
}

export async function updateProject(id: number, _prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  if (!db) return { error: NO_DB };
  const parsed = parseProject(formData);
  if (!parsed.success) return toFieldErrors(parsed.error);

  const updated = await db
    .update(projects)
    .set({ ...toRow(parsed.data), updatedAt: new Date() })
    .where(eq(projects.id, id))
    .returning({ id: projects.id });
  if (!updated.length) return { error: "This project no longer exists." };
  refresh();
  return { ok: true, savedAt: Date.now() };
}

export async function deleteProject(id: number) {
  await requireAdmin();
  if (!db) return { error: NO_DB };
  await db.delete(projects).where(eq(projects.id, id));
  refresh();
  return { ok: true };
}

export async function setPublished(id: number, published: boolean) {
  await requireAdmin();
  if (!db) return { error: NO_DB };
  await db.update(projects).set({ published, updatedAt: new Date() }).where(eq(projects.id, id));
  refresh();
  return { ok: true };
}

/** Saves a new order. `ids` is every project id, top to bottom. */
export async function reorderProjects(ids: number[]) {
  await requireAdmin();
  if (!db) return { error: NO_DB };
  const parsed = z.array(z.number().int().positive()).max(500).safeParse(ids);
  if (!parsed.success) return { error: "Couldn't save the new order." };

  const existing = await db.select({ id: projects.id }).from(projects).orderBy(asc(projects.position));
  const order = parsed.data.filter((id) => existing.some((p) => p.id === id));
  if (!order.length) return { ok: true };
  await db
    .update(projects)
    .set({
      position: sql`case ${sql.join(
        order.map((id, i) => sql`when ${projects.id} = ${id} then ${i}::int`),
        sql` `
      )} end`,
    })
    .where(inArray(projects.id, order));
  refresh();
  return { ok: true };
}
