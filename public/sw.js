const RESET_PARAM = "rcds_sw_reset";

async function clearRcDriftSyncCaches() {
  const keys = await caches.keys();
  await Promise.all(keys.filter((key) => key.startsWith("rc-drift-sync")).map((key) => caches.delete(key)));
}

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(clearRcDriftSyncCaches());
});

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    await clearRcDriftSyncCaches();
    await self.clients.claim();
    const clients = await self.clients.matchAll({ includeUncontrolled: true, type: "window" });
    await Promise.all(clients.map((client) => {
      const url = new URL(client.url);
      url.searchParams.set(RESET_PARAM, Date.now().toString());
      return client.navigate(url.toString());
    }));
    await self.registration.unregister();
  })());
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;
  event.respondWith(fetch(event.request, { cache: "no-store" }));
});
