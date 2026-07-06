# Facet — the build charter
===============================================================================

> **What this file is.** The single source of truth for *building and maintaining* Facet: its principles, the project map, the keep-in-sync contract, and the checklist a contributor or AI follows to add to the library. Both a human and an AI can read it top to bottom.
>
> **You probably don't need this to *use* Facet.** If you just want to build a page with it, read [`llms.txt`](llms.txt) (the usage guide) or start on the [home page](index.html). This charter is for people extending the library itself.
>
> Everything below is written as instructions a human or an AI follows to build and extend the library — the requirements the library holds itself to, not a workflow.

Facet is a plain HTML, CSS and JS design library used across everything: apps, websites, pitch decks, documents and business cards. It is one CSS file and one JS file hosted at a public URL. Any project pulls it in with one link tag and one script tag. No React, no build step, no npm install, never minified.

**This repo is the sole source of truth.** The Facet Notion page is a charter only: vision and requirements, never implementation detail. The backlog lives as a section at the end of this file (see Backlog, below).

The repo root is the library's website, deployed by Vercel as a static site on every push to `main`. It is a small multi-page site: the **home page** (`index.html`) is the pitch — philosophy, a curated feature list, and how to use it — and the **Library** (`library.html`) is the catalogue, where every token, component, block, template and app-feel behaviour is live with its exact copy-paste code. The library itself is the two files in `/lib`.

```
/lib
  facet.css        the whole design system
  facet.js         small vanilla JS behaviours
  facet-sw.js      the shared PWA caching engine (network-first pages)
/templates
  landing.html     marketing page assembled from the block layer
  saas.html        SaaS analytics dashboard: sidebar, KPIs, chart, table
  social.html      social app: three-column feed, tab bar, settings sheet
  app.html         app shell + dashboard, installable (PWA + sw stub)
  article.html     editorial page with the JSON-LD article slot
  deck.html        1920x1080 pitch deck: five layouts, arrow keys,
                   print-to-PDF at exact size
  document.html    A4 pages: letterhead, invoice, one-pager
  card.html        3.5x2in business card, front/back + print sheet
  manifest.json    the PWA manifest template
index.html         home: philosophy, curated features, how-to (people vs AI), principles
library.html       the whole library on one page — one growing ladder:
                   Layer 1 Tokens & base, 2 Components (grouped + filterable),
                   3 Blocks, 4 Templates (with live device previews), 5 App feel
playground.html    live playground (renders through the real library files)
build.html         theme builder + Skin Lab
docs.css           docs-site styles (NOT part of /lib)
docs.js            docs-site behaviour (NOT part of /lib)
llms.txt           the full usage guide as plain text for AI crawlers
sw.js              PWA: one-line service worker at the root (loads facet-sw.js)
manifest.json      PWA: the site's install manifest (also the copy reference)
icons/             PWA: app icon PNGs (180 apple, 192, 512, 512-maskable)
```

Projects consume the library by URL, never by copying files in:

```html
<link rel="stylesheet" href="https://[domain]/lib/facet.css">
<script src="https://[domain]/lib/facet.js" defer></script>
```


-------------------------------------------------------------------------------

## Project map — every file, and what it is the source of truth for
===============================================================================


Two audiences, two canonical docs: **to USE Facet, read `llms.txt`**; **to BUILD Facet, read this file (`CLAUDE.md`)**. Everything else hangs off those.

`/lib/facet.css`
    What:      the whole design system: tokens, base, every component, all themes
    Read by:   consumers' AI, contributors
    Truth for: all styling; every theme hex

`/lib/facet.js`
    What:      the behaviours, one small named function each
    Read by:   consumers' AI, contributors
    Truth for: all behaviour; the public facet.* API

`index.html`
    What:      home: philosophy, curated Features, how-to (people vs AI), principles
    Read by:   people
    Truth for: the human pitch

`library.html`
    What:      the catalogue — Layers 1-5 live, with exact snippets + reference blocks
    Read by:   people
    Truth for: the live component wall (demos + copy-paste HTML)

`playground.html`
    What:      live playground (renders through the real library files)
    Read by:   people
    Truth for: -

`build.html`
    What:      visual theme builder + Skin Lab
    Read by:   people
    Truth for: -

`/templates/*.html`
    What:      whole-page starters (landing, saas, social, app, article, deck, document, card)
    Read by:   people, consumers' AI
    Truth for: starter pages

`llms.txt`
    What:      the full usage guide in one plain-text fetch
    Read by:   consumers' AI (PRIMARY)
    Truth for: the exhaustive capability + component inventory

`CLAUDE.md  (this file)`
    What:      the build/maintain charter — and the Backlog section at the end
    Read by:   Claude + contributors
    Truth for: how to build and add to the library; what to build next

`README.md`
    What:      GitHub front door: what it is, how to consume, how to develop
    Read by:   people arriving via GitHub
    Truth for: -

`docs.css / docs.js`
    What:      docs-site styling + behaviour — NOT shipped in /lib
    Read by:   contributors
    Truth for: the docs site's own styling and scripts

`sitemap.xml`
    What:      a plain URL list for search-engine crawlers — SEO only; not descriptions, and not what an AI reads (AI reads llms.txt)
    Read by:   crawlers
    Truth for: -

`robots.txt`
    What:      crawler policy; points to the sitemap
    Read by:   crawlers
    Truth for: -

### Keep-in-sync contract — what one change must touch

Adding or changing a component means updating all of these in the **same commit**, or it drifts:

1. `/lib/facet.css` — the component's own commented section.
2. `/lib/facet.js` — its behaviour, if any (one named function).
3. `library.html` — its wall entry: live demo of every variant/state + the exact snippet.
4. `llms.txt` — its full usage entry, plus its line in the capability inventory. **llms.txt is the source of truth for "does this exist".**
5. `index.html` — a curated Features card ONLY if it is a headline, user-facing capability. The home Features are the human subset, not the exhaustive list; the exhaustive list is `llms.txt`.
6. The Backlog section at the end of this file — tick the item.

The description text is written once and reused word-for-word in three places: the file comment in `facet.css`/`facet.js`, the `library.html` wall entry, and `llms.txt`.

When a page is added, renamed or removed, update three places together: this project map, `sitemap.xml`, and the header nav on every page.


-------------------------------------------------------------------------------

## Manifesto
===============================================================================


- Readability is the product. Modern frontend is deeply nested markup and minified output, unreadable by humans. This library is the opposite.
- One-glance HTML: any page's structure makes sense on first read. Semantic tags, self-explanatory classes.
- The wrapper law: not one extra wrapper. A container inside a container exists only to enable a real feature — scroll areas, sticky regions, overflow clipping. No other reason is acceptable.
- Least code that stays readable: entire products are assembled by writing HTML files with the right classes. Nothing else to touch.
- Pure HTML, CSS and JS. No build step, no framework, never minified. Gzip handles size.
- One-step theme change: one attribute on the html tag restyles the whole page, layout containers included.
- Everything explained in place: every interactive element carries a description tooltip.
- Motion by default: gyroscope parallax and idle animations, with reduced motion honoured. (Shipped as the App-feel layer: parallax, idle motion, sound and haptics.)
- Fully commented: every file self-describes with intros, usage notes and to-dos, so any AI can build products with it.
- Works without JavaScript. Content, layout, links and forms all work with JS switched off — JavaScript only adds enhancements on top.
- Accessible, SEO-ready and AI-crawlable by default. Enforced through the compliance checklist, not optional.


-------------------------------------------------------------------------------

## AI-NATIVE OPERATION
===============================================================================


Everything built with Facet is operable by AI agents through the DOM alone.

- Shallow semantic structure, readable in one pass: an agent that reads the HTML top to bottom understands the page without executing anything.
- Every action is a real `button` or `a` with an accessible name (text content or aria-label). No div-with-onclick, ever.
- Every page and state is reachable by URL: inputs read and write the query string, so any state can be linked to, restored, and produced by an agent constructing a URL.
- Stable, descriptive IDs on sections and elements; stable, descriptive `data-event` names on key actions. Agents and analytics target the same hooks.
- llms.txt at the site root is the full plain-text usage guide: an agent can learn the entire library from one fetch.


-------------------------------------------------------------------------------

## Markup rules
===============================================================================


- Semantic tags over div: header, nav, main, section, article, aside, footer, figure.
- An element exists only to hold content, create layout, or carry behavior. Anything else is deleted.
- Structural elements contain content or other structural elements. Never decorative nesting.
- Buttons are `button`, links are `a`, form fields have real `label` elements.
- One h1 per page. Heading levels never skip.


-------------------------------------------------------------------------------

## Adding a new component: the compliance checklist
===============================================================================


- [ ] Semantic tokens only. No raw hex, px sizes outside the scales, or hardcoded fonts.
- [ ] Works in every theme and in light and dark with zero extra code.
- [ ] All states covered: hover, focus, active, disabled, and where relevant empty, loading, error.
- [ ] Keyboard operable with a visible focus ring. ARIA roles and labels where semantics fall short.
- [ ] Interactive elements ship with a description tooltip.
- [ ] Responsive and mobile-usable: 44px touch targets, no hover-only interactions.
- [ ] Minimal semantic markup. Every element has a job, per the markup rules.
- [ ] Fully commented in the file: what it is, how to use it, its options, open to-dos — usage notes matching the docs text word for word.
- [ ] Names follow the naming rules. Nothing minified.
- [ ] Analytics hook on its key action where relevant: a `data-event` attribute.
- [ ] Wall entry added on library.html: live demo of every variant and state, variant and state chips, exact snippet with copy button.
- [ ] Docs description added: what it is, what it is for, when to use it. Written to read as AI instructions, the same text word for word in the file comment, the wall entry and llms.txt.
- [ ] Inventory updated in the same commit: the capability's full entry in llms.txt (the exhaustive list); a curated card in the index.html Features section only if it is a headline user-facing feature.
- [ ] Committed to Git with a clear message.


-------------------------------------------------------------------------------

## Non-negotiables — every page & component
===============================================================================


These are build requirements, not a feature pitch: every page and component must meet them. (The user-facing versions live in the home Features; how to use each lives in llms.txt.)

**Accessible.** Everything reachable and operable by keyboard, with a visible focus ring, and a skip-to-content link on every page. Alt text on images; ARIA labels on icon-only controls and complex components. AA contrast in every theme, light and dark. `prefers-reduced-motion` collapses all library motion to nothing.

**Crawlable & AI-readable (SEO).** Every page and template ships the head pack — title, meta description, OG tags, canonical, favicon. JSON-LD slots in templates (article, product, organization). All content renders as static HTML — nothing needs JS to appear — so crawlers and AI read everything. sitemap.xml, robots.txt and clean URLs; lazy-loaded images.

**App-ready (PWA).** The starter is installable — manifest.json plus a full icon set. The shared service worker (facet-sw.js) is network-first for pages and unversioned /lib/ files (cache only answers offline), cache-first + revalidate for other assets; updates ship by redeploying. Mobile-first defaults: safe-area insets, 44px touch targets, viewport handled in the base.


-------------------------------------------------------------------------------

## iOS rules — fixes for real iPhone bugs
===============================================================================


iOS breaks in ways desktop browsers don't. Each rule below exists because we shipped a real app, hit that exact bug, and this is the fix — ignore one and the bug comes back. They bind anything built in or added to the library. (These are builder rules; the user-facing version is not on the homepage.)

- Pager law: full-page snap sections that can outgrow the viewport are never built with CSS scroll-snap; the pager model (.snap upgraded by facet.js) is the only thing that survives iOS.
- Gesture law: `touch-action: pan-y` on scrollers, `manipulation` on fixed navigation and controls, `none` on drag surfaces; `gesturestart` preventDefault covers older iOS pinch; never rely on viewport `user-scalable=no`.
- App shell law: standalone PWAs need `viewport-fit=cover` PLUS the apple-mobile-web-app metas (capable + black-translucent status bar), safe-area env() insets in section padding, and manifest colors that match the shipped theme.
- Caching law: HTML and unversioned /lib/ files are never cache-first — network first, cache only offline. Cache-first pages hide every deploy until a second refresh; that bug shipped once and is now law.
- Parallax exclusion: elements carrying their own transform physics (velvet lift/press, the pager's elastic overscroll) never register with facetMotion — two writers on one inline transform collide.
- Font-list law: never put `inherit` inside a font-family list; it silently invalidates the whole declaration. Stacks end in a generic family.


-------------------------------------------------------------------------------

## Analytics
===============================================================================


- No analytics vendor is baked in — bring your own.
- Every key action carries a stable `data-event="name"` attribute (documented per component). To track them: add ONE click listener that finds the nearest `[data-event]` and forwards its name to your tool — `document.addEventListener("click", e => { const el = e.target.closest("[data-event]"); if (el) track(el.dataset.event); })`. Because the hook is a plain attribute, any vendor (GA, Plausible, PostHog, …) wires the same way. The copy-paste version lives in llms.txt under Analytics.


-------------------------------------------------------------------------------

## Naming and code quality
===============================================================================


- Tokens named by role, not value: `--surface`, not `--gray-100`. This extends to spacing and type: name them by intent (card spacing, section spacing, heading, body, caption) — never by a bare number a builder has to memorise (`--space-2`, `--text-h3` were the old value-named scale, now retired). Density and type size are one global three-step control (small/medium/large), and both are set BY THE THEME — you never pick a theme and its spacing separately.
- One class prefix and pattern for components: `.btn`, `.btn-primary`, predictable everywhere.
- JS: one small named function per behavior. The name says what it does.
- Never minify. The shipped files are the readable, commented source.


-------------------------------------------------------------------------------

## Rules for building and maintaining
===============================================================================


- Docs are demos. A component is not done until the Library wall (library.html) shows it live with its code.
- One component, one clearly commented section in the CSS file. Nothing is scattered.
- Growth by extraction: build a new pattern inside a project first, promote it once it repeats.
- App logic, data fetching and state management live in projects, never in the library.
- Docs-only styles and scripts live in docs.css and docs.js — never in /lib. They serve the docs site's own styling and scripts, not the shipped library.
- Every new component passes the full compliance checklist above before it ships.
- The inventory rule: llms.txt is the exhaustive list of every capability the library ships — if it is not in llms.txt, it does not exist. The homepage Features are a curated human subset. No capability ships without its llms.txt line.
- When a component or rule changes, update its three descriptions together — the file comment, the library.html wall entry, and llms.txt (full keep-in-sync contract in the project map above).


-------------------------------------------------------------------------------

## Themes
===============================================================================


One attribute (`data-theme`) switches the theme, layout containers included; `data-mode="dark"` is separate and composes with any theme. facet.js carries both in the URL (`?theme=`, `?mode=`), wires `data-theme-switch` / `data-mode-toggle` buttons, boots a page from data attributes on its own script tag, and exposes `facet.set({...})` at runtime.

**Where themes live.** A theme is a `[data-theme="…"]` block in `/lib/facet.css` that maps the semantic tokens (the base family + accent ranks, each with hover / pressed / on-colors, in light and dark). That file is the ONLY place raw hex values exist — do not copy them here. See every theme live on the home-page switcher and tune one on the Build-a-theme page.

**Colour is ranked, not named.** Components use `--accent-1/-2/-3` (each with `-hover`, `-pressed`, `--on-accent-N`) and never pick a raw colour. One accent-1 action per screen.

The shipped set, by design intent:

- **Default** (no attribute) — paper white, near-black ink, faint shadows; the neutral base, where the accent ranks are the ink itself. (The OS accent is a separate dormant token, `--os-accent`, kept out of the ranks on purpose.)
- **Sand** (`data-theme="sand"`) — modern desert beige, quietly elegant; parked but working.
- **Velvet** (`data-theme="velvet"`) — neumorphic matte material, gold ink, serif display, one light source from above.
- **Aero** (`data-theme="aero"`) — Frutiger Aero glass gloss, sky aqua, pill buttons; dark is ocean glass.
- **Elegant** (`data-theme="elegant"`) — cream and gold, serif display, carved (inset) elevation; dark twin is obsidian and gold.

**Adding a theme:** add its `[data-theme="…"]` block in facet.css mapping every semantic token (light + dark), keep AA contrast in both, then add it to the switcher and the Build page. Everything downstream reads the semantic tokens, so nothing else changes.


-------------------------------------------------------------------------------

## Distribution and versioning
===============================================================================


- Consume by URL only. No npm package until there is a concrete reason.
- Tag releases in Git: v0.1, v0.2, and so on.
- Freeze on dependency: copy the current files to `/lib/v1/` and leave them untouched. Work continues in `/lib/`.
- Old projects point at their frozen folder forever. New projects point at `/lib/` and get the latest.


-------------------------------------------------------------------------------

## Backlog — the build queue & upcoming features
===============================================================================


The roadmap: upcoming and in-progress work on the library, plus the decisions that bind future work. Each item carries enough detail to build from this file alone.

Ordering rule: heavy systems before lighter work — cross-cutting machinery outranks single components and polish.

Standing exclusion: no right-to-left layout. Translation yes, RTL no (decided 4 Jul 2026).


-------------------------------------------------------------------------------

## Queue — pending work
===============================================================================


### Print, reader-view, copy-paste & export system (cross-cutting)

The requirement, in full: every Facet page must print cleanly, read well in browser Reader view, copy in the right order, and export well — and printing must be a first-class, declarative feature where the author says what shows on paper and what does not. This is heavy, cross-cutting machinery: it touches every component, block and template, plus the base layer and the compliance checklist. It ranks near the top of the queue for that reach. Build it as a small number of commits (the CSS system first, then the DOM-order/selection law, then per-template polish), each landing its wall/inventory lines.

**1 · Declarative print roles (the headline feature).** One attribute names whether an element belongs on paper:
- `data-print="off"` — never prints (and is hidden from Reader view where we can influence it). For page furniture (navigation and controls).
- `data-print="on"` — always prints, even inside an `off` ancestor (an explicit opt back in).
- `data-print="only"` — prints ONLY, invisible on screen. For print-only content: a letterhead, a page footer with a URL, a "printed from …" line, crop marks. Provide readable class aliases too, matching the naming rules: `.print-hide`, `.print-show`, `.print-only`. Attribute and class are equivalent; components ship the attribute, authors reach for whichever.

**Defaults, baked in so authors get it right for free (project decisions):**
- OFF by default in print: `header.site-header`, `nav` navigation, `.tab-bar`, `.float-btn` / `.float-btn-right`, `.sheet` + `.sheet-scrim`, `.scroll-gauge`, `.docs-index`, tooltips, skip links, the settings sheet, the theme/mode switchers, any purely navigational footer, and decorative backgrounds (`.bg-grid` etc. flatten to nothing).
- ON by default in print: `main`, `article`, `.card` and card grids/rows, content sections, tables, figures, headings and body copy — the predetermined content areas of the layouts. Cards and content are the paper.
- These are DEFAULTS on the component's own selector; an author overrides any single element with the attribute above.

**2 · The `@media print` stylesheet in `/lib/facet.css`.** One clearly commented block:
- Neutralise to ink-on-paper: force `--background`/`--surface` to white and text to near-black regardless of theme/mode (paper has no dark mode); strip every shadow, glow, blur and translucency; borders become thin gray hairlines. Themes must not bleed onto paper.
- Open the folds: every collapsed `<details>` / `.fold` / accordion prints expanded (`details` open state can't be forced from CSS alone — a tiny `beforeprint` handler opens all `<details>` and restores after `afterprint`; note it in facet.js).
- Page-break control: `break-inside: avoid` on `.card`, table rows, figures, result blocks; `break-after: avoid` on headings so a heading never orphans at a page foot; major `<section>`s may `break-before: page` via a `.page-break` helper the author can add.
- `@page { margin: … }` for sane paper margins; a `.print-landscape` / size hook for wide tables and the deck (the deck already prints exact 1920×1080 — keep that path, generalise the rest).
- Optional link-URL expansion: `a[href]::after { content: " (" attr(href) ")" }` behind a `.print-urls` opt-in on `<body>` (off by default — noisy).
- Lazy images: ensure `loading="lazy"` images are forced to load for print.

**3 · Copy-paste & selection stability (the DOM-order law).** The problem it solves: selecting mid-page and having the selection jump to a footer/corner component while content above is skipped — the PDF-selection problem. Root cause is always visual order diverging from DOM order (fixed/absolute interface controls mid-DOM, CSS `order`, grid line placement, `direction`/float reordering). The fix is a law, enforced in the library and documented for authors:
- **Reading-order law:** DOM order IS reading order. Fixed and absolutely positioned interface controls (float button, settings sheet, scrim, tab bar, toasts, tooltips, scroll gauge) is authored at the END of `<body>`, after the content, so a top-to-bottom selection sweeps all content first and the controls last. (The settings sheet already sits at end of body — make this the rule everywhere, and move any offender.)
- The interface controls are not selectable and not copied: `user-select: none` on all navigation and control elements, tooltips, gauges, the wordmark, icon-only buttons — so a full-page copy yields the content, in order, without "Open settings" and stray glyph noise landing in the paste.
- Never use CSS `order`, `grid-row/column` line placement, or float-based reordering to move *content* out of source order; layout that reorders is allowed only for interface controls that are already `user-select: none` and print-hidden. Add this to the markup rules and the compliance checklist.
- Icon buttons that use a glyph font/ligature must carry the accessible name as `aria-label`, not as copyable text, and mark decorative SVGs `aria-hidden` — so they don't dump into a copy.

**4 · Reader view.** Reader mode keys off clean semantics, which Facet already targets — make it a guarantee, not luck:
- One `<h1>`, no skipped heading levels, main content in a single `<main>` / `<article>`, real `<p>`/`<figure>`/`<blockquote>`; no content living in `::before`, `background-image`, or a value attribute.
- Decorative and interface-control nodes carry `aria-hidden` / `role="presentation"` so Reader drops them.
- `article.html` template: ensure its body is one `<article>` with h1, `<time>`, author, and the existing JSON-LD — the canonical Reader target.
- Add a note: nothing requires JS to render (already a rule) — Reader and crawlers get everything.

**5 · Export.** "Good exportability":
- A documented "Save as PDF" / "Print" affordance component (`data-event="export-pdf"`, calls `window.print()`), so any page can offer a real export button that produces the designed print layout above.
- Keep/extend the existing per-code-block "download" and "copy as Markdown" affordances as the content-export primitives.
- Consider a page-level "Copy page as Markdown" for content-first pages (serialise `main` content, skipping `data-print="off"` interface controls) — nice to have, note as a sub-item.

**Compliance-checklist additions (every new component, once built):**
- Declares its print role — on paper by default if it is content, off if it is an interface control; overridable via `data-print`.
- Prints cleanly: no shadows/translucency on paper, folds open, no bad page-breaks through it.
- Authored in reading order; any reordering/positioning applies only to `user-select: none`, print-hidden interface controls.
- Icon-only and interface-control nodes are `user-select: none` and don't pollute a copy.

**Feature inventory (add when built):** one line in the index.html Features section and llms.txt — "Print, Reader-view and export: declarative `data-print` roles (interface controls off, content on by default), a themed `@media print` stylesheet, folds auto-open for paper, reading-order-stable selection and copy, and a Save-as-PDF affordance."

Open decisions to confirm at build time: whether link-URL expansion is opt-in (proposed yes), the exact `@page` margins, and whether the "Copy page as Markdown" export lands in this system or its own later item.

### Theme marketplace + community submissions 

Let visitors build a theme (the Build-a-theme page already does this) and submit it for review and, if approved, shipping as an official theme. Below the builder, a marketplace lists the built-in themes and, under a separate heading, approved community themes. This is the project's first social surface.

Flow:
- On /build.html, a "Submit this theme" button next to Copy/Reset. It captures the current build (the token overrides + name + optional author handle).
- Email + OTP gate: user enters an email; a one-time code is emailed; they enter it to verify. On success the theme is saved to the DB with status "review", the verified email, the token JSON, a name and a timestamp.
- A maintainer reviews out of band; approving flips status to "approved".
- Approved themes render in the marketplace (a card each: name, author, swatch preview, "Apply" to load it into the builder / "Use" to copy its config). Built-ins are one group; community themes another.

Needs a backend — the site is static today, so this is the first server work:
- Storage: a DB table `themes` (id, name, author, email, tokens JSON, status, created_at). Supabase fits (Postgres + row-level security + edge functions).
- OTP: two serverless endpoints (Vercel functions or Supabase edge functions) — request-otp (generate a 6-digit code, store it with a short TTL keyed to the email, send via an email provider like Resend/Postmark) and verify-otp (check the code, then accept the theme insert). Rate-limit both.
- Read path: a public endpoint (or RLS-scoped select) returns approved themes for the marketplace; the builder fetches it.
- Secrets (DB URL, service key, email API key) live in Vercel env vars, never in the client. The submit/verify calls go to the functions, not the DB directly.
- Keep the static-first spirit: the marketplace degrades to just the built-in themes if the backend is unreachable; no build step added to /lib. Decisions to confirm before building: email provider, whether Supabase or Vercel-Postgres, and the exact theme JSON shape (reuse the builder's ?mix= JSON — {tokens, scales} — plus name/author).

> Flag: this is the one item that breaks Facet's "two static files, no server" identity — it needs a database, serverless functions, email/OTP and secrets. Do it deliberately and late, keep it fully isolated from /lib, and let the marketplace degrade to just the built-in themes when the backend is unreachable.

### More Layer 5 app-shape templates

SaaS dashboard (templates/saas.html) and social app (templates/social.html) already shipped, with the iframe device preview on library.html. Grow the set with the shapes listed below.

- [ ] More app shapes: chat/messaging, kanban board, settings/account, e-commerce storefront checkout flow.

### Field actions component (in-field menu)

- [ ] Field actions (requested, not yet built): inside every text field, an actions affordance on the right edge. Decision: a single three-dot menu button (icon, in-field, 44px target) that opens a small popover with Copy (the field value to clipboard), Paste (from clipboard into the field), and Undo (revert the last change — keep a per-field value history); PLUS a standalone Clear (×) icon in the field that wipes the value in one tap (distinct from the menu). All self-wiring via facet.js on a `data-field-actions` field wrapper: no per-field JS. Each action fires feedback (tap/tick) and a `data-event` analytics hook; the menu is a real `button` + `[popover]`/details, the × is a real `button` with an aria-label. Works in every theme, keyboard operable, description tooltips on each. Wall entry on library.html (Fields group) + Features/llms.txt line when built.

### Icon set — grow as needed

- [ ] Keep the thin line-icon set covering common needs; add glyphs as gaps appear (~60 shipped so far).


-------------------------------------------------------------------------------

## Parked — not scheduled
===============================================================================


- v1 freeze — copy /lib/ to /lib/v1/, tag v1, start a changelog, add a version switcher. Deliberately NOT scheduled while the library moves fast: freezing now would pin a stale snapshot. Revisit once the rapid changes are done and the consuming apps are built. Everything stays on the moving /lib/ until then (always-latest, pre-v1). Do not raise it unprompted.


-------------------------------------------------------------------------------

## Decisions that bind future work
===============================================================================


The full shipped history is in git and in the live files (facet.css / facet.js / library.html / llms.txt). These are the durable calls that still constrain new work:

- No right-to-left layout — translation yes, RTL no.
- Layer = composition level: a single reusable piece is Layer 2 · Components (in one of the six categories, snap/layout included); motion, sound and app interface are Layer 5 · App feel; an assembly of pieces is a Layer 3 · Block; a whole page is a Layer 4 · Template. Never create a layer that holds only one entry.
- The site is multi-page: Home · Library · Playground · Build a theme · llms.txt · CLAUDE.md · GitHub. (The old Components and Layouts pages merged into Library.)
- App logic, data and state live in projects, never in the library.
- (Token, accent, border, spacing/type and theme decisions live in the Naming and Themes sections above — not repeated here.)
