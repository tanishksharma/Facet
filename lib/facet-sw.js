/*
  facet-sw.js — the Facet service worker: offline shell, cached library
  files, and the update flow.

  What it is: the caching strategy every Facet product shares. Pages are
  served from cache instantly (they work offline and load fast), and every
  request is revalidated against the server in the background when the
  device is online. A newer version downloads silently and takes over on
  the next refresh or the next page navigation — never mid-page.

  How to use it — browsers require the registered worker to live on your
  own origin, so your project carries a one-line stub. This is the single
  exception to "never copy files in", and the line is a pointer, not a
  copy: the logic stays here and updates centrally.

    1. Create sw.js at your project root, containing exactly:

         importScripts("https://[domain]/lib/facet-sw.js");

    2. Point the facet.js script tag at it:

         <script src="https://[domain]/lib/facet.js"
                 data-service-worker="/sw.js" defer></script>

  That is the whole setup. facet.js registers the worker; this file does
  the rest. Pair it with /templates/manifest.json to make the app
  installable.

  The update flow, spelled out: while the page uses the cached copy, the
  fetch below refreshes the cache entry. The moment the visitor refreshes
  or navigates, the refreshed entry is what they get. The "flag" for
  pending updates IS the cache: newest always waits there, applied only
  at a page boundary.
*/

/* One cache for everything this worker touches. The name is versioned so
   a future strategy change can retire old caches cleanly. */
const CACHE = "facet-sw-1";

/* Take over as soon as installed: no waiting-worker limbo. */
self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      // Retire caches from older strategy versions.
      for (const name of await caches.keys()) {
        if (name !== CACHE) await caches.delete(name);
      }
      await self.clients.claim();
    })()
  );
});

/* Cache first, revalidate behind: the offline-capable fast path. */
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  event.respondWith(fromCacheThenUpdate(event));
});

async function fromCacheThenUpdate(event) {
  const cache = await caches.open(CACHE);
  const cached = await cache.match(event.request);

  const update = fetch(event.request)
    .then((response) => {
      if (response && response.ok) cache.put(event.request, response.clone());
      return response;
    })
    .catch(() => null); // offline: nothing to update with

  if (cached) {
    event.waitUntil(update); // newer version lands for the NEXT page load
    return cached;
  }

  // Nothing cached yet: use the network, or fall back to the app shell
  // for page navigations so the product still opens offline.
  const fresh = await update;
  if (fresh) return fresh;
  if (event.request.mode === "navigate") {
    const shell = await cache.match("/");
    if (shell) return shell;
  }
  return Response.error();
}
