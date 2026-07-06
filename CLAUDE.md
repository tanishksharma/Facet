# Facet — the build charter
===============================================================================

> **What this file is.** The single source of truth for *building and maintaining* Facet: its principles, the project map, the keep-in-sync contract, and the checklist a contributor or AI follows to add to the library. Both a human and an AI can read it top to bottom.
>
> **You probably don't need this to *use* Facet.** If you just want to build a page with it, read [`llms.txt`](llms.txt) (the usage guide) or start on the [home page](index.html). This charter is for people extending the library itself.
>
> Everything below is written as instructions Claude Code reads at the start of every session and follows to the letter.

Facet is a plain HTML, CSS and JS design library used across everything: apps, websites, pitch decks, documents and business cards. It is one CSS file and one JS file hosted at a public URL. Any project pulls it in with one link tag and one script tag. No React, no build step, no npm install, never minified.

**This repo is the sole source of truth.** The Facet Notion page is a charter only: vision and requirements, never implementation detail. The backlog lives as a section at the end of this file (see Backlog, below).

The repo root is the library's website, deployed by Vercel as a static site on every push to `main`. It is a small multi-page site: the **home page** (`index.html`) is the pitch — philosophy, a curated feature list, and how to use it — and the **Library** (`library.html`) is the catalogue, where every token, component, block, template and app-feel behaviour is live with its exact copy-paste code. The library itself is the two files in `/lib`.

```
/lib
  facet.css        the whole design system
  facet.js         small vanilla JS behaviours
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
playground.html    live playground + facet.json cheatsheet
build.html         theme builder + Skin Lab
docs.css           docs-site styles (NOT part of /lib)
docs.js            docs-site behaviour (NOT part of /lib)
llms.txt           the full usage guide as plain text for AI crawlers
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
    What:      live playground + cheatsheet (rendered from facet.json)
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

`facet.json`
    What:      machine manifest of every theme, token, class, attribute, component, block, API
    Read by:   consumers' AI; the cheatsheet + reference blocks
    Truth for: the structured manifest

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
    Truth for: the site's own chrome

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
5. `facet.json` — its manifest entry (class / attribute / API).
6. `index.html` — a curated Features card ONLY if it is a headline, user-facing capability. The home Features are the human subset, not the exhaustive list; the exhaustive list is `llms.txt`.
7. The Backlog section at the end of this file — tick the item.

The description text is written once and reused word-for-word in three places: the file comment in `facet.css`/`facet.js`, the `library.html` wall entry, and `llms.txt`.

When a page is added, renamed or removed, update three places together: this project map, `sitemap.xml`, and the header nav on every page.


-------------------------------------------------------------------------------

## Standing rules — every session
===============================================================================


- The loop: the owner says "continue" — nothing more. Read the Backlog below, take the top unchecked item, build it through the full pipeline (compliance checklist, wall entry on library.html, llms.txt + facet.json lines, tick the box, verify in a real browser, commit, push), then take the next item until the turn is done. No re-asking what to work on.
- New work arrives mid-stream in the owner's words. Write it into the Backlog below immediately — detailed enough to build from this file alone, decisions and exclusions included — slot it by the ordering rule, commit it, then return to the top of the queue on the next "continue".
- Ordering rule: heavy systems before lighter work. Retokenisations, JS subsystems and cross-cutting machinery outrank single components, CSS adds and site polish.
- The Backlog below is the only planning list. No separate requirements doc, no Notion in the loop; the repo is the whole system of record.
- The inventory rule: llms.txt is the exhaustive list of every capability the library ships — if it is not in llms.txt, it does not exist, and every new capability adds its llms.txt line in the same commit that builds it. The Features section on index.html is the curated, human-readable subset: a headline capability gets a card there, but the homepage is not the exhaustive inventory. facet.json carries the same capability as structured data. No orphan features, nothing built and forgotten.
- Development happens directly on `main`. No feature branches unless explicitly requested. All changes go through Git commits; the live files are never edited ad hoc.
- Every new component passes the full compliance checklist below before commit.
- Whenever a component or rule changes, three places update together with the same wording: the file comment in facet.css/facet.js, the wall entry on library.html, and llms.txt. (Full keep-in-sync contract in the project map above.)


-------------------------------------------------------------------------------

## Core principles
===============================================================================


- Readability is the product. Modern frontend is div soup and minified garbage, unreadable by humans. This library is the opposite.
- One-glance HTML: any page's structure makes sense on first read. Semantic tags, self-explanatory classes.
- The wrapper law: not one extra wrapper. A container inside a container exists only to enable a real feature — scroll areas, sticky regions, overflow clipping. No other reason is acceptable.
- Least code that stays readable: entire products are assembled by writing HTML files with the right classes. Nothing else to touch.
- Pure HTML, CSS and JS. No build step, no framework, never minified. Gzip handles size.
- One-step theme change: one attribute on the html tag restyles the whole page, layout containers included.
- Everything explained in place: every interactive element carries a description tooltip.
- Alive by default: gyroscope parallax and idle animations, with reduced motion honoured. (Shipped as the App-feel layer: parallax, idle motion, sound and haptics.)
- Fully commented: every file self-describes with intros, usage notes and to-dos, so any AI can build products with it.
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
- [ ] Inventory updated in the same commit: the capability's full entry in llms.txt (the exhaustive list) and its facet.json manifest entry; a curated card in the index.html Features section only if it is a headline user-facing feature.
- [ ] Backlog item ticked (in the Backlog section below).
- [ ] Committed to Git with a clear message.


-------------------------------------------------------------------------------

## Accessibility
===============================================================================


- Everything reachable and operable by keyboard. Skip-to-content link on every page and template.
- Alt text on all images. ARIA labels on icon-only controls and complex components.
- AA contrast in every theme, light and dark. `prefers-reduced-motion` honoured: all library motion collapses to nothing.


-------------------------------------------------------------------------------

## SEO and AI readability
===============================================================================


- Every page and template ships with title, meta description, OG tags and a favicon slot filled in.
- JSON-LD structured data slots in templates: article, product, organization.
- All content readable as static HTML. Nothing requires JS to render, so crawlers and AI read everything.
- sitemap.xml, robots.txt and clean URLs in the starter. Lazy-loaded images, `font-display: swap` when custom fonts ever arrive.


-------------------------------------------------------------------------------

## App-ready and PWA
===============================================================================


- The starter is installable: manifest.json plus a full icon set out of the box.
- The shared service worker (facet-sw.js): pages and /lib/ files network-first with the cache as offline fallback, other assets cache-first with background revalidation. Ships updates by redeploying.
- Mobile-first defaults: safe-area insets, touch targets, viewport handled in the base.


-------------------------------------------------------------------------------

## iOS rules — fixes for real iPhone bugs
===============================================================================


iOS breaks in ways desktop browsers don't. Each rule below exists because we shipped a real app, hit that exact bug, and this is the fix — ignore one and the bug comes back. They bind anything built in or added to the library. (These are builder rules; the user-facing version is not on the homepage.)

- Pager law: full-page snap sections that can outgrow the viewport are never built with CSS scroll-snap; the pager model (.snap upgraded by facet.js) is the only thing that survives iOS.
- Gesture law: `touch-action: pan-y` on scrollers, `manipulation` on fixed chrome, `none` on drag surfaces; `gesturestart` preventDefault covers older iOS pinch; never rely on viewport `user-scalable=no`.
- App shell law: standalone PWAs need `viewport-fit=cover` PLUS the apple-mobile-web-app metas (capable + black-translucent status bar), safe-area env() insets in section padding, and manifest colors that match the shipped theme.
- Caching law: HTML and unversioned /lib/ files are never cache-first — network first, cache only offline. Cache-first pages hide every deploy until a second refresh; that bug shipped once and is now law.
- Parallax exclusion: elements carrying their own transform physics (velvet lift/press, the pager's rubber-band) never register with facetMotion — two writers on one inline transform collide.
- Font-list law: never put `inherit` inside a font-family list; it silently invalidates the whole declaration. Stacks end in a generic family.


-------------------------------------------------------------------------------

## Analytics
===============================================================================


- No analytics vendor is baked in — bring your own.
- Every key action carries a stable `data-event="name"` attribute (documented per component). To track them: add ONE click listener that finds the nearest `[data-event]` and forwards its name to your tool — `document.addEventListener("click", e => { const el = e.target.closest("[data-event]"); if (el) track(el.dataset.event); })`. Because the hook is a plain attribute, any vendor (GA, Plausible, PostHog, …) wires the same way. The copy-paste version lives in llms.txt under Analytics.


-------------------------------------------------------------------------------

## Naming and code quality
===============================================================================


- Tokens named by role, not value: `--surface`, not `--gray-100`. This extends to spacing and type: name them by intent (card spacing, section spacing, heading, body, caption) — never by a bare number a builder has to memorise (`--space-2`, `--text-h3` were the old value-named scale, now retired). Density and type size are one global three-step control (small/medium/large), and both are set BY THE THEME — you never pick a theme and its spacing separately. Full spec + naming in the Backlog below.
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
- Docs-only styles and scripts live in docs.css and docs.js — never in /lib. They serve the site's own chrome, not the shipped library.


-------------------------------------------------------------------------------

## Themes
===============================================================================


One attribute (`data-theme`) switches the theme, layout containers included; `data-mode="dark"` is separate and composes with any theme. facet.js carries both in the URL (`?theme=`, `?mode=`), wires `data-theme-switch` / `data-mode-toggle` buttons, boots a page from data attributes on its own script tag, and exposes `facet.set({...})` at runtime.

**Where themes live.** A theme is a `[data-theme="…"]` block in `/lib/facet.css` that maps the semantic tokens (the base family + accent ranks, each with hover / pressed / on-colors, in light and dark). That file is the ONLY place raw hex values exist — do not copy them here. See every theme live on the home-page switcher and tune one on the Build-a-theme page.

**Colour is ranked, not named.** Components use `--accent-1/-2/-3` (each with `-hover`, `-pressed`, `--on-accent-N`) and never pick a raw colour. One accent-1 action per screen.

The shipped set, by design intent:

- **Default** (no attribute) — paper white, near-black ink, whisper shadows; the quiet base, where the accent ranks are the ink itself. (The OS accent is a separate dormant token, `--os-accent`, kept out of the ranks on purpose.)
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


The build list, kept in this charter file. One checkbox per item, each sized to land in one commit, written with enough detail to build from this file alone. The owner adds work by saying it; Claude writes it in here immediately, then works the queue top-down on every "continue". Shipped work is recorded at the bottom.

Ordering rule: heavy systems first, lighter work after. The semantic spacing/type retokenisation now leads — every component and layout sits on those tokens, so it is the widest-reaching change. Then the manual redesign, the configuration spine, the JS context/i18n/offline systems, navigation transitions and the native-theme work; the theming suite and machine manifest; and only then the lighter CSS adds, site polish and the long component/blocks/templates road.

Standing exclusion: no right-to-left layout support. Translation yes, RTL no — decided 4 Jul 2026.


-------------------------------------------------------------------------------

## Queue · heavy systems first
===============================================================================


### Print, reader-view, copy-paste & export system (NEW · cross-cutting)

The owner's ask, in full: every Facet page must print beautifully, read cleanly in browser Reader view, copy in the right order, and export well — and printing must be a first-class, declarative feature where the author says what shows on paper and what does not. This is heavy, cross-cutting machinery: it touches every component, block and template, plus the base layer and the compliance checklist. It ranks near the top of the queue for that reach. Build it as a small number of commits (the CSS system first, then the DOM-order/selection law, then per-template polish), each landing its wall/inventory lines.

**1 · Declarative print roles (the headline feature).** One attribute names whether an element belongs on paper:
- `data-print="off"` — never prints (and is hidden from Reader view where we can influence it). For page chrome.
- `data-print="on"` — always prints, even inside an `off` ancestor (an explicit opt back in).
- `data-print="only"` — prints ONLY, invisible on screen. For print-only content: a letterhead, a page footer with a URL, a "printed from …" line, crop marks. Provide readable class aliases too, matching the naming rules: `.print-hide`, `.print-show`, `.print-only`. Attribute and class are equivalent; components ship the attribute, authors reach for whichever.

**Defaults, baked in so authors get it right for free (owner's calls):**
- OFF by default in print: `header.site-header`, `nav` chrome, `.tab-bar`, `.float-btn` / `.float-btn-right`, `.sheet` + `.sheet-scrim`, `.scroll-gauge`, `.docs-index`, tooltips, skip links, the settings sheet, the theme/mode switchers, any purely navigational footer, and decorative backgrounds (`.bg-grid` etc. flatten to nothing).
- ON by default in print: `main`, `article`, `.card` and card grids/rows, content sections, tables, figures, headings and body copy — the predetermined content areas of the layouts. Cards and content are the paper.
- These are DEFAULTS on the component's own selector; an author overrides any single element with the attribute above.

**2 · The `@media print` stylesheet in `/lib/facet.css`.** One clearly commented block:
- Neutralise to ink-on-paper: force `--background`/`--surface` to white and text to near-black regardless of theme/mode (paper has no dark mode); strip every shadow, glow, blur and translucency; borders become thin gray hairlines. Themes must not bleed onto paper.
- Open the folds: every collapsed `<details>` / `.fold` / accordion prints expanded (`details` open state can't be forced from CSS alone — a tiny `beforeprint` handler opens all `<details>` and restores after `afterprint`; note it in facet.js).
- Page-break control: `break-inside: avoid` on `.card`, table rows, figures, result blocks; `break-after: avoid` on headings so a heading never orphans at a page foot; major `<section>`s may `break-before: page` via a `.page-break` helper the author can add.
- `@page { margin: … }` for sane paper margins; a `.print-landscape` / size hook for wide tables and the deck (the deck already prints exact 1920×1080 — keep that path, generalise the rest).
- Optional link-URL expansion: `a[href]::after { content: " (" attr(href) ")" }` behind a `.print-urls` opt-in on `<body>` (off by default — noisy).
- Lazy images: ensure `loading="lazy"` images are forced to load for print.

**3 · Copy-paste & selection stability (the DOM-order law).** The owner's real complaint: selecting mid-page and having the selection jump to a footer/corner component while content above is skipped — the PDF-selection annoyance. Root cause is always visual order diverging from DOM order (fixed/absolute chrome mid-DOM, CSS `order`, grid line placement, `direction`/float reordering). The fix is a law, enforced in the library and documented for authors:
- **Reading-order law:** DOM order IS reading order. Fixed and absolutely positioned chrome (float button, settings sheet, scrim, tab bar, toasts, tooltips, scroll gauge) is authored at the END of `<body>`, after the content, so a top-to-bottom selection sweeps all content first and chrome last. (The settings sheet already sits at end of body — make this the rule everywhere, and move any offender.)
- Chrome is not selectable and not copied: `user-select: none` on all navigation/control chrome, tooltips, gauges, the wordmark, icon-only buttons — so a full-page copy yields the content, in order, without "Open settings" and stray glyph noise landing in the paste.
- Never use CSS `order`, `grid-row/column` line placement, or float-based reordering to move *content* out of source order; layout that reorders is allowed only for chrome that is already `user-select: none` and print-hidden. Add this to the markup rules and the compliance checklist.
- Icon buttons that use a glyph font/ligature must carry the accessible name as `aria-label`, not as copyable text, and mark decorative SVGs `aria-hidden` — so they don't dump into a copy.

**4 · Reader view.** Reader mode keys off clean semantics, which Facet already targets — make it a guarantee, not luck:
- One `<h1>`, no skipped heading levels, main content in a single `<main>` / `<article>`, real `<p>`/`<figure>`/`<blockquote>`; no content living in `::before`, `background-image`, or a value attribute.
- Decorative and chrome nodes carry `aria-hidden` / `role="presentation"` so Reader drops them.
- `article.html` template: ensure its body is one `<article>` with h1, `<time>`, author, and the existing JSON-LD — the canonical Reader target.
- Add a note: nothing requires JS to render (already a rule) — Reader and crawlers get everything.

**5 · Export.** "Good exportability":
- A documented "Save as PDF" / "Print" affordance component (`data-event="export-pdf"`, calls `window.print()`), so any page can offer a real export button that produces the designed print layout above.
- Keep/extend the existing per-code-block "download" and "copy as Markdown" affordances as the content-export primitives.
- Consider a page-level "Copy page as Markdown" for content-first pages (serialise `main` content, skipping `data-print="off"` chrome) — nice to have, note as a sub-item.

**Compliance-checklist additions (every new component, once built):**
- Declares its print role — on paper by default if it is content, off if it is chrome; overridable via `data-print`.
- Prints cleanly: no shadows/translucency on paper, folds open, no bad page-breaks through it.
- Authored in reading order; any reordering/positioning applies only to `user-select: none`, print-hidden chrome.
- Icon-only/chrome nodes are `user-select: none` and don't pollute a copy.

**Feature inventory (add when built):** one line in the index.html Features section and llms.txt — "Print, Reader-view and export: declarative `data-print` roles (chrome off, content on by default), a themed `@media print` stylesheet, folds auto-open for paper, reading-order-stable selection and copy, and a Save-as-PDF affordance."

Open decisions to confirm at build time: whether link-URL expansion is opt-in (proposed yes), the exact `@page` margins, and whether the "Copy page as Markdown" export lands in this system or its own later item.

### Theme marketplace + community submissions (NEW · needs a backend)

Let visitors build a theme (the Build-a-theme page already does this) and submit it for the owner to review and, if approved, ship as an official theme. Below the builder, a marketplace lists the built-in themes and, under a separate heading, approved community themes. This is the project's first social surface.

Flow:
- On /build.html, a "Submit this theme" button next to Copy/Reset. It captures the current build (the token overrides + name + optional author handle).
- Email + OTP gate: user enters an email; a one-time code is emailed; they enter it to verify. On success the theme is saved to the DB with status "review", the verified email, the token JSON, a name and a timestamp.
- Owner reviews out of band; approving flips status to "approved".
- Approved themes render in the marketplace (a card each: name, author, swatch preview, "Apply" to load it into the builder / "Use" to copy its config). Built-ins are one group; community themes another.

Needs a backend — the site is static today, so this is the first server work:
- Storage: a DB table `themes` (id, name, author, email, tokens JSON, status, created_at). Supabase fits (Postgres + row-level security + edge functions).
- OTP: two serverless endpoints (Vercel functions or Supabase edge functions) — request-otp (generate a 6-digit code, store it with a short TTL keyed to the email, send via an email provider like Resend/Postmark) and verify-otp (check the code, then accept the theme insert). Rate-limit both.
- Read path: a public endpoint (or RLS-scoped select) returns approved themes for the marketplace; the builder fetches it.
- Secrets (DB URL, service key, email API key) live in Vercel env vars, never in the client. The submit/verify calls go to the functions, not the DB directly.
- Keep the static-first spirit: the marketplace degrades to just the built-in themes if the backend is unreachable; no build step added to /lib. Decisions to confirm before building: email provider, whether Supabase or Vercel-Postgres, and the exact theme JSON shape (reuse the builder's ?mix= JSON — {tokens, scales} — plus name/author).

### Layer 5 templates — more app shapes (partly SHIPPED)

Layer 5 is named (Templates = whole-page layouts). Grow the set beyond the six starters into real app shapes the owner named: a SaaS dashboard, a social-media feed/app, and similar. Each a full page assembled from Layer 4 blocks, carrying the head pack, listed on /library.html under the Templates band. Note (owner's layering call, agreed): the bottom tab bar and the settings sheet are two separate Layer 3 components; assembled together into one nav unit they are a Layer 4 block — that "tab bar + menu sheet" pairing belongs in Layer 4.

- [x] SaaS dashboard (templates/saas.html — Northstar analytics) and social app (templates/social.html — Ripple feed) shipped, plus an iframe device preview on /library.html that renders landing/saas/social live at desktop/tablet/phone widths (docs-only .device-preview + initDevicePreview).
- [ ] More app shapes as the owner names them (e.g. chat/messaging, kanban board, settings/account, e-commerce storefront checkout flow).

### Six-layer taxonomy + grouped, filterable Components wall (DONE)

Owner asked to reassess and decide what belongs where. Decided and implemented. The layers are now ONE composition ladder, contiguous per page, with NO single-item layer (owner's standing rule: a layer/group with just one element belongs folded into tokens):

- Layer 1 · Tokens & base — design decisions as named variables (color, type, spacing, radius, border, motion, elevation + density/text-size) PLUS base styles (raw semantic HTML already designed). Base is one item, so it lives inside Layer 1, never its own layer. Components page.
- Layer 2 · Components — every reusable piece, grouped into named categories (Layout primitives [container, stack, row, grid, snap section] / Forms & controls / Content & data / Overlays & disclosure / Navigation / Status), each with a .wall-group heading, a data-cat tag, a category filter chip row (initWallFilter, composes with the text search) and a grouped sidebar nav. Components page. (Snap section is a layout primitive and lives here, not in App feel.)
- Layer 3 · Blocks — components assembled into page sections. Layouts page.
- Layer 4 · Templates — whole pages (with the device preview). Layouts page.
- Layer 5 · App feel — the coat that makes a finished page feel native: parallax & idle motion, sound & haptics, backgrounds, and the app kit (tab bar, settings sheet, float button, scroll gauge). Layouts page, after Templates.

Rule going forward: a new component's layer is its composition level — a single reusable piece is Layer 2 (filed under one of the six categories, snap/layout included); motion/sound/app-chrome is Layer 5; an assembly of pieces is a Layer 3 block; a whole page is a Layer 4 template. Never create a layer that holds only one entry — fold it into the nearest layer.

### Semantic color & border tokens (DONE)

Accents: KEPT as --accent-1/-2/-3 (owner decided not to rename — the ranks read fine once explained). DONE alongside: the OS accent is no longer wired into accent-3; it is its own dormant opt-in token --os-accent (iOS blue everywhere, real OS accent only where the browser exposes it).

Borders — DONE: expanded from two width tokens to four role tokens:
- `--border-hairline` — a very slight look of separation (subtle dividers)
- `--border-element`  — the standard border on elements (cards, inputs, chips)
- `--border-focus`    — the focus ring width, focus only
- `--border-highlight`— highlighting any element you want to draw attention to Map: current `--border-width` (1px) splits into hairline (separators: hr, dividers, table lines) + element (card/input/chip/button borders); current `--border-width-strong` (2px) splits into focus (the focus ring) + highlight (accent left-bars, active tab underline, avatar/thumb ring, header underline).

Sweep every component, all five themes light+dark, the custom-accent recipe, the theme builder pickers, docs, llms.txt, facet.json. Everything else is already role-named — this is the last value/rank-named layer.

### Semantic spacing & type tokens + global density — retokenisation (DONE — spacing/type/radius shipped)

Replace the value-named scales — `--space-1..8` and `--text-display/-h1..-h4/-body/-small/-caption` — with ROLE-named tokens, so a builder picks spacing and type by intent ("card spacing", "section spacing") not by number, and the right choice is self-evident from the name. Then one global density control scales the whole spacing system at once, and type size gets the same three-step control. Both scales are defined BY THE THEME: picking a theme sets its spacing rhythm and type feel — you never choose theme and spacing separately. Density/type-size compose like `data-mode`.

- [x] Spacing role tokens (names pending owner sign-off). Two families: gaps between elements and padding inside them. Proposed element-named set: `--space-tight` (bound pairs, label+field), `--space-stack` (default vertical gap), `--space-inline` (row gaps), `--space-section` (between page sections), `--space-control` (padding inside buttons/inputs/chips), `--space-card` (padding inside cards/panels), `--space-page` (container side padding), `--space-heading` (space around headings). Map current usage: space-2→control/tight, space-4→stack, space-5→card, space-7→section, etc.
- [x] Global density `data-density="small|medium|large"` on html (medium = no attr), each theme defining the three values per role token. Replaces today's single `data-density="compact"`. Same three-step control for type size (own attribute or folded into density — decide).
- [x] Type role tokens: `--text-h1..-h4`, `--text-body`, `--text-caption`, `--text-footnote`, `--text-quote` (add footnote + quote; retire `--text-small`/`--text-display` or alias). Defined per theme.
- [x] The sweep: EVERY component and layout moves to the new names in the same change — 187 `--space-*` and 131 `--text-*` uses in facet.css, ~144 more across index.html/build.html/templates. Keep AA, all five themes light+dark, no build. Update the tokens docs on index.html, Features, llms.txt and facet.json together. Heaviest system → leads.

### Site architecture: split the one page into a real multi-page site (NEW)

The home page is over-loaded. Split into top-level pages, each in the header:
- Home `/`: ABOUT + philosophy + the granular Features + Rules + How-to-use. Philosophy: modern frontend is a div-soup, minified mess; Facet is the opposite — simple, readable, easy to use (that ease is itself a feature). This is the only content on home; it talks about the library and why.
- Components `/components.html` (or dir): the element wall, moved off home.
- Layouts `/layouts.html`: the blocks + templates, shown as layouts.
- Build a theme `/build.html`: exists (theme builder + Skin Lab).
- llms.txt PAGE (not only the file): a visible AI-instructions page — an extremely condensed, all-text version of every page's content. Top note: "these are the instructions your AI sees when it searches for this library." The `/llms.txt` file still exists for crawlers that fetch it, but the page is the human-visible, crawlable instruction surface (SEO + AI land on a page, not a raw file).

Header nav becomes: Home · Components · Layouts · Build a theme · llms.txt · GitHub. This RESHAPES the manual-redesign item below — its Features/Rules/ How-to content becomes the home page. Do the manual redesign as part of building the home page. Update sitemap, robots, facet.json, and cross-links.

### Manual redesign: granular feature/rule cards + How-to-use steps (NEW · folds into the home page above)

Features (9) and Rules (8) were condensed too far. Break them into MANY individual marketable points — 20–30+ features (playing sound, parallax, layouts, components, tokens, theming, and each token/base/theming sub-point its own feature) and rules split out of the condensed groups (core principles shown as its 5–6 individual rules, how-to-use its own, markup its own, …).

- [x] New card type (not the current text card): an ICON + a NAME + a one-line half-sentence phrase, self-explanatory, no visible "read" affordance. Hover or click opens a popup with the full detail. New Layer-3 component.
- [x] Dual human/AI content: the visible card text is short and condensed; each card ALSO carries a hidden, richer AI-instruction block (more sentences, more descriptive) so an AI crawler learns the feature/rule/ component/how-to in depth. Static HTML, visually hidden, still in DOM.
- [x] Manual = three sections: (1) Features — granular icon cards; (2) Rules, exceptions and points-to-note — granular icon cards; (3) How to use the library — its own section, a numbered step flow (1 pick a layout, 2 pick a theme, 3 …). Update Features/llms.txt/facet.json.

### App-kit ergonomics — R19 (from building 13 apps on the library)

Real workarounds found building 13 calculator apps strictly on Facet: places where the library ships a component's markup + CSS + a module but leaves each app to hand-write the same 15–25 lines of glue, or reach around a missing API. Fix so an app is markup + its own data/ logic only. Conventions hold: self-wiring from markup at DOMContentLoaded, tokens-only CSS, one small named function per behaviour, additive public API (never break the existing surface), all five themes and light/dark, no build. Order = highest leverage first. Bump facet.version and drop the inline-script glue from the matching docs demos.

- [x] 1. initAppControls(): wire .menu-icon-btn settings toggles by data-control — "sounds" (facet.feedback.sound.enabled), "haptics" (haptic.enabled), "motion" (facet.motion.cycle → Off/Cursor/Tilt), "appearance" (the item-2 scheme cycle). Each writes its .menu-value word, sets data-off, plays feedback.toggle(), and reflects current state on load. Zero app JS for a four-button sheet foot.
- [x] 2. Three-way appearance via facet.scheme (auto|light|dark), persisted in the URL (and localStorage); auto clears data-mode and a live prefers-color-scheme listener follows the OS. Wired to data-control="appearance". data-mode-toggle kept for back-compat.
- [x] 3. initInstallNudge(): opt-in by a .nudge-scrim present; reads data-nudge-key / data-nudge-delay (default 30000); constructs the nudge with a busy() (open .sheet or visible .overlay-guide) and self-wires [data-nudge=add] → addNow() then reveal .overlay-guide on "guide", [data-nudge=later] hide, [data-nudge=never] never()+ hide, click on .overlay-guide hides it, and a [data-nudge=add] menu row in the sheet triggers the same guide. Full A2HS flow, no app JS.
- [x] 4. Sheet menu rows navigate the pager: any .menu-item[data-section] (or any non-.tab-seg [data-section]) pages snap.facetPager.toEl and closes its sheet.
- [x] 5. Expose sheetEl.facetSheet = the facetSheet instance (mirrors snap.facetPager), so an app can .close() after an action.
- [x] 6. Choice grid emits a bubbling CustomEvent "facet:choice" {value, button} on change (value = data-value ?? text); add facet.choiceSelect(grid, value) for URL-restore/reset.
- [x] 7. facet.groupNumber(n, {system}) / numberWords(n, {system}) per-call override (default numberSystem()); the IP lookup goes opt-in (data-location on the script tag) and fully silent — a page without it makes no network call.
- [x] 8. Pager page gauge: .snap[data-gauge] (or initPagers({gauge:true})) mounts .scroll-gauge-page with the composite cross-section metric and the drag inverse — a draggable whole-page scrollbar, no app code.
- [x] 9. facet.chart: stagger colliding event labels across two rows in the top band (edge-anchor near the sides); draw a faint "projection" divider at projectFrom when set.
- [x] 10. Icon-set gaps: chart, grid, sliders, refresh/undo, volume, vibrate, motion, contrast, plus-square, download-cloud — house style, 24×24 1.5px round.
- [x] 11. Pager landing accounts for a section's top border, so paging lands exactly on the top with a 1px border-top present.

### Accent ranks — R1

- [x] Retokenise color: keep the base family (--background, --surface, --text, --text-muted, --border), replace --accent/--accent-hover/ --accent-pressed/--on-accent with --accent-1/-2/-3, each with -hover, -pressed and --on-accent-N, defined for Default light/dark and Sand light/dark. Old names removed, not aliased.
- [x] Migrate every component to ranks: btn-primary → accent-1, btn-secondary and ghost hover → accent-2, links, slider thumb, selection, focus ring, number-words, chips → accent-3. One primary per screen stays the rule.
- [x] Docs update for ranks: Color section teaches base + three accents with live swatches per rank; Features line, llms.txt, CLAUDE.md theme sections all reworded in the same commit.

### Setup and configuration — R14 (load-time core; generator lands with R8)

- [x] Load-time config: facet.js reads data-theme / data-mode / density / language off its own script tag or a facet-config JSON block, and boots the page into that configuration before first paint.
- [x] Runtime setters: facet.set({theme, mode, density, accent…}) applies key-value pairs live — theme, dark/light, accent overrides restyle in real time, no reload. Attributes stay the source of truth so custom scripts keep working.
- [x] Document the setup step on the site: a "Set up your project" strip — pick theme and mode, copy the configured script tags.

### Context in facet.js — R5

- [x] facet.now: date, time, timezone and pre-formatted helpers, available synchronously.
- [x] facet.location: country/region/city from IP lookup (endpoint documented, overridable, disablable), upgraded via Geolocation when permitted; promise + cached property; null on failure, never throws.

### Internationalisation — R4 (no RTL, by decision)

- [x] Strings table: every built-in string the library ships moves into one table in facet.js; no hardcoded literals remain.
- [x] Language switch: one attribute or facet.set({language}) switches all library strings; projects can extend the table with their own languages.
- [x] Locale-aware numbers: grouping and words helper follow the locale — lakh/crore for India, million/billion elsewhere — defaulting from facet.location, overridable by the page.

### Offline, updates and PWA — R6 + R12

- [x] State the pre-v1 policy: "always the latest from the web until v1" on the site and in llms.txt.
- [x] Service worker template: cached library files + offline shell, served instantly from cache, revalidated against the server when online; newer versions download in the background and a flag makes them take over on the next refresh or navigation, never mid-page.
- [x] Registration and install helpers in facet.js: one call (or data attribute) registers the worker; beforeinstallprompt captured and exposed as a simple install-button wiring.
- [x] manifest.json template plus icon-set checklist in the starter.

### Motion personality — R17

How the library moves, not just how it looks. Everything downstream — page transitions (R13), the parallax/idle motion pack (R11) — inherits these tokens.

- [x] Personality tokens: two complete motion sets selectable with one attribute or config key. Lively, the default: momentum, inertia and playful bounce — spring-like overshoot easings (CSS linear() spring curves with cubic-bezier fallback), weight in every press, settle in every arrival. Calm: short, near-linear, slight — for products that should whisper. prefers-reduced-motion stays the third level above both: everything collapses to nothing.
- [x] Apply the personality everywhere: every existing transition moves to the personality tokens — buttons press with weight and spring back, chips and toggles bounce as they flip, tooltips and reveals arrive with a settle, slider thumbs carry momentum. No component ever hardcodes an easing or duration again; the tokens are the only source.
- [x] Wall entry for motion: Lively / Calm / Off chips that flip the whole page live so the difference is felt, not described — plus the Features and llms.txt lines.

### Seamless page transitions — R13

- [x] Cross-page transitions: @view-transition navigation rules so moving between pages of a Facet product animates old-page-out / new-page-in while the URL changes; instant fallback where unsupported; off under prefers-reduced-motion.
- [x] Opt-in controls: one attribute enables transitions site-wide, per-link opt-out, and a facet.js helper for programmatic navigation with the same transition.

### Velvet ingestion — R18 · from the inflation-app handoff

COMPLETE. Source of truth was handoff-velvet.md in the repo root (verbatim export from apps/inflation.html in tanishksharmacom — user-approved, shipped work), deleted when the last box below ticked; everything it carried now lives in the library files, the wall, the Platform laws docs and the R11 chart item.

- [x] Velvet theme (§1): [data-theme="velvet"] light + dark — the two --v-* value blocks plus the standard base/accent-rank tokens mapped from them (gold = accent-1, gray face = accent-2, gold ink = accent-3); component recipes fold into facet.css scoped under the theme; behavioral laws recorded as comments. Composition layer (type voices, gold ink, spacing) with it.
- [x] Snap-pager layout (§2): the iOS-proven model — outer never free-scrolls, JS spring between section tops, sections scroll natively inside, gesture handoff with rubber-band hint, wheel paging, equal head/foot padding. Ships as facetPager in facet.js plus the layout CSS.
- [x] Components (§3) — base CSS ingested and self-wiring; float-btn shipped as the lone-trigger variant (owner request, 5 Jul); wall entries live for tab bar, sheet & menu, float button, scroll gauge, choice grid; tick scale on the slider entry; golden CTA and typography voices ship inside the velvet theme; chart theming rules moved to the R11 chart item (the handoff is deleted). Full list: tab bar + spring pill, sheet, menu list + icon toggles, scroll gauge (panel + draggable page variants), velvet slider with gold jewel + tick scale, choice grid (generalized .choice-grid), capsule number input, golden primary CTA, tooltip tail + touch peek (folds into [data-tip] — fixes iOS sticky hover), install nudge card, full-screen instruction overlay, typography voices, chart theming rules.
- [x] JS modules (§4, verbatim): facetFeedback (sounds + haptics), facetSheet, facetScrollGauge, facetTabIndicator, facetInstallNudge, facetMotion (parallax off/cursor/tilt — the R11 motion pack, arriving by extraction), plus facetTouchPolish and the controls wiring pattern.
- [x] Rules / laws (§5): the iOS platform laws into the docs — pager law, gesture law, app shell law, caching law, parallax exclusion, font-list law — as "Platform laws" in the Rules section on the page, in CLAUDE.md where they bind building, and in llms.txt. The caching law superseded the R6 worker: facet-sw.js is now network-first for pages and unversioned /lib/ files (cache only answers offline), cache-first + revalidate for other assets.

### System-native Default theme — R2

- [x] Support matrix first: AccentColor/AccentColorText work in Safari 16.4+ and Firefox 103+ (real OS accent; iOS resolves to system blue), do not parse at all in Chrome/Edge (probed Chromium — CSS.supports false, a clean @supports gate); Highlight/ SelectedItem parse everywhere but are fixed browser blues in Chromium, so they cannot carry the accent. Recorded as the comment on the system-native accent block in facet.css.
- [x] Wire the Default theme to the OS accent where supported: accent-3 rank (links, labels, focus ring, selection via ::selection's tokens) becomes AccentColor/AccentColorText behind @supports (color: AccentColor), hover/pressed via color-mix toward ink in light and paper in dark; scoped with :not( [data-theme]) so themed pages keep their inks; ink fallback everywhere else. Cascade verified in-browser with a same-shape probe (Chromium lacks AccentColor, so the selector logic was proven with a substituted system color, plus fallback checks).

### Theming suite — R8

- [x] Custom accent recipe: overriding a rank's four tokens in one block, documented as a supported feature in the Color section with a live example (subtree override on the demo container) and the copyable :root block; facet.set named as the runtime path; AA note on the on-color included.
- [x] Aero theme, light and dark: sky aqua, glass gloss, translucent plastic, pill buttons; palette locked in the theme block; --a-* material tokens (gloss with the hard 50% line, glass border, glass fill, blue glow); recipes for buttons (pills + gloss), inputs (glass capsules), result/tab-bar/sheet/float-btn panels; dark is ocean glass. Switcher and setup strip enabled.
- [x] Elegant theme, light and dark: cream and gold, serif display via the --font-heading token, carved elevation via the --e-carve inset token (panels pressed in, never floated), gold hairline borders; obsidian-and-gold dark twin. Switcher and setup strip enabled; palette locked in the theme block.
- [x] Theme generator (Style Mixer): #style-mixer on the homepage — eight pickers (base family + three accents) restyle the page live via facet.set inline custom properties over the active theme; hover/pressed derive via color-mix toward ink/paper by mode, on-colors by luminance; mix rides ?mix= for sharing; export block renders the paste-ready facet.set script; reset returns to the active theme. Docs-only logic, inline.
- [x] Skin Lab: #skin-lab on the homepage — 5 themes × 2 modes, each panel its own tiny framed document (real facet.css, identical markup, one attribute apart). Frames, not subtrees, on purpose: material themes scope recipes under [data-theme] and an ancestor's recipes would leak into differently-themed subtree panels. Lazy-loaded.

### Themed map — R16

- [x] Map styling engine: facet.mapStyle() — the active theme's tokens become a Maps styles array by formula (ground = background, parks 6% ink, water 14% ink, roads surface/border, labels the text family haloed in background, country boundaries accent-3; POI/transit clutter off), resolved to hex through a probe so color-mix and the OS accent work. Never hand-tuned per theme.
- [x] Map component: div[data-map] wired by initMaps — bring-your-own key via data-map-key or data-maps-key on the script tag; loads the Maps JS API once, applies facet.mapStyle(), restyles all live maps on theme/mode attribute change; themed placeholder (token grid + one line, localized) when there is no key, no network, or the API fails — never a broken embed.
- [x] Map on the library page: #map wall entry, snippet with copy. Docs-key decision recorded: the page carries no key on purpose — no referrer-restricted key exists for the domain yet, so the placeholder IS the honest no-key state shown live. Swap in a site-owned restricted key later by adding data-maps-key to the script tag; nothing else changes.

- [x] facet.json: machine-readable manifest at the repo root — files, themes, modes, motion personalities, languages, every token by group, global data attributes, every component with classes/ attributes/one-liner, the full facet.* API. Kept in sync by the three-places rule (updates in the same commit as any capability).
- [x] "Copy as Markdown for LLM" button per wall entry: docs script adds it beside every copy button — heading + description + exact snippet fenced as html, one paste per component.
- [x] Analytics bridge: the five-line closest("[data-event]") snippet documented under Rules → Analytics on the page, in llms.txt's analytics section, with a copy button.
- [x] Playground: #playground — a textarea rendering debounced into a framed real page built on the two shipped files, following the docs page's theme and mode live.
- [x] Cheatsheet: #cheatsheet — components, global attributes, tokens and the JS API rendered from facet.json (one source, can never drift), with a filter that hides rows and emptied groups.
- [x] Live size badge: the get-started strip fetches both lib files and gzips them in the visitor's own browser (CompressionStream) — the real number, never a claim; absent when it cannot be computed.

### Reader adaptation — R3

- [x] prefers-contrast: more — token-layer formulas after every theme block: muted text becomes the ink, borders mix 55% toward it, focus ring thickens to 3px; holds in all themes and modes.
- [x] Forced-colors mode: audited under emulation; background-shaped pieces (tab indicator, gauge, sheet, nudge card, float button, slider, tooltip) keep a real border in the system palette.
- [x] data-density="compact": tightens the whole spacing scale, html or any subtree, same mechanic as themes; config key already wired through R14.
- [x] .visually-hidden utility class, standard clip pattern.
- [x] Text roles: .text-display/.text-h1…h4/.text-body/.text-small/ .text-caption — same names as the tokens; display and heading steps carry the heading voice.

### Backgrounds — R15

- [x] Technical-drawing grid background: .bg-grid — plus marks at the intersections and nothing else, built from four gradient layers (two gridline layers under two background-colored covers with transparent windows at each crossing); tokens only, every theme and mode.
- [x] Pattern set: .bg-dots, .bg-ruled, .bg-graph (minor/major lines) — same one-class mechanic, whisper-faint, background-image: none under prefers-contrast: more.
- [x] Backgrounds wall entry with pattern chips, Features line, llms.txt section, facet.json entry.

### Safari/iOS capabilities and child safety — R7

- [x] Research pass: catalogued as "iOS, honestly" in the Rules section and llms.txt — theme-color tints Safari's chrome; standalone install via manifest + apple metas; web push and badging only for home-screen apps on iOS 16.4+, from a user gesture, never a plain tab; Screen Time, age reading and parental controls are OS-only, no web API; child safety for websites = self-labeling (RTA rating meta for adult content, isFamilyFriendly JSON-LD for family content) plus restraint.
- [x] Implemented: facet.js now creates and live-syncs the theme-color meta to the active theme's --background (theme, mode and system-scheme changes); the head pack is documented with a copy button on the page and in llms.txt; the apple metas and manifest mechanics were already law from R18/R6.

### Site polish — R10

- [x] Click-to-copy tokens: every swatch and every token name in the type labels is a real button copying its var(--name), with a feedback tap.
- [x] Keyboard-first search: "/" or Cmd/Ctrl+K focuses the wall search; ArrowDown enters the index and arrows walk its visible links, ArrowUp at the top returns to the box.
- [x] Heading permalink anchors: every titled h2/h3 gains a hover/ focus-revealed # button that copies the deep link and sets the hash.
- [x] Class reference table per component: classNotes authored in facet.json for all 16 wall components, rendered into each entry as a details block — one source, cannot drift.
- [x] Keyboard interaction table on interactive components (keys in facet.json, same renderer).
- [x] Do/Don't pairs per component with the one-sentence reason (do/dont/why in facet.json).
- [x] Accessibility notes per component (a11y in facet.json): ARIA behavior, focus, announcements, honest limits.
- [x] Live AA/AAA contrast badges: WCAG ratios for text/muted/ on-accent-1/accent-3-link pairs under both color panels, probe-resolved per panel, re-rendered on theme/mode mutation.
- [x] Component status badges: data-status on each wall h3 (stable core, beta app kit, alpha map), rendered as a pill chip.
- [x] Viewport-width toggles on every demo: phone 375 / tablet 640 / desktop chips constraining the demo box.
- [x] Open in CodePen on every wall entry: POSTs the snippet plus the two real tags to codepen.io/pen/define.
- [x] Edit-on-GitHub link on every wall entry.

### Components — R11

- [ ] Field actions (NEW · owner asked, not yet built): inside every text field, an actions affordance on the right edge. Owner's decision: a single three-dot menu button (icon, in-field, 44px target) that opens a small popover with Copy (the field value to clipboard), Paste (from clipboard into the field), and Undo (revert the last change — keep a per-field value history); PLUS a standalone Clear (×) icon in the field that wipes the value in one tap (distinct from the menu). All self-wiring via facet.js on a `data-field-actions` field wrapper: no per-field JS. Each action fires feedback (tap/tick) and a `data-event` analytics hook; the menu is a real `button` + `[popover]`/details, the × is a real `button` with an aria-label. Works in every theme, keyboard operable, description tooltips on each. Wall entry on library.html (Fields group) + Features/llms.txt line when built.
- [x] Row: .row/.row-tight/.row-loose — horizontal flow with wrap, the row owns the gap; wall entry with gap chips.
- [x] Grid: .grid/.grid-wide/.grid-tight/.grid-loose — auto-fit minmax columns, breakpoint-free; wall entry with variant chips.
- [x] Switch, checkbox, radio: native inputs themed via accent-color, label.check-row makes the whole line the 44px target, .switch upgrades a checkbox to track-and-thumb with semantics untouched.
- [x] Stepper (real number input between step buttons; min/max/step rule; feedback tick) and segmented control (hidden radios: native arrows, form value, announcements; pressed-in pill).
- [x] Input, textarea, select, search as wired field components: one label.field pattern for all; select grows a token-colored two-gradient chevron (velvet keeps it — recipe moved to background-color); search is a capsule; .field-invalid error state on every control.
- [x] File upload (::file-selector-button dressed as the secondary action, everything else native) and date/time inputs (native pickers, accent-color highlight, color-scheme dark).
- [x] Card: .card / .card-outlined / a.card.card-clickable (whole surface links, spring lift + press); velvet raises, elegant carves, aero glosses — material recipes per theme.
- [x] Modal, drawer, popover: dialog.modal / dialog.drawer opened by aria-controls buttons (showModal; Esc, form method=dialog and backdrop click close), [popover] styled with light dismiss and zero JS; spring arrivals on the motion tokens.
- [x] Accordion (native details, name-grouped exclusivity, rotating chevron), toast (facet.toast(message, kind), aria-live rack, 4s self-dismiss), dropdown menu (details.dropdown of real buttons; outside click / Esc / pick closes).
- [x] Tabs (real ARIA tabs: roving tabindex, arrow keys, accent underline, facet.js panel wiring), breadcrumb (ol of links, aria-current page), pagination (real links, 44px squares, accent-1 current, aria-disabled edges).
- [x] Nav link states: .nav-link — muted default, hover names it, aria-current="page" fills it; 44px rows for chrome navigation.
- [x] Table component: table.table — muted header, zebra rows, row hover, .num tabular columns, .table-scroll phone wrapper.
- [x] Chart: facet.chart(el, {points, projectFrom, events, format}) — all the handoff's theming rules shipped: accent-1 line 2.5px with dashed projections, background-ringed dots, border grid, muted axis text, event verticals labelled in the reserved band above, drag crosshair dropped on lift, ~1 unit/px SVG, touch-action none. Velvet golds the line through accent-1 with zero chart rules; .chart-card is a well there. Bonus fix found in verification: [popover]:not(:popover-open) display none at author origin, so layout utilities can never beat the UA's closed-popover hiding.
- [x] Badge (tinted status pills, four kinds), chip (promoted from the docs' own controls; bare aria-pressed chips self-toggle, wired chips keep their handlers), avatar (image or initials, two sizes), progress (native element themed, accent-1 fill).
- [x] Skeleton (shimmer placeholder, aria-hidden groups), spinner (accent ring, role=status words carry it under reduced motion), empty state (dashed zone + the one filling action).
- [x] Flagship link: .flagship-link — heading voice, strong accent underline, leaning arrow on hover; one or two per screen.
- [ ] Icon set: thin 1.5px line glyphs, around 40 to start
- [x] Motion: desktop parallax driven by pointer position — one attribute, data-parallax="depth", registers with facet.motion (cursor mode; spring physics STIFF 0.10 / DAMP 0.80).
- [x] Motion: mobile parallax driven by scroll — the engine's velocity kick term (weight and inertia through the same spring), fed by the page or pager scroller.
- [x] Motion: gyroscope upgrade — tilt mode auto-picked on ungated gyro devices; on iOS facet.motion.setMode("tilt") asks DeviceOrientation permission and falls back to cursor honestly.
- [x] Motion: idle animations — .idle-float/.idle-sway/.idle-pulse on the composable translate/rotate/scale properties (the parallax exclusion solved structurally); calm stills them, off and reduced-motion still everything.

### Blocks — R11

All twenty shipped as the Blocks layer on the homepage (5 Jul 2026): copyable assemblies of the components, each with its wall entry, snippet and inventory line; new CSS kept to the real jobs (.card-row, .top-menu + native phone fold, .hero, .cta-band, .stat, .pullquote, .media-figure) plus the generic data-filter input behavior.

- [x] Grid of cards with responsive columns
- [x] Horizontal scrolling card row (.card-row, proximity snap — safe: the pager law is about full-page sections)
- [x] Filterable card list: input[data-filter] live-hides children
- [x] List cards: stacked full-width rows
- [x] Product grid: image, title, price, state; whole card the link
- [x] Product detail block: gallery plus info panel
- [x] Cart line items with steppers and the result total
- [x] Full top menu: logo, links, actions, native details fold on phones
- [x] Sidebar navigation with sections
- [x] Footer: link columns plus legal row
- [x] Hero: headline, subtext, CTA (.hero)
- [x] Feature grid, pricing table, FAQ list, CTA band
- [x] Logo row, testimonial block (.pullquote + .avatar)
- [x] Data table with toolbar: search (data-filter), chips, actions
- [x] Stat row: KPI cards (.stat)
- [x] Settings section: labelled rows with controls
- [x] Form section: grouped fields with a submit row
- [x] Article header: title, byline, meta
- [x] Prose block: semantic tags on the narrow container — the base styles are the design
- [x] Media figure with caption (.media-figure), pull quote (.pullquote)

### Templates and versioning — R11 + R12

- [x] Landing page assembled from marketing blocks (/templates/landing.html: top menu, hero, proof, features, pricing, FAQ, CTA, footer; org JSON-LD).
- [x] App shell: sidebar + top bar with a working dashboard screen (/templates/app.html: stats, live chart, table with toolbar).
- [x] Pitch deck: 1920x1080 slides, fullscreen presenting (F), arrow/space/page-key navigation, scale-to-fit any screen.
- [x] Pitch deck: five layouts — title, content, two-column, chart, closing.
- [x] Pitch deck: print-to-PDF at exact 1080p (@page 1920x1080, one slide per page).
- [x] A4 document: .page class with true print margins, one sheet per page.
- [x] A4 document: letterhead, invoice (table + result total), one-pager.
- [x] Business card: 3.5x2in .bcard, front and back.
- [x] Business card: print sheet — five duplex-aligned pairs per A4 at exact size.
- [x] Article page: header, prose, media figure, pull quote, footer (/templates/article.html; article JSON-LD).
- [x] SEO starter: head pack in every template — title, description, OG tags, canonical, favicon slot.
- [x] SEO starter: JSON-LD slots — organization (landing), article (article); product slot documented in llms.txt when commerce pages arrive.
- [x] SEO starter: robots.txt and sitemap.xml at the site root as the copyable pattern.
- [x] PWA starter: app.html is installable out of the box — manifest link, apple metas, theme-color, the one-line sw stub wired (mechanics from R6).


-------------------------------------------------------------------------------

## Parked (not in the queue)
===============================================================================


- v1 freeze — copy /lib/ to /lib/v1/, tag v1, start the changelog, add the version switcher. Deliberately NOT scheduled: the library is moving fast and freezing now would pin a stale snapshot. Revisit only once the rapid changes are done, all the owner's apps are built, and the old website is redone — then it's one commit on request. Until then everything stays on the moving /lib/ (always-latest, pre-v1 policy). Do not raise it unprompted.


-------------------------------------------------------------------------------

## Shipped
===============================================================================


### Tokens and themes
- [x] Core palette, accent + hover/pressed, status colors, dark values for every token
- [x] One-attribute theme switch (Default, Sand; aero and elegant stubbed); layout containers restyle with the theme
- [x] Subtree theming: data-theme / data-mode work on any element
- [x] Font stacks, type scale, weights and line heights
- [x] 4px spacing scale, container widths, radii, border widths, shadow scale, motion durations and easings, reduced-motion handling

### Base styles
- [x] Reset (box sizing, margins, media defaults, [hidden] wins)
- [x] Text, forms, media, tables — every raw tag styled
- [x] Focus rings, selection, scrollbars, skip link, print base

### Components
- [x] Container (four widths) · Stack (three gaps) · Snap section
- [x] Button (three variants, three sizes) · Icon button
- [x] Number input: prefilled example, one-tap clear, Indian grouping, words helper · Labelled field with hint and error state
- [x] Slider with live readout · Result block (three variants)
- [x] Description tooltip: data-tip on anything, data-tip-below variant

### The library site
- [x] Header: wordmark, live theme switcher with URL state, dark toggle, GitHub link
- [x] Get-started strip with self-filling domain and one copy button
- [x] Features section: the complete capability inventory, mirrored in llms.txt, no-orphan-features rule in CLAUDE.md
- [x] Rules on the page, near the top, same text as CLAUDE.md and llms.txt
- [x] Typography as a real article · Color as light/dark side by side · Spacing through real components · Shape/elevation/motion section
- [x] Element wall: every component live with description-as-AI- instructions, variant/state chips, DOM-serialized snippets with copy buttons
- [x] Sidebar index with search filtering, scrollspy highlighting, dividers between sections
- [x] llms.txt: the full plain-text manual for AI crawlers
