/**
 * Guarded service-worker registration.
 *
 * Refuses to register in dev, iframes, Lovable preview hosts, or when
 * `?sw=off` is present. In any refused context, actively unregisters
 * any existing /sw.js to avoid stale caches breaking the editor.
 */
const PREVIEW_HOST_SUFFIXES = [
  ".lovableproject.com",
  ".lovableproject-dev.com",
  ".beta.lovable.dev",
];

function isPreviewHost(hostname: string): boolean {
  if (hostname === "lovableproject.com" || hostname === "lovableproject-dev.com" || hostname === "beta.lovable.dev") return true;
  if (hostname.startsWith("id-preview--") || hostname.startsWith("preview--")) return true;
  return PREVIEW_HOST_SUFFIXES.some((s) => hostname.endsWith(s));
}

async function unregisterExisting() {
  try {
    if (!("serviceWorker" in navigator)) return;
    const regs = await navigator.serviceWorker.getRegistrations();
    for (const reg of regs) {
      const url = reg.active?.scriptURL || reg.installing?.scriptURL || reg.waiting?.scriptURL || "";
      if (url.endsWith("/sw.js")) await reg.unregister();
    }
  } catch {
    /* noop */
  }
}

export function registerSw() {
  if (typeof window === "undefined") return;
  // Progressier owns the service worker now. Unconditionally remove any
  // legacy /sw.js registration so it doesn't compete for scope "/".
  void unregisterExisting();
}

