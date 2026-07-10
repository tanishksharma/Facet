// Facet PWA · the one-line service worker.
//
// This file turns on offline caching and makes the site installable. All the
// real logic lives in Facet's shared engine at /lib/facet-sw.js — this stub
// exists only because a service worker can control (cache) pages at or below
// its OWN url. Served from the site ROOT, it gets whole-site scope; served
// from /lib/ it could only cache /lib/. So every project drops this one line
// at its root and inherits Facet's caching strategy. Copy it verbatim.
importScripts("/lib/facet-sw.js");
// rev 2 — this comment exists to change this file's bytes: the browser's
// update check byte-compares THIS file, and devices that registered before
// updateViaCache:"none" shipped would otherwise never refetch the engine.
