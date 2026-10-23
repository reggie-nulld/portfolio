"use server";

import { and, count, eq, gte } from "drizzle-orm";
import { headers } from "next/headers";
import { after } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { messages } from "@/lib/db/schema";
import { sendMessageAlert } from "@/lib/email";

export type ContactState = {
  ok?: boolean;
  error?: string;
  fieldErrors?: Partial<Record<"name" | "email" | "body", string>>;
  values?: { name: string; email: string; body: string };
};

const schema = z.object({
  name: z.string().trim().min(1, "Please enter your name.").max(80, "Name is too long."),
  email: z.email("Please enter a valid email address.").max(120, "Email is too long."),
  body: z
    .string()
    .trim()
    .min(10, "Please write a little more (at least 10 characters).")
    .max(4000, "Please keep it under 4000 characters."),
});

// Spam limits: per sender address, and for the whole site.
const PER_SENDER_PER_HOUR = 3;
const SITE_PER_HOUR = 30;
// Real people take a few seconds to fill the form in.
const MIN_FILL_MS = 3000;

export async function sendMessage(_prev: ContactState, formData: FormData): Promise<ContactState> {
  const values = {
    name: String(formData.get("name") ?? ""),
    email: String(formData.get("email") ?? "").trim(),
    body: String(formData.get("body") ?? ""),
  };

  // Bots fill in the hidden "website" field or submit instantly. Pretend it worked.
  const startedAt = Number(formData.get("startedAt"));
  if (formData.get("website") || !startedAt || Date.now() - startedAt < MIN_FILL_MS) return { ok: true };

  const parsed = schema.safeParse(values);
  if (!parsed.success) {
    const fieldErrors: ContactState["fieldErrors"] = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0] as keyof NonNullable<ContactState["fieldErrors"]>;
      fieldErrors[key] ??= issue.message;
    }
    return { error: "Please check the highlighted fields.", fieldErrors, values };
  }
  if (!db) return { error: "Messages can't be received right now. Please email me instead.", values };

  const hourAgo = new Date(Date.now() - 3_600_000);
  const [[mine], [all]] = await Promise.all([
    db
      .select({ n: count() })
      .from(messages)
      .where(and(eq(messages.email, parsed.data.email), gte(messages.createdAt, hourAgo))),
    db.select({ n: count() }).from(messages).where(gte(messages.createdAt, hourAgo)),
  ]);
  if (mine.n >= PER_SENDER_PER_HOUR || all.n >= SITE_PER_HOUR) {
    return { error: "Too many messages right now. Please try again later or email me directly.", values };
  }

  await db.insert(messages).values(parsed.data);

  const siteUrl = await getSiteUrl();
  // Send the email after replying, so the visitor isn't kept waiting on Resend.
  after(() => sendMessageAlert(parsed.data, siteUrl));

  return { ok: true };
}

/** The site's own address for links in alert emails. Vercel provides the production domain. */
async function getSiteUrl() {
  if (process.env.SITE_URL) return process.env.SITE_URL.replace(/\/$/, "");
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  const host = (await headers()).get("host") ?? "localhost:3737";
  return `${host.startsWith("localhost") || host.startsWith("127.") ? "http" : "https"}://${host}`;
}
