/**
 * Copies the content in lib/data.ts into the database.
 *
 *   npm run db:seed            # only if the database is empty
 *   npm run db:seed -- --force # wipe the content tables and re-seed
 *
 * Messages, page views and events are never touched.
 */
import { config } from "dotenv";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as data from "../lib/data";
import { projects, siteSettings, skillGroups, socials, stats } from "../lib/db/schema";

config({ path: ".env.local" });

const url = process.env.DATABASE_URL_SESSION ?? process.env.DATABASE_URL;
if (!url) {
  console.error("✗ DATABASE_URL is not set. Add it to .env.local first.");
  process.exit(1);
}

const force = process.argv.includes("--force");
const client = postgres(url, { prepare: false, max: 1 });
const db = drizzle(client);

async function main() {
  const existing = await db.select({ id: siteSettings.id }).from(siteSettings).limit(1);
  if (existing.length && !force) {
    console.log("• Database already has content. Nothing to do (use --force to overwrite).");
    return;
  }

  await db.transaction(async (tx) => {
    if (force) {
      await tx.delete(siteSettings);
      await tx.delete(stats);
      await tx.delete(projects);
      await tx.delete(skillGroups);
      await tx.delete(socials);
    }

    await tx.insert(siteSettings).values({ id: 1, ...data.profile });
    await tx.insert(stats).values(data.stats.map((s, position) => ({ ...s, position })));
    await tx.insert(projects).values(data.projects.map((p, position) => ({ ...p, position })));
    await tx
      .insert(skillGroups)
      .values(data.skills.map((s, position) => ({ name: s.group, items: s.items, position })));
    await tx.insert(socials).values(data.socials.map((s, position) => ({ ...s, position })));
  });

  console.log(
    `✓ Seeded profile, ${data.stats.length} stats, ${data.projects.length} projects, ` +
      `${data.skills.length} skill groups and ${data.socials.length} social links.`
  );
}

main()
  .catch((err) => {
    console.error("✗ Seeding failed:", err.message ?? err);
    process.exitCode = 1;
  })
  .finally(() => client.end());
