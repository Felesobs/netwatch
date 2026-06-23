/**
 * NetWatch service worker.
 *
 * Strategy:
 * - Navigation requests: network-first, falling back to the cached
 *   `/offline` page when the network is unavailable. We deliberately do
 *   NOT cache-first navigations — usage data changes frequently and a
 *   stale dashboard shell would be confusing.
 * - Static assets (same-origin GET, non-API): stale-while-revalidate, so
 *   repeat visits are instant while staying fresh in the background.
 * - API requests (`/api/*`): always network, never cached — usage figures
 *   must never be served stale from the service worker cache. The app's
 *   own React Query cache already handles short-term reuse.
 */

const CACHE_VERSION = "netwatch-v1";
const OFFLINE_URL = "/offline";
const PRECACHE_URLS = [OFFLINE_URL, "/manifest.webmanifest"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_VERSION)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((key) => key !== CACHE_VERSION).map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  const url = new URL(request.url);

  if (request.method !== "GET" || url.origin !== self.location.origin) {
    return;
  }

  // Never intercept API calls — always hit the network directly.
  if (url.pathname.startsWith("/api/")) {
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(() =>
        caches.match(OFFLINE_URL).then((cached) => cached ?? Response.error()),
      ),
    );
    return;
  }

  event.respondWith(
    caches.open(CACHE_VERSION).then(async (cache) => {
      const cached = await cache.match(request);
      const networkFetch = fetch(request)
        .then((response) => {
          if (response.ok) cache.put(request, response.clone());
          return response;
        })
        .catch(() => cached);

      return cached ?? networkFetch;
    }),
  );
});
