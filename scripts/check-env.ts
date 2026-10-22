/**
 * npm run env:check
 * Reports which settings in .env.local are present, without printing their values.
 */
import { lookup } from "node:dns/promises";
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

/** Catches passwords with symbols that break the address (e.g. host parsed as "3"). */
function checkDatabaseUrl(value: string) {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return "isn't a valid address. If your password has symbols (@ # / ? : %), reset it to letters and numbers only";
  }
  if (!url.password) return "has no password. Replace [YOUR-PASSWORD] with your database password";
  const rawPassword = value.match(/^postgres(?:ql)?:\/\/[^:/]+:(.*)@[^@]+$/)?.[1] ?? "";
  if (rawPassword.includes("%")) return "password contains %, which changes how it's read. Reset it to letters and numbers only";
  if (!url.port || url.pathname.length < 2) {
    return "looks cut off (no port or database name at the end). A # in your password starts a comment in .env.local; reset it to letters and numbers only";
  }
  if (!/\.supabase\.(com|co)$/.test(url.hostname)) {
    return `server name reads as "${url.hostname}" instead of ...supabase.com. Your password probably contains a symbol (@ # / ? :). Reset it to letters and numbers only, then paste the new one`;
  }
  return "";
}

/** postgresql://user:••••@host:port/db, safe to share. */
function maskPassword(value: string) {
  const m = value.match(/^(postgres(?:ql)?:\/\/[^:/@]+:)(.*)(@[^@]*)$/);
  // Can't split it safely: show nothing after the username rather than risk leaking the password.
  if (!m) return `${value.match(/^postgres(?:ql)?:\/\/[^:/@]*/)?.[0] ?? "(unreadable)"}:•••• (rest hidden)`;
  const [, head, pw, tail] = m;
  return `${head}${"•".repeat(Math.min(pw.length, 8))}(${pw.length} chars${/[#/?%]/.test(pw) ? ", has symbols" : ""})${tail}`;
}

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
  let problem: string = "";
  if (!value) problem = "missing or empty";
  else if (value.includes("[") || value.includes("]")) problem = "still contains [ ] brackets";
  else if (key === "ADMIN_EMAILS" && !value.includes("@")) problem = "should be your admin email address";
  else if (key === "NEXT_PUBLIC_SUPABASE_URL" && !/^https:\/\/[a-z0-9]+\.supabase\.co\/?$/.test(value)) {
    problem = "should be just https://<project-id>.supabase.co with nothing after it (remove /rest/v1)";
  }
  else if (key.startsWith("DATABASE_URL") && !value.startsWith("postgres")) problem = "should start with postgresql://";
  else if (key.startsWith("DATABASE_URL") && (problem = checkDatabaseUrl(value))) {}
  else if (key === "DATABASE_URL" && !value.includes(":6543")) problem = "should be the Transaction pooler URI (port 6543)";
  else if (key === "DATABASE_URL_SESSION" && !value.includes(":5432")) problem = "should be the Session pooler URI (port 5432)";
  console.log(`${problem ? "✗" : "✓"} ${key}${problem ? `: ${problem}` : ""}`);
  if (key.startsWith("DATABASE_URL") && value) console.log(`    ${maskPassword(value)}`);
  if (problem) ok = false;
}

// The project ID appears in both the API URL (https://<id>.supabase.co) and the database
// username (postgres.<id>). A mismatch means the settings come from two different projects.
function checkSameProject() {
  if (!ok) return;
  const apiRef = process.env.NEXT_PUBLIC_SUPABASE_URL?.match(/^https:\/\/([a-z0-9]+)\.supabase\.co/)?.[1];
  for (const key of ["DATABASE_URL", "DATABASE_URL_SESSION"]) {
    const dbRef = decodeURIComponent(new URL(process.env[key]!.trim()).username).match(/^postgres\.([a-z0-9]+)$/)?.[1];
    if (apiRef && dbRef && apiRef !== dbRef) {
      ok = false;
      console.log(
        `✗ ${key}: belongs to project "${dbRef}" but NEXT_PUBLIC_SUPABASE_URL is project "${apiRef}". ` +
          `Copy every value from the same Supabase project`
      );
    }
  }
  if (ok && apiRef) console.log(`✓ All settings point to the same project (${apiRef})`);
}

// Look the database servers up for real: catches a mistyped or hand-edited server name.
async function checkServers() {
  if (!ok) return;
  for (const key of ["DATABASE_URL", "DATABASE_URL_SESSION"]) {
    const host = new URL(process.env[key]!.trim()).hostname;
    try {
      await lookup(host);
      console.log(`✓ ${key}: server ${host} found`);
    } catch {
      ok = false;
      console.log(
        `✗ ${key}: server "${host}" doesn't exist (or you're offline). In Supabase, click Connect and ` +
          `copy the address exactly as shown (don't edit the server part)`
      );
    }
  }
}

checkSameProject();
checkServers().then(() => {
  console.log(ok ? "\nAll set. Run: npm run db:setup" : `\nFix the lines marked ✗ in ${FILE}, save the file, and run this again.`);
  process.exit(ok ? 0 : 1);
});
