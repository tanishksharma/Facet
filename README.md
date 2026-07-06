# Facet

A plain HTML, CSS and JS design library. One stylesheet, one script, no build
step, never minified. Facet styles everything I make: apps, websites, pitch
decks, documents and business cards.

The repo root is the library's website — its documentation and living demo.
The library itself is two files in [`/lib`](lib):

- [`facet.css`](lib/facet.css) — the whole design system: tokens, base
  styles, components
- [`facet.js`](lib/facet.js) — small vanilla JS behaviours

## Use it

Two tags, pointed at the hosted files. Projects never copy the files in.

```html
<link rel="stylesheet" href="https://facet-kappa.vercel.app/lib/facet.css">
<script src="https://facet-kappa.vercel.app/lib/facet.js" defer></script>
```

Then write plain semantic HTML with Facet's classes. The
[Library page](library.html) shows every component live with its copy-paste
snippet.

**Pointing an AI at Facet?** It only needs to read [`llms.txt`](llms.txt) —
the whole library, every feature and component with snippets, in one fetch.
The commented [`facet.css`](lib/facet.css) and [`facet.js`](lib/facet.js) are
there when it needs the exact detail.

## Develop it

There is nothing to compile. Serve the repo root and open it:

```sh
python3 -m http.server 8000
```

**[`CLAUDE.md`](CLAUDE.md) is the build charter** — the project map (every
file and what it is the source of truth for), the keep-in-sync contract, the
markup rules, and the compliance checklist every new component goes through.
[`BACKLOG.md`](BACKLOG.md) is the build queue. Vercel deploys `main` on every
push.

Two audiences, two docs: **to *use* Facet, read `llms.txt`; to *build* Facet,
read `CLAUDE.md`.**
