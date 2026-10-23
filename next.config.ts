import path from "node:path";
import type { NextConfig } from "next";

type RemotePattern = NonNullable<NonNullable<NextConfig["images"]>["remotePatterns"]>[number];

/** Images uploaded from the admin live in Supabase Storage's public "media" bucket. */
const storagePatterns: RemotePattern[] = [
  { protocol: "https", hostname: "*.supabase.co", pathname: "/storage/v1/object/public/**" },
];
try {
  // Also allow the configured project URL, which covers a local Supabase in development.
  const url = new URL(process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL ?? "");
  if (!url.hostname.endsWith(".supabase.co")) {
    storagePatterns.push({
      protocol: url.protocol.replace(":", "") as "http" | "https",
      hostname: url.hostname,
      port: url.port,
      pathname: "/storage/v1/object/public/**",
    });
  }
} catch {
  // SUPABASE_URL not set; uploads are disabled anyway.
}

const nextConfig: NextConfig = {
  // Pin the project root so a stray lockfile in a parent folder doesn't confuse Turbopack.
  turbopack: { root: path.join(__dirname) },
  images: {
    remotePatterns: storagePatterns,
    // Uploaded images get a new file name every time, so a resized copy never goes
    // stale; keep it for a year instead of re-making it every few hours.
    minimumCacheTTL: 31536000,
  },
  experimental: {
    // Image uploads from the admin. The browser shrinks them first, so this is headroom.
    serverActions: { bodySizeLimit: "4mb" },
  },
};

export default nextConfig;
