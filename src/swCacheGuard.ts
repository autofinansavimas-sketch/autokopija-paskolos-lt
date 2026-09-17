// Keeps browsers from running an old cached copy of the app.
//
// Admin routes must never be served from the offline cache: there we remove any
// installed service worker and its caches, then reload once so the freshly
// deployed files are used. On public pages we keep the offline support but
// actively check for a new deploy and reload as soon as it takes over.

const ADMIN_PREFIXES = ["/admin", "/admin-login", "/meta-review"];

const RELOAD_FLAG = "sw-cache-guard-reloaded";

const isAdminPath = () => {
  const path = window.location.pathname;
  const spaPath = window.location.search.startsWith("?/")
    ? window.location.search.slice(2)
    : "";
  return ADMIN_PREFIXES.some(
    (prefix) => path.startsWith(prefix) || ("/" + spaPath).startsWith(prefix),
  );
};

const clearCaches = async () => {
  if (!("caches" in window)) return;
  const keys = await caches.keys();
  await Promise.all(keys.map((key) => caches.delete(key)));
};

export function installCacheGuard() {
  if (!("serviceWorker" in navigator)) return;

  if (isAdminPath()) {
    void (async () => {
      try {
        const regs = await navigator.serviceWorker.getRegistrations();
        const hadWorker = regs.length > 0 || !!navigator.serviceWorker.controller;
        await Promise.all(regs.map((reg) => reg.unregister()));
        await clearCaches();

        // Reload once so the page is fetched from the network, not the cache.
        if (hadWorker && !sessionStorage.getItem(RELOAD_FLAG)) {
          sessionStorage.setItem(RELOAD_FLAG, "1");
          window.location.reload();
        }
      } catch {
        // Ignore: worst case the admin keeps the current page.
      }
    })();
    return;
  }

  // Public pages: pick up new deploys quickly.
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    if (sessionStorage.getItem(RELOAD_FLAG)) return;
    sessionStorage.setItem(RELOAD_FLAG, "1");
    window.location.reload();
  });

  const checkForUpdate = async () => {
    try {
      const regs = await navigator.serviceWorker.getRegistrations();
      await Promise.all(regs.map((reg) => reg.update()));
    } catch {
      // Offline or blocked: nothing to do.
    }
  };

  window.addEventListener("load", () => void checkForUpdate());
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") void checkForUpdate();
  });
}
