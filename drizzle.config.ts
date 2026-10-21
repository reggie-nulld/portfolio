import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

config({ path: ".env.local", quiet: true });

const url = process.env.DATABASE_URL_SESSION || process.env.DATABASE_URL || "";
// `db:generate` works without a database, so warn instead of failing.
if (!url) {
  console.warn(
    "\n⚠ No database URL found in .env.local. Run `npm run env:check` to see what's missing.\n"
  );
}

export default defineConfig({
  schema: "./lib/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    // Session pooler (port 5432) is better for migrations than the transaction pooler.
    url,
  },
});
