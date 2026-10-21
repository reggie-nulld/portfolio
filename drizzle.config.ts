import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

config({ path: ".env.local" });

export default defineConfig({
  schema: "./lib/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    // Session pooler (port 5432) is better for migrations than the transaction pooler.
    url: process.env.DATABASE_URL_SESSION ?? process.env.DATABASE_URL ?? "",
  },
});
