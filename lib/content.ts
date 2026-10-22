import "server-only";
import { asc, eq } from "drizzle-orm";
import { cache } from "react";
import * as fallback from "./data";
import { db } from "./db";
import { projects, siteSettings, skillGroups, socials, stats } from "./db/schema";

export type Profile = typeof fallback.profile;
export type Stat = (typeof fallback.stats)[number];
export type Project = fallback.Project;
export type SkillGroup = (typeof fallback.skills)[number];
export type Social = (typeof fallback.socials)[number];

export type SiteContent = {
  profile: Profile;
  stats: Stat[];
  projects: Project[];
  skills: SkillGroup[];
  socials: Social[];
};

const fallbackContent: SiteContent = {
  profile: fallback.profile,
  stats: fallback.stats,
  projects: fallback.projects,
  skills: fallback.skills,
  socials: fallback.socials,
};

async function loadContent(): Promise<SiteContent> {
  return (await readContent()).content;
}

/**
 * Site content plus where it came from. The admin Content page uses the flags to
 * explain when it's showing the built-in starter content instead of saved content.
 */
export async function getAllContent() {
  return readContent();
}

async function readContent(): Promise<{ content: SiteContent; fromDatabase: boolean; hasDatabase: boolean }> {
  if (!db) return { content: fallbackContent, fromDatabase: false, hasDatabase: false };

  const [settingsRows, statRows, projectRows, skillRows, socialRows] = await Promise.all([
    db.select().from(siteSettings).where(eq(siteSettings.id, 1)).limit(1),
    db.select().from(stats).orderBy(asc(stats.position), asc(stats.id)),
    db
      .select()
      .from(projects)
      .where(eq(projects.published, true))
      .orderBy(asc(projects.position), asc(projects.id)),
    db.select().from(skillGroups).orderBy(asc(skillGroups.position), asc(skillGroups.id)),
    db.select().from(socials).orderBy(asc(socials.position), asc(socials.id)),
  ]);

  const settings = settingsRows[0];
  // An empty database (seed not run yet) shouldn't blank the site.
  if (!settings) return { content: fallbackContent, fromDatabase: false, hasDatabase: true };

  const content: SiteContent = {
    profile: {
      name: settings.name,
      domain: settings.domain,
      avatar: settings.avatar,
      tagline: settings.tagline,
      typedWords: settings.typedWords,
      available: settings.available,
      email: settings.email,
      about: settings.about,
    },
    stats: statRows.map(({ value, suffix, label }) => ({ value, suffix, label })),
    projects: projectRows.map(({ id, title, description, tags, href, githubUrl, imageUrl, year, featured }) => ({
      id,
      title,
      description,
      tags,
      href,
      githubUrl,
      imageUrl,
      year,
      featured,
    })),
    skills: skillRows.map(({ name, items }) => ({ group: name, items })),
    socials: socialRows.map(({ label, href }) => ({ label, href })),
  };
  return { content, fromDatabase: true, hasDatabase: true };
}

/**
 * Loads site content once per render (shared by the page and its metadata).
 * Freshness comes from the page's `revalidate` setting, plus revalidatePath("/")
 * when the admin saves, so every build and refresh reads the database directly.
 */
export const getContent = cache(loadContent);
