/** Sends an analytics event to /api/track without slowing the page or blocking navigation. */
export function track(type: "pageview" | "project_click", extra: { referrer?: string; target?: string } = {}) {
  if (typeof window === "undefined") return;
  const body = JSON.stringify({ type, path: location.pathname, ...extra });
  try {
    if (navigator.sendBeacon?.(`/api/track`, new Blob([body], { type: "application/json" }))) return;
  } catch {
    // Fall through to fetch.
  }
  fetch("/api/track", { method: "POST", body, keepalive: true, headers: { "content-type": "application/json" } }).catch(
    () => {}
  );
}
