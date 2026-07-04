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
<link rel="stylesheet" href="https://[domain]/lib/facet.css">
<script src="https://[domain]/lib/facet.js" defer></script>
```

Then write plain semantic HTML with Facet's classes. The docs site shows
every component live with its copy-paste snippet.

## Develop it

There is nothing to compile. Serve the repo root and open it:

```sh
python3 -m http.server 8000
```

Read `CLAUDE.md` for the principles, markup rules and the compliance
checklist every new component goes through. Vercel deploys `main` on every
push.
