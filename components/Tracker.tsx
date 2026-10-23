"use client";

import { useEffect } from "react";
import { track } from "@/lib/track-client";

// Module-level so a page view is sent once per page load, even when React
// runs effects twice (development Strict Mode).
let sent = false;

/** Records one page view per visit. Campaign links (?ref= or ?utm_source=) override the referrer. */
export default function Tracker() {
  useEffect(() => {
    if (sent) return;
    sent = true;
    const params = new URLSearchParams(location.search);
    const tag = params.get("ref") ?? params.get("utm_source");
    track("pageview", { referrer: tag ?? (document.referrer || undefined) });
  }, []);
  return null;
}
