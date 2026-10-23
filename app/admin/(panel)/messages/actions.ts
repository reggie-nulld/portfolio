"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { NO_DB } from "@/lib/admin/validation";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { messages } from "@/lib/db/schema";

const id = z.number().int().positive();

export async function setRead(messageId: number, read: boolean) {
  await requireAdmin();
  if (!db) return { error: NO_DB };
  if (!id.safeParse(messageId).success) return { error: "Unknown message." };
  await db.update(messages).set({ read }).where(eq(messages.id, messageId));
  // The unread count shows in the sidebar and on the dashboard.
  revalidatePath("/admin", "layout");
  return { ok: true };
}

export async function deleteMessage(messageId: number) {
  await requireAdmin();
  if (!db) return { error: NO_DB };
  if (!id.safeParse(messageId).success) return { error: "Unknown message." };
  await db.delete(messages).where(eq(messages.id, messageId));
  revalidatePath("/admin", "layout");
  return { ok: true };
}
