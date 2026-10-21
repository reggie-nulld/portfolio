/**
 * npm run env:check
 * Reports which settings in .env.local are present, without printing their values.
 */
import { existsSync, readdirSync } from "node:fs";
import { config } from "dotenv";

const FILE = ".env.local";
const REQUIRED = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
  "SUPABASE_SECRET_KEY",
  "ADMIN_EMAILS",
  "DATABASE_URL",
  "DATABASE_URL_SESSION",
];

console.log(`Looking in: ${process.cwd()}`);

if (!existsSync(FILE)) {
  console.log(`✗ No ${FILE} file in this folder.`);
  const lookalikes = readdirSync(".").filter((f) => /env/i.test(f) && f !== ".env.example");
  if (lookalikes.length) console.log(`  Found these instead: ${lookalikes.join(", ")}  ← rename to ${FILE}`);
  process.exit(1);
}

config({ path: FILE, quiet: true });

let ok = true;
for (const key of REQUIRED) {
  const value = process.env[key]?.trim() ?? "";
  let problem = "";
  if (!value) problem = "missing or empty";
  else if (value.includes("[") || value.includes("]")) problem = "still contains [ ] brackets";
  else if (key === "ADMIN_EMAILS" && !value.includes("@")) problem = "should be your admin email address";
  else if (key === "DATABASE_URL" && !value.includes(":6543")) problem = "should be the Transaction pooler URI (port 6543)";
  else if (key === "DATABASE_URL_SESSION" && !value.includes(":5432")) problem = "should be the Session pooler URI (port 5432)";
  else if (key.startsWith("DATABASE_URL") && !value.startsWith("postgres")) problem = "should start with postgresql://";
  console.log(`${problem ? "✗" : "✓"} ${key}${problem ? `: ${problem}` : ""}`);
  if (problem) ok = false;
}

console.log(ok ? "\nAll set. Run: npm run db:setup" : `\nFix the lines marked ✗ in ${FILE}, save the file, and run this again.`);
process.exit(ok ? 0 : 1);
