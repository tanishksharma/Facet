/*
  facet-sw.js — the Facet service worker: offline shell, cached library
  files, and the update flow.

  What it is: the caching strategy every Facet product shares, shaped by
  the caching law (see Platform laws on the library homepage). Pages and
  the library files themselves are NETWORK-FIRST: every refresh loads
  the current deploy from the server, and the cache answers only when
  the network fails — so the product works offline without ever showing
  a stale page when online. Other static assets (images, fonts, icons)
  are served from cache instantly and revalidated in the background.

  Why network-first for pages: a worker that serves pages from cache and
  revalidates behind makes every deploy invisible until a second
  refresh. That exact bug shipped in a real Facet product and was fixed
  by switching pages to network-first. The rule is law now: HTML and,
  until v1 freezes exist, the /lib/ files are never cache-first.

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
*/

/* One cache for everything this worker touches. The name is versioned so
   a strategy change retires old caches cleanly (v1 was cache-first for
   pages — the stale-deploy bug — v2 is network-first). */
const CACHE = "facet-sw-2";

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

/* Pages and library files: network first, cache only as the offline
   fallback. Everything else: cache first, revalidated behind. */
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  event.respondWith(
    mustBeFresh(event.request)
      ? fromNetworkThenCache(event)
      : fromCacheThenUpdate(event)
  );
});

/* The caching law's scope: any navigation (an HTML document) and the
   unversioned library files. Frozen /lib/v1/ copies, when they exist,
   are immutable and safe to cache-first — hence the /lib/v\d exception. */
function mustBeFresh(request) {
  if (request.mode === "navigate") return true;
  const path = new URL(request.url).pathname;
  return /^\/lib\/(?!v\d)/.test(path);
}

async function fromNetworkThenCache(event) {
  const cache = await caches.open(CACHE);
  try {
    const fresh = await fetch(event.request);
    if (fresh && fresh.ok) cache.put(event.request, fresh.clone());
    return fresh;
  } catch {
    // Offline: the cached copy, or the app shell for page navigations.
    const cached = await cache.match(event.request);
    if (cached) return cached;
    if (event.request.mode === "navigate") {
      const shell = await cache.match("/");
      if (shell) return shell;
    }
    return Response.error();
  }
}

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

  const fresh = await update;
  if (fresh) return fresh;
  return Response.error();
}
