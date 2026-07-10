/**
 * Guarded service-worker registration for /sw.js (scope "/").
 *
 * Refuses to register in dev, iframes, Lovable preview hosts, or when
 * `?sw=off` is present. In any refused context, actively unregisters
 * any existing /sw.js so stale caches don't break the editor.
 *
 * Also unregisters any leftover Progressier service worker so it doesn't
 * compete with /sw.js for scope "/".
 */
const PREVIEW_HOST_SUFFIXES = [
  ".lovableproject.com",
  ".lovableproject-dev.com",
  ".beta.lovable.dev",
];

function isPreviewHost(hostname: string): boolean {
  if (
    hostname === "lovableproject.com" ||
    hostname === "lovableproject-dev.com" ||
    hostname === "beta.lovable.dev"
  )
    return true;
  if (hostname.startsWith("id-preview--") || hostname.startsWith("preview--")) return true;
  return PREVIEW_HOST_SUFFIXES.some((s) => hostname.endsWith(s));
}

function shouldRefuse(): boolean {
  if (!import.meta.env.PROD) return true;
  if (typeof window === "undefined") return true;
  try {
    if (window.self !== window.top) return true;
  } catch {
    return true;
  }
  if (isPreviewHost(window.location.hostname)) return true;
  if (new URLSearchParams(window.location.search).get("sw") === "off") return true;
  return false;
}

async function unregisterAll(matcher: (scriptURL: string) => boolean) {
  try {
    if (!("serviceWorker" in navigator)) return;
    const regs = await navigator.serviceWorker.getRegistrations();
    for (const reg of regs) {
      const url =
        reg.active?.scriptURL || reg.installing?.scriptURL || reg.waiting?.scriptURL || "";
      if (matcher(url)) await reg.unregister();
    }
  } catch {
    /* noop */
  }
}

export function registerSw() {
  if (typeof window === "undefined") return;
  if (!("serviceWorker" in navigator)) return;

  // Always evict any lingering Progressier worker — we own scope "/" now.
  void unregisterAll((url) => url.includes("progressier.app"));

  if (shouldRefuse()) {
    // Also clear our own /sw.js in refused contexts (dev/preview/iframe/?sw=off).
    void unregisterAll((url) => url.endsWith("/sw.js"));
    return;
  }

  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js", { scope: "/" })
      .then((reg) => {
        console.log("[SweatReel] SW registered:", reg.scope);
      })
      .catch((err) => {
        console.warn("[SweatReel] SW registration failed:", err);
      });
  });
}
