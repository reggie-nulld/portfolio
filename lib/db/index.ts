import "server-only";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

// Reuse one client across hot reloads in development.
const globalForDb = globalThis as unknown as { pgClient?: ReturnType<typeof postgres> };

function createDb() {
  const url = process.env.DATABASE_URL;
  if (!url) return null;
  const client =
    globalForDb.pgClient ??
    // Supabase's transaction pooler doesn't support prepared statements.
    postgres(url, { prepare: false, max: 5 });
  if (process.env.NODE_ENV !== "production") globalForDb.pgClient = client;
  return drizzle(client, { schema });
}

/** Null when DATABASE_URL isn't set, so the site can fall back to lib/data.ts. */
export const db = createDb();
