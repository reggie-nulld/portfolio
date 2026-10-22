"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import {
  type FormState,
  NO_DB,
  imageSrc,
  safeHref,
  splitLines,
  splitList,
  splitParagraphs,
  str,
  text,
  texts,
  toFieldErrors,
} from "@/lib/admin/validation";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { siteSettings, skillGroups, socials, stats } from "@/lib/db/schema";

const profileSchema = z.object({
  name: str(60, "Name"),
  domain: str(80, "Domain"),
  avatar: imageSrc("Photo").refine((v) => v !== "", "Photo is required."),
  tagline: str(300, "Tagline"),
  typedWords: z
    .array(z.string().max(40, "Each typing phrase must be 40 characters or fewer."))
    .min(1, "Add at least one typing phrase.")
    .max(10, "Use 10 typing phrases or fewer."),
  available: z.boolean(),
  email: z.email("Enter a valid email address.").max(120),
  about: z
    .array(z.string().max(1200, "Each paragraph must be 1200 characters or fewer."))
    .min(1, "Write at least one paragraph.")
    .max(8, "Use 8 paragraphs or fewer."),
});

export async function saveProfile(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  if (!db) return { error: NO_DB };

  const parsed = profileSchema.safeParse({
    name: text(formData, "name"),
    domain: text(formData, "domain"),
    avatar: text(formData, "avatar"),
    tagline: text(formData, "tagline"),
    typedWords: splitLines(text(formData, "typedWords")),
    available: formData.get("available") === "on",
    email: text(formData, "email").trim(),
    about: splitParagraphs(text(formData, "about")),
  });
  if (!parsed.success) return toFieldErrors(parsed.error);

  const values = { ...parsed.data, updatedAt: new Date() };
  await db
    .insert(siteSettings)
    .values({ id: 1, ...values })
    .onConflictDoUpdate({ target: siteSettings.id, set: values });

  revalidatePath("/");
  return { ok: true, savedAt: Date.now() };
}

/** Zips repeated form fields (name="label" on every row) into row objects. */
function rows(formData: FormData, fields: string[]) {
  const columns = fields.map((f) => texts(formData, f));
  return columns[0].map((_, i) => Object.fromEntries(fields.map((f, j) => [f, columns[j][i] ?? ""])));
}

const statSchema = z
  .array(
    z.object({
      value: z.coerce
        .number({ error: "Number must be a whole number." })
        .int("Number must be a whole number.")
        .min(0, "Number can't be negative.")
        .max(1_000_000, "Number is too big."),
      suffix: z.string().trim().max(4, "Suffix must be 4 characters or fewer."),
      label: str(40, "Label"),
    })
  )
  .max(8, "Use 8 stats or fewer.");

export async function saveStats(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  if (!db) return { error: NO_DB };
  const parsed = statSchema.safeParse(
    rows(formData, ["value", "suffix", "label"]).map((r) => ({ ...r, value: r.value.trim() === "" ? NaN : r.value }))
  );
  if (!parsed.success) return toFieldErrors(parsed.error);

  await db.transaction(async (tx) => {
    await tx.delete(stats);
    if (parsed.data.length) await tx.insert(stats).values(parsed.data.map((s, position) => ({ ...s, position })));
  });
  revalidatePath("/");
  return { ok: true, savedAt: Date.now() };
}

const skillSchema = z
  .array(
    z.object({
      name: str(30, "Group name"),
      items: z
        .array(z.string().max(40, "Each skill must be 40 characters or fewer."))
        .min(1, "Add at least one skill.")
        .max(24, "Use 24 skills or fewer per group."),
    })
  )
  .max(8, "Use 8 groups or fewer.");

export async function saveSkills(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  if (!db) return { error: NO_DB };
  const parsed = skillSchema.safeParse(
    rows(formData, ["name", "items"]).map((r) => ({ name: r.name, items: splitList(r.items) }))
  );
  if (!parsed.success) return toFieldErrors(parsed.error);

  await db.transaction(async (tx) => {
    await tx.delete(skillGroups);
    if (parsed.data.length) {
      await tx.insert(skillGroups).values(parsed.data.map((s, position) => ({ ...s, position })));
    }
  });
  revalidatePath("/");
  return { ok: true, savedAt: Date.now() };
}

const socialSchema = z
  .array(
    z.object({
      label: str(30, "Label"),
      href: safeHref("Link").refine((v) => v !== "", "Link is required."),
    })
  )
  .max(10, "Use 10 links or fewer.");

export async function saveSocials(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  if (!db) return { error: NO_DB };
  const parsed = socialSchema.safeParse(rows(formData, ["label", "href"]));
  if (!parsed.success) return toFieldErrors(parsed.error);

  await db.transaction(async (tx) => {
    await tx.delete(socials);
    if (parsed.data.length) await tx.insert(socials).values(parsed.data.map((s, position) => ({ ...s, position })));
  });
  revalidatePath("/");
  return { ok: true, savedAt: Date.now() };
}
