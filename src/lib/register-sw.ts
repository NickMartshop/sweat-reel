/**
 * Progressier now owns scope "/" via its own script (loaded in __root.tsx head).
 * This module exists only to evict any legacy self-hosted /sw.js registration
 * so it doesn't compete with Progressier's worker for scope "/".
 */
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

  // Evict our legacy /sw.js so Progressier owns scope "/".
  void unregisterAll((url) => url.endsWith("/sw.js"));
}
