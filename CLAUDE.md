# Facet — the build charter
===============================================================================

> **What this file is.** The single source of truth for *building and maintaining* Facet: its principles, the project map, the keep-in-sync contract, and the checklist a contributor or AI follows to add to the library. Both a human and an AI can read it top to bottom.
>
> **You probably don't need this to *use* Facet.** If you just want to build a page with it, read [`llms.txt`](llms.txt) (the usage guide) or start on the [home page](index.html). This charter is for people extending the library itself.
>
> Everything below is written as instructions a human or an AI follows to build and extend the library — the requirements the library holds itself to, not a workflow.

Facet is a plain HTML, CSS and JS design library used across everything: apps, websites, pitch decks, documents and business cards. It is one CSS file and one JS file (plus a small optional service-worker engine, `facet-sw.js`, for the PWA layer) hosted at a public URL. Any project pulls it in with one link tag and one script tag. No React, no build step, no npm install, never minified.

**Where truth lives — the routing table.** Four homes, one job each. When information is added or changed, it goes in exactly one home; the others link to it, never copy it:

- **This file (`CLAUDE.md`)** — HOW to build: rules, the keep-in-sync contract, the compliance checklist, binding decisions, and the deep build specs kept as engineering reference. Never a backlog, never strategy.
- **`llms.txt`** — WHAT exists: the exhaustive capability inventory and usage guide. If it is not in llms.txt, it does not exist.
- **The Notion Facet hub** (https://app.notion.com/p/38bb4fa1867c80d2a77cd2f4d318cc15) — WHY and where next: manifesto, positioning, direction, inspiration. Never implementation detail.
- **The Notion All To Dos board, Project = Facet** (linked on the hub) — WHAT to build next: the only backlog. One row per item, implementation steps inside the row; rows link back to the reference specs in this file. No backlog text lives anywhere else.

The routing rules that follow from it: a new idea becomes a to-do row immediately, even mid-conversation. A strategy or direction shift updates the hub. A rule or decision that binds building updates this file. A shipped capability updates llms.txt and the rest of the keep-in-sync contract below, in the same commit, and flips its to-do row to Done.

The repo root is the library's website, deployed by Vercel as a static site on every push to `main`. It is a small multi-page site: the **home page** (`index.html`) is the pitch — philosophy, a curated feature list, and how to use it — and the **Library** (`library.html`) is the catalogue, where every token, component, block, template and app-feel behaviour is live with its exact copy-paste code. The library itself is the files in `/lib`: `facet.css`, `facet.js`, and the optional `facet-sw.js`.

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
<link rel="stylesheet" href="https://facet-kappa.vercel.app/lib/facet.css">
<script src="https://facet-kappa.vercel.app/lib/facet.js" defer></script>
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
    What:      the build/maintain charter, plus deep build specs kept as reference
    Read by:   Claude + contributors
    Truth for: how to build and add to the library (what to build next lives on
               the Notion All To Dos board, Project = Facet)

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

`favicon.svg`
    What:      the site favicon; every page and template references it
    Read by:   browsers
    Truth for: -

`LICENSE`
    What:      the license
    Read by:   people arriving via GitHub
    Truth for: -

### Keep-in-sync contract — what one change must touch

Adding or changing a component means updating all of these in the **same commit**, or it drifts:

1. `/lib/facet.css` — the component's own commented section.
2. `/lib/facet.js` — its behaviour, if any (one named function).
3. `library.html` — its wall entry: live demo of every variant/state + the exact snippet.
4. `llms.txt` — its full usage entry, plus its line in the capability inventory. **llms.txt is the source of truth for "does this exist".**
5. `index.html` — a curated Features card ONLY if it is a headline, user-facing capability. The home Features are the human subset, not the exhaustive list; the exhaustive list is `llms.txt`.
6. The Notion to-do row (All To Dos, Project = Facet) — flip it to Done, and add new rows for anything discovered along the way.

The description text is written once and reused word-for-word in three places: the file comment in `facet.css`/`facet.js`, the `library.html` wall entry, and `llms.txt`.

When a page is added, renamed or removed, update three places together: this project map, `sitemap.xml`, and the header nav on every page.


-------------------------------------------------------------------------------

## The thesis — why Facet exists
===============================================================================


> The one belief everything else hangs off. Read this first; it explains *why*
> the rules below are the rules. Plain and blunt on purpose.

**React solved a real problem — for its era.** Frameworks like React exist to help
*humans* manage complexity while coding: reuse components, wrangle state, coordinate
big teams. That was a fair trade when humans wrote every line.

**But the trade made the web worse.** The price was build steps, npm, bundlers, deep
dependency trees, and minified output no human can read. The web got heavier, slower,
and unreadable. A "simple" site now needs a toolchain. That is backwards.

**AI changes the equation completely.** The whole reason frameworks earned their
complexity — making it easier for *developers* to develop — is exactly the part AI
now automates. The AI writes the bulk of the code. So "developer ergonomics through
abstraction" stops being worth its weight. The abstractions become dead weight the
AI has to fight through, and the human can no longer read what shipped.

**So the bet: go back to the web.** When a machine does the typing, the right material
is the one that is best for the *web* and best for a *machine to reason about*: clean,
semantic, native HTML/CSS/JS. No build. Works everywhere. Ages well. Readable by the
human who wants to check it. React's abstractions were a workaround for a constraint
that no longer binds.

**Who Facet is for.** Normal "vibe coders" and serious intermediate builders — a PM,
a founder, anyone with taste and an idea — NOT developers who want ceremony. The
promise is: *point your AI at Facet and build a real, tasteful product.* Good themes
and good animations from day one, so the result looks designed without anyone
hand-tuning it.

**What we refuse.** The install ritual is the enemy. `npx`, "connect an MCP", "copy
these files", "install these dependencies", a registry CLI — that is developer
ceremony that overwhelms a normal person and adds nothing when an AI is doing the
work. Facet has none of it: one `<link>`, one `<script>`, and an `llms.txt` so the
agent already knows how to use every piece. The competitor lesson is sharp here —
libraries full of great animations bury them behind React + build + CLI, and a
normal person bounces off. That is the lost opportunity Facet exists to take.

**The one-line version.** The React generation made the web complex so developers
could build. AI now does the building — so we go back to a clean web and good
principles, and let anyone build.

*(The full manifesto — the frustrations with today's web, articulated at length and
kept private until the product earns the right to publish them — lives on the Notion
Facet hub's Manifesto sub-page:
https://app.notion.com/p/397b4fa1867c81dd9594d2c444c30dd1. This section is the
condensed operational version that guides build decisions.)*


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
- Motion by default: gyroscope parallax, shine (a specular light that travels with the device) and idle animations, with reduced motion honoured. (Shipped as the App-feel layer: parallax, shine, idle motion, sound and haptics — one engine, facet.motion, normalises the device movement into a single vector and spends it on two channels: move translates parallax elements, light steers the shine; where no input exists the engine falls back to an idle drift every 3s, or to off.)
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
- [ ] States ride the grammar (see the Component state system spec): a native pseudo-class, an ARIA attribute, or `data-status` — never an invented class. Status colors read the `-tint`/`-edge` token pairs, never a hand-rolled `color-mix`. Check the component under `aria-busy` — the loading skin should trace it sensibly.
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
- Parallax exclusion: elements carrying their own transform physics (velvet lift/press, the pager's elastic overscroll) never register with facetMotion's MOVE channel — two writers on one inline transform collide. The LIGHT channel (shine, data-shine) is exempt: it writes only the --shine-x/--shine-y custom properties, never transform, so it composes with anything.
- Font-list law: never put `inherit` inside a font-family list; it silently invalidates the whole declaration. Stacks end in a generic family.


-------------------------------------------------------------------------------

## Analytics
===============================================================================


- No analytics vendor is baked in — bring your own.
- Every key action carries a stable `data-event="name"` attribute (documented per component). To track them: add ONE click listener that finds the nearest `[data-event]` and forwards its name to your tool — `document.addEventListener("click", e => { const el = e.target.closest("[data-event]"); if (el) track(el.dataset.event); })`. Because the hook is a plain attribute, any vendor (GA, Plausible, PostHog, …) wires the same way. The copy-paste version lives in llms.txt under Analytics.


-------------------------------------------------------------------------------

## Naming and code quality
===============================================================================


- Tokens named by role, not value: `--surface`, not `--gray-100`. This extends to spacing and type: name them by intent (card spacing, section spacing, heading, body, caption) — never by a bare number a builder has to memorise (`--space-2` was the old value-named spacing scale, now retired; the type sizes keep their `--text-h1`…`--text-h4` names because h1–h4 are heading roles, not bare values). Density and type size are one global three-step control (small/medium/large), and both are set BY THE THEME — you never pick a theme and its spacing separately.
- Typography is tokenised by role so a theme re-voices the whole library by swapping a handful of variables, never by touching components: weights (`--weight-body/-medium/-strong/-heading`), line-height per role (`--leading-display/-heading/-snug/-body/-ui` — tighter as type grows), tracking per role (`--tracking-display/-heading/-snug/-body/-label/-caps/-wide` — big type tightens, caps micro-labels open up, `-wide` for spaced overlines/eyebrows), reading measure (`--measure`, `--measure-narrow`), and prose rhythm (`--flow-heading-above/-below`, `--flow-paragraph`, `--flow-tight`). The flow tokens are em-based vertical margins that give raw semantic HTML its rhythm; gap-based layout primitives (`.stack`, `.row`) zero child block margins via a `:where()` reset so rhythm governs prose and gap governs app layout, never both at once. These are not user-facing wrappers — they exist so multiple themes can drive one coherent look; a component reads them, it never hardcodes a size, weight, tracking or margin.
- Fonts are role tokens too: five faces, one per job — `--font-heading` (calligraphic serif), `--font-body` (rounded sans), `--font-mono` (technical monospace), `--font-quote` (editorial serif for quotes and callouts), `--font-numeric` (display serif for big standalone numbers). The Default theme loads them via a single `@import` from Google Fonts at the top of `facet.css` — an accepted external dependency (no extra HTML tag, no build step, still one CSS + one JS), and every stack ends in a system fallback so text renders instantly and survives the fonts failing to load. A theme swaps the five faces; components only ask for a role. New font roles are added only when a face does a genuinely different job — never one per component.
- One class prefix and pattern for components: `.btn`, `.btn-primary`, predictable everywhere.
- JS: one small named function per behavior. The name says what it does.
- Never minify. The shipped files are the readable, commented source.


-------------------------------------------------------------------------------

## Rules for building and maintaining
===============================================================================


- Deployment default: push work directly to `main` (the user works on main and wants changes live on each push). Do NOT create feature branches unless the user explicitly asks for one. This overrides any older branch-per-change workflow.
- The backlog lives on the Notion All To Dos board (Project = Facet) — see the routing table at the top of this file. New ideas become rows immediately; this file never grows a queue. At the start of a build session, read the board for what to build and this file for how.
- Docs are demos. A component is not done until the Library wall (library.html) shows it live with its code.
- One component, one clearly commented section in the CSS file. Nothing is scattered.
- Growth by extraction: build a new pattern inside a project first, promote it once it repeats.
- App logic, data fetching and state management live in projects, never in the library.
- Docs-only styles and scripts live in docs.css and docs.js — never in /lib. They serve the docs site's own styling and scripts, not the shipped library.
- Every new component passes the full compliance checklist above before it ships.
- The inventory rule: llms.txt is the exhaustive list of every capability the library ships — if it is not in llms.txt, it does not exist. The homepage Features are a curated human subset. No capability ships without its llms.txt line.
- When a component or rule changes, update its three descriptions together — the file comment, the library.html wall entry, and llms.txt (full keep-in-sync contract in the project map above).
- Page section comments (HTML). Mark each page section with a short comment: a rule of ~30 equals, then the heading with its layer on one line, then a one- to two-line description, then the closing rule. Keep the rules SHORT — long equals runs are noise, not structure. Exactly:
  ```
  <!-- ==============================
       Layer 1 · Typography
       One or two plain lines saying what the section is.
       ============================== -->
  ```
- Prose vs stack (the rhythm rule). Raw prose — a typography specimen, an article, anything meant to read as writing — sits in NORMAL FLOW, never in `.stack`. In flow the `--flow-*` heading/paragraph margins collapse into proper rhythm (a heading's `em`-based top margin is proportional to its own size, so big headings breathe more). `.stack`/`.row` are for APP LAYOUT: they space children with a fixed `gap`. Putting prose in a `.stack` gives you both the gap AND the (non-collapsing) flow margins — visibly too much space. Pick one per context.
  - Known issue to fix site-wide (assess before doing): the `:where(.stack,…) > * { margin-block: 0 }` reset is meant to be the safety net for prose accidentally placed in a stack, but `:where()` has zero specificity so it loses to `h1..h6`/`p` element rules and never actually zeroes them. Every `.stack` holding a heading or paragraph (most section wrappers) currently double-spaces. Fixing it (give the reset real specificity) tightens spacing wherever prose sits in a stack — needs a visual pass across index/library/templates first.


-------------------------------------------------------------------------------

## Themes
===============================================================================


One attribute (`data-theme`) switches the theme, layout containers included; `data-mode="dark"` is separate and composes with any theme. facet.js carries both in the URL (`?theme=`, `?mode=`), wires `data-theme-switch` / `data-mode-toggle` buttons, boots a page from data attributes on its own script tag, and exposes `facet.set({...})` at runtime.

**Where themes live.** A theme is a `[data-theme="…"]` block in `/lib/facet.css` that maps the semantic tokens (the base family + accent ranks, each with hover / pressed / on-colors, in light and dark). That file is the ONLY place raw hex values exist — do not copy them here. (Sanctioned exceptions, all theme-neutral by design: the print base's ink-on-paper white/black, scrim and backdrop dims, and the instruction overlay's deliberately fixed dark palette. Nothing else.) See every theme live on the home-page switcher and tune one on the Build-a-theme page.

**Colour is ranked, not named.** Components use `--accent-1/-2/-3` (each with `-hover`, `-pressed`, `--on-accent-N`) and never pick a raw colour. One accent-1 action per screen.

The shipped set, by design intent:

- **Default** (no attribute) — a cool near-white page with white surfaces that lift above it, a refined Radix-slate neutral ramp (surface / surface-hover / surface-active, three border weights, three text weights) and whisper-light, navy-tinted layered shadows; hierarchy comes from elevation and hairline borders, not heavy shadow. The neutral base, where the accent ranks are the ink itself (a Vercel-black primary). Dark is Linear's near-black surface ladder (never pure black), softened paper ink, and a top-edge inset highlight in place of shadow. (The OS accent is a separate dormant token, `--os-accent`, kept out of the ranks on purpose.)
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

## Build specs — engineering reference (the backlog lives in Notion)
===============================================================================


> **THE BACKLOG IS THE NOTION TASK BOARD.** What to build next, in what order,
> lives on the All To Dos board (Project = Facet), embedded on the Notion Facet
> hub: https://app.notion.com/p/38bb4fa1867c80d2a77cd2f4d318cc15
> One row per item; each row's body carries its implementation steps and links
> back to the reference sections below. New ideas become rows immediately.
> **At the start of any build session, read the board for what to build and this
> file for how to build it.** When a spec below and the board disagree on
> priority or scope, the board wins.
>
> The sections below are detailed engineering *reference* — specs, digests,
> porting notes. They are not a queue: nothing here gets ordered, ticked, or
> treated as the list of pending work.


-------------------------------------------------------------------------------

## Reference specs — the detailed builds the to-do rows point at
===============================================================================


### The AI product-building edition — the headline direction (cross-cutting)

The strategic bet made concrete (see The thesis above). Today Facet is a design
library an AI *can* read. The next edition makes Facet a thing you *point your AI
at to build a whole product* — no code ceremony, no install ritual. This is the
feature that turns "AI-readable" into "AI-buildable," and it is the reason to keep
going. Nothing here is built yet; this is the plan.

**The core idea.** Facet ships a set of pre-written, product-quality prompts that
respect good product guidelines. You point your AI agent at Facet, and:
- it reads the library (llms.txt) so it knows every component, token and theme;
- it reads the build prompts, then *interviews you* — asking as many questions as it
  needs about who the users are, what the product is for, the jobs to be done;
- it establishes an initial feature set with you, agrees scope, then builds it end to
  end with Facet — a tasteful, working product, not a wireframe.

**The prompts are a series, tiered by the builder.** One size does not fit all:
- **Vibe coder / non-technical:** plain-language questions, no jargon; the AI picks
  sensible defaults, keeps everything front-end and static where it can, and never
  drops the user into tooling.
- **Technical / intermediate (a PM, a founder who understands tech):** the prompt
  lets the AI say "this needs a backend, here's why, here's what a backend is and how
  this one works" — and *teaches as it builds*, so the user stays in control and
  understands what shipped. The teaching is a feature, not a footnote.
- Separate prompt tracks for **front-end-only** products vs **products that need a
  backend/data/auth** (Facet's charter keeps app logic/state in the project — the
  prompt is where that guidance lives for the builder's AI).

**The transparency angle.** The prompts and the process are not hidden — they are a
public page (see the site restructure below). The user can read exactly how their AI
will interrogate and build, which is itself the pitch: "this is how you get a good
product, and here is the whole method."

**The site restructure this implies (three main pages + AI mirror):**
- **Home** — the pitch: what Facet is, why it is different (the thesis), the curated
  headline features. "Point your AI at Facet and build" is the hero.
- **Library** — the component catalogue (library.html today).
- **Build a great product** (new) — the prompts and the process on display: the
  interview method, the tiers, the front-end vs backend tracks, worked examples. This
  is where the AI-edition lives for humans.
- (Build-a-theme stays; it is a tool, not a main narrative page.)
- **The AI mirror + the llms.txt size problem.** Every page has an AI-readable
  version; llms.txt is that mirror today. But llms.txt is already large and this adds
  a whole prompt library — it will get too big for one fetch. Decision to make at
  build time: split the AI surface into focused files (e.g. `llms.txt` = capability
  index/usage, a separate `build.txt`/prompts file = the product-building prompts,
  and per-section files an agent fetches on demand), with llms.txt as the small root
  index that points to them. Keep one small front door; load detail on demand. (Note,
  not yet decided — flagged as the thing to solve when this lands.)

**Why this is the whitespace (from the competitor research).** No one occupies
AI-native + plain-HTML + a full themed design system + *built-in product-building
method* at once. shadcn is AI-native but React + registry + CLI ceremony. Classless
CSS is plain-web but has no components, themes, or AI method. The behaviour libs
aren't design systems. Facet + a build-prompt method for non-developers is a genuinely
unclaimed position: **the design library where AI does the building and a normal
person ships a tasteful product.** This edition is how Facet takes that ground.

Open questions to settle at build time: the exact prompt set and how it is packaged
(files in the repo? a page the AI reads? both); how the AI mirror is split so no
single fetch is too big; whether the build page shows live example runs.

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

### Component state system — one grammar for every state (cross-cutting)

> **SHIPPED (8 Jul 2026)** — the grammar, tokens, loading skin, form states and
> selection/status states all landed in one pass. Decisions made at build time:
> field validation rides `data-status` on the `.field` + one `.field-msg` line
> (`.field-invalid`/`.field-error` stay as permanent aliases); checkbox
> indeterminate needs no CSS — the native mark is themed by `accent-color`,
> set `el.indeterminate` in JS; the avatar presence dot was DROPPED as feature
> creep (revisit only with a real use); the toast keeps `data-kind` as an
> alias; and the **loading skin** shipped as the headline addition — `aria-busy`
> on any region skins its content into pulsing shape-tracing placeholders,
> with `facet.busy()` upgrading text to per-line pills and
> `data-skeleton-lines` generating statistically text-shaped placeholder words
> for empty slots. The spec below is kept as the engineering reference.

**The audit (8 Jul 2026).** States are already half-supported, but unevenly, and there
is no single system a builder or an AI can learn once:
- Interaction states are solid everywhere: hover, visible focus ring, pressed physics,
  `:disabled` (the base layer covers input/textarea/select/button in one rule).
- Selection and navigation states ride ARIA and are styled off the attribute:
  `aria-pressed` (chip, choice-btn, nav-set, theme switcher), `aria-selected` (tabs),
  `aria-current` (nav-link, breadcrumb, pagination, tab bar), `aria-expanded` (float
  button, dropdown, tab settings), `aria-disabled` (pagination edges).
- Status color exists as four theme tokens (`--success/--warning/--error/--info`) but
  only three components consume them: badge kinds, toast `data-kind` dots, and the
  field's error-only validation (`.field-invalid` + `.field-error`).
- Waiting states exist as standalone pieces (`.skeleton`, `.spinner`, `.empty`) but no
  component wires them in as its own loading/empty state.

**The gaps this spec closes.**
1. Validation is error-only: no success or warning field state, no `aria-invalid` or
   `:user-invalid` selector (class only), no styled readonly.
2. No busy/loading state anywhere: a submitting button can double-fire; `aria-busy`
   is unstyled.
3. Every status consumer hand-rolls its tints with `color-mix` — three private copies
   of the same recipe (badge, toast, field).
4. No status or selection states on the data components: card, list row, table row,
   disabled tab/segment/menu item, stepper at min/max, indeterminate progress and
   checkbox.
5. Three different state carriers with no documented rule: classes (`.field-invalid`),
   ARIA attributes, and `data-kind` (toast).

**The technology: one state grammar, three carriers.** The rule, learned once:
- **Native pseudo-class** when the platform has one: `:disabled`, `:checked`,
  `:indeterminate`, `:user-invalid`.
- **ARIA attribute** when a real semantic exists — CSS keys off the attribute itself,
  so looks and accessibility can never drift apart: `aria-pressed`, `aria-selected`,
  `aria-current`, `aria-expanded`, `aria-busy`, `aria-invalid`, `aria-disabled`.
- **`data-status="success|warning|error|info"`** for statuses with no ARIA
  equivalent (fields, cards, list rows, table rows). Toast's existing `data-kind`
  stays as a permanent alias; new work uses `data-status`.

**The token layer.** Define each status's derived pair once in `:root` —
`--success-tint` (the 14% mix into background) and `--success-edge` (the 38% border
mix), same for warning/error/info. Badge, toast, field and every new consumer read
the pair; themes get all of it free because the pairs derive from the four status
tokens each theme already sets. No new hand-tuned hex anywhere.

**The state matrix — which component gets which states.**
- **Button (all variants + icon button):** loading via `[aria-busy="true"]` — inline
  spinner, width kept, pointer-events off; plus `aria-disabled` styling so
  `<a class="btn">` can disable (a link can't `:disabled`).
- **Field:** error (existing, extended to `[aria-invalid="true"]` and
  `:user-invalid`); new success and warning (`.field-valid` / `.field-warning` +
  matching message lines reusing the `.field-error` reveal); styled readonly.
- **Checkbox:** `:indeterminate` (the select-all mixed mark). Radio/switch already
  covered (checked/disabled).
- **Chip:** disabled.
- **Tabs / segmented control / choice grid:** disabled tab or option.
- **Stepper:** minus/plus go `:disabled` at min/max (facet.js sets it; the disabled
  look already exists).
- **Dropdown menu:** disabled item (`aria-disabled`).
- **Card:** selected (`aria-pressed` on the clickable card); `data-status` gives a
  colored edge + tint for statusful cards; a documented skeleton-card loading pattern.
- **List:** selected row (`aria-selected` / `aria-current`), disabled row.
- **Table:** selected row (`aria-selected` on `<tr>`); documented empty pattern (one
  colspan cell holding `.empty`) and loading pattern (skeleton rows).
- **Progress:** indeterminate — a `<progress>` without `value` gets a sliding
  animation.
- **Regions (result, chart, any data area):** the triad, documented once —
  `[aria-busy="true"]` fades content and blocks interaction while work runs; empty is
  `.empty`; failure is `data-status="error"` plus a retry action.
- **Avatar:** optional presence dot (`data-presence="online|away|offline"`) — assess
  at build time; drop if it reads as feature creep rather than a state.

**Non-breaking guarantees (the migration promise).**
- Purely additive: not one existing selector changes; `.field-invalid` and toast
  `data-kind` keep working forever.
- Every new state is opt-in markup; a page written yesterday renders pixel-identical.
- No state needs JS to show: states are attributes in the HTML and CSS renders them
  (the JS-off law holds). facet.js only helps *set* them (stepper min/max, an optional
  form-validate behaviour) — one named function each, with teardown.
- Spinner and shimmer already collapse under `prefers-reduced-motion`; busy states
  inherit that for free.
- AA in every theme, light and dark: the tint pairs derive from status tokens that are
  already AA per theme; verify each theme before shipping.

**Rollout: three commits, each landing its wall entry + llms.txt lines per the
keep-in-sync contract.**
1. Grammar + tokens: the tint/edge pairs, the `aria-invalid` / `:user-invalid` /
   `aria-busy` / `aria-disabled` base rules, the grammar documented in llms.txt.
2. Form states: field success/warning/readonly, checkbox indeterminate, button
   loading.
3. Selection + status: card/list/table selected and `data-status`, disabled
   tab/segment/menu item, stepper min/max wiring, indeterminate progress, the region
   triad.

**Compliance-checklist tie-in.** The checklist already demands "hover, focus, active,
disabled, and where relevant empty, loading, error" — this spec is the concrete
machinery behind that line. Once shipped, extend that line to name the grammar: state
rides a native pseudo-class, an ARIA attribute, or `data-status` — never an invented
class.

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

## Competitor landscape, positioning & candidate features (research digest)
===============================================================================


A standing reference, not a build order. In July 2026 we studied ~150 libraries
that overlap Facet (full teardowns live in the session's batch docs: leaders,
copy-paste kits, big design systems, HTML-first behaviour tools, classless CSS).
This section condenses it: who else is out there, where Facet is genuinely
different, whether the AI-native bet is real, how to market it, and a menu of
candidate features to raise one at a time. Nothing here is committed — each
candidate is brought up, assessed, and either built or dropped on its own.

Writing rule for this section: plain English, so it can be read fast.


### A. The competitor map — who else is in this space

No single product does what Facet does. The field splits into camps, each
sharing 2-4 of Facet's traits, none all of them:

- **Classless CSS** (Pico, Simple.css, Water.css, matcha, MVP, +35): style raw
  HTML so it looks designed with no classes. Facet's base layer is one of these.
  But they are CSS-only — no JS behaviours, no named themes, no components, no
  app scope. Ceiling: raw HTML has no tag for a card, nav bar, tabs or modal.
- **Copy-paste component kits** (Flowbite, Preline, HyperUI, daisyUI, Tabler):
  grab a block, paste it in. Almost all Tailwind, so the pasted code is a long
  wall of utility classes you can't read, and a frozen copy that never gets
  fixes. "Everything looks the same" is their loudest complaint.
- **AI-native / registry** (shadcn/ui is the benchmark: ships llms.txt + a code
  registry + an MCP server + agent skills). This is the one camp that markets
  "AI-native" — but it's React/Tailwind/build-step, not plain HTML.
- **Browser-native web-component kits** (Web Awesome/Shoelace): framework-free
  components over a CDN. But they're custom elements, not plain HTML, and not
  AI-marketed.
- **HTML-first behaviour tools** (htmx, Alpine, Stimulus, Unpoly, Datastar):
  add behaviour via attributes — Facet's DNA. But they're behaviour libraries,
  not design systems, and none is AI-marketed. These are allies, not rivals
  (they own data/reactivity; Facet owns look/theming/app-feel).
- **Design-token systems** (Open Props, Radix, plus the giants — Material,
  Fluent, Carbon, Primer, Polaris, USWDS, GOV.UK): the token + accessibility
  gold standard, but tokens only or huge team rulebooks, not a drop-in file.


### B. What Facet does that they don't — the niche (the whitespace)

The unique intersection, in one line each — this is what to defend and sell:

1. **AI-native + plain-HTML + a full themed design system + llms.txt, together.**
   AI-native today means React/registry; HTML-first means classless CSS or
   hypermedia libs. Nobody sits in both. Facet does.
2. **JS behaviours shipped with the CSS.** Nearly every classless/CSS rival is
   CSS-only; Facet ships a small behaviour layer too.
3. **One-attribute switching across named design-intent themes** (Velvet, Aero,
   Elegant), layout containers included. Rivals offer at most light/dark + a
   couple of palettes.
4. **Token layer + classless base + JS + PWA/app-feel in one CSS + one JS, no
   build.** No competitor combines all of these.
5. **App / PWA / deck / print / card scope.** Classless frameworks target a
   readable blog or docs page; Facet targets whole products.


### C. The market question — is this useful for fully automated AI building tasteful products?

The honest thesis (the reason to keep going):

- **Yes, and it's the strongest angle.** An AI that writes UI needs a material
  it can read, reason about, and get right in one pass. React + Tailwind gives
  an agent a deep dependency tree, a build step, and walls of utility classes —
  easy to break, hard to verify. Facet gives it shallow semantic HTML, plain
  role-named classes, one fetch of llms.txt to learn everything, behaviour by
  attributes, and every state reachable by URL. That is *made* for an agent.
- **The taste is pre-baked, which is the point.** The failure mode of AI UI is
  bland or broken (see Tailwind's "everything is purple"). Facet ships hand-tuned
  themes and one-glance components, so an agent producing *correct* HTML gets a
  *tasteful* result for free — it doesn't have to invent the design, only pick
  the right classes.
- **The catch to be honest about:** "AI-native" is currently a claim, not proven
  machinery. shadcn/ui backs its claim with a registry + MCP server + skills.
  Facet has llms.txt and readable HTML — a real head start — but to *own* the
  niche it likely needs the described-tokens file, and eventually an MCP server
  / agent skill, so an agent can pull components and tokens directly. Those are
  candidate features below, not done deals.
- **Where it wins now:** agent-built or agent-edited marketing pages, docs,
  dashboards, decks, PWAs, one-pagers — anything where readable output and
  built-in taste matter more than a big app's shared state. Where it doesn't:
  large stateful apps (leave data/state to projects, as the charter already says).


### D. How to position & market it (repositioning notes)

Loudest lines first, each backed by the research:

- **"The design library AI can actually read."** The one thing the whole
  copy-paste/Tailwind camp can't offer. Lead with it.
- **"Readable, stays-in-sync code."** Pasted Tailwind blocks are unreadable and
  freeze in time; Facet is plain HTML linked to one shared file, so fixes reach
  every page. Say it plainly.
- **"Distinct themes, not one look."** "Every site looks the same" is the
  category's biggest pain; Facet's named themes are the cure. Never let one look
  become "the Facet look."
- **"Works with JavaScript off — really."** Turbo/Unpoly half-degrade; Datastar
  barely works without JS. Facet's full-content-without-JS promise is stronger
  than any of them. A rare, checkable differentiator.
- **"Editable, no lock-in."** The big systems (Adobe, Shopify) forbid
  customising and people fork them in frustration. Facet is plain, editable HTML.
- **Borrowable tagline** (US Web Design System): *"Focus on your product, not
  your markup."*
- **Name the principle:** *locality of behaviour* (htmx's term) is the known name
  for Facet's one-glance-HTML belief — cite it as the defense.


### E. Candidate features to assess one at a time (from the research)

Grouped by area. Each line: the idea, its main pro, its main con/cost. Raise one,
decide, then build or drop. None is committed.

**Behaviour engine (facet.js) — highest-value cluster:**
- [ ] **Re-wire content added after load** (a MutationObserver, the Stimulus
  model). Pro: behaviours attach to sheets, loaded fragments, cloned rows with
  no manual call — the single most-cited fix, and what makes Facet pair cleanly
  with htmx/Alpine. Con: adds a always-on DOM watcher; must not cost the "one
  attribute, zero setup" simplicity or leak.
- [ ] **Setup/teardown pair per behaviour** (connect/disconnect). Pro: removes
  listeners/timers/animations when an element leaves — stops the memory leaks
  Alpine is infamous for. Con: every behaviour needs a matching teardown written.
- [ ] **Double-init guard.** Pro: mark elements "already wired" so a re-scan
  never binds twice (the root of most double-firing bugs). Con: tiny bookkeeping.
- [ ] **A `me()`-style "this element" helper** (Surreal). Pro: an inline script
  grabs its own element with no invented ID. Con: risks encouraging inline
  scripts, which can clutter the one-glance HTML.
- [ ] **Optional inline scoped styles** (css-scope-inline's 16-line trick). Pro:
  a component carries a local `<style>` that doesn't leak, still no build. Con:
  another way to do styling; could fragment where styles live.

**Tokens & theming:**
- [ ] **Bake the accessibility promise into tokens** (Adobe/Google): "this accent
  rank on this surface always passes contrast," then verify it. Pro: guarantee,
  not hope. Con: needs a contrast check in the process.
- [ ] **A machine-readable described-tokens file** (GitHub Primer): every token
  with a value + one-line purpose, as a companion to llms.txt. Pro: directly
  serves the AI-native niche — agents read the system without a human. Con: a new
  artifact to keep in sync (the keep-in-sync contract grows).
- [ ] **Numbered layers for nested surfaces** (Carbon `layer-01/02/03`). Pro:
  foolproof depth when a menu sits on a card on the page. Con: another token axis
  to learn; may overlap Facet's existing surface ramp.
- [ ] **`-content` on-color pairing for every role.** Pro: text-on-surface always
  readable automatically. Con: doubles some token counts.
- [ ] **Semantic state-color roles** (success/warning/danger/info) + **alpha
  accent variants** (translucent tints). Pro: components that need status colour
  stop hardcoding it. Con: more tokens per theme to hand-tune in light + dark.

**Classless base (make the no-class page best-in-class):**
- [ ] **Auto dark mode on a naked page** — follow the OS setting with no
  `data-mode` attribute. Pro: matches what Pico/Simple.css users expect. Con:
  must not fight the explicit `data-mode` toggle.
- [ ] **Guarantee the reading column + prose rhythm with zero wrappers.** Pro:
  the top classless trick; Facet has the tokens (`--measure`, flow tokens) —
  just ensure they fire on unclassed `<main>`/`<article>`. Con: check it doesn't
  clash with app-layout primitives.
- [ ] **Polish the forgotten tags** (tables, blockquote, code/pre, forms,
  details, figure, kbd, mark) to classless-best standard. Pro: most of the "raw
  HTML looks finished" win. Con: steady detail work.
- [ ] **A document-grade signature theme** (Tufte-style margin sidenotes, in
  article.html). Pro: a strong recognisable look, like LaTeX.css/Tufte, for the
  docs/article audience. Con: sidenotes are layout-heavy; new theme to maintain.

**Components & polish:**
- [ ] **Align control heights** (button height = input height) inside each theme.
  Pro: cheap, makes a whole page look designed (Park UI). Con: audit across
  themes.
- [ ] **Nail the small data pieces** (stat cards, tables, activity feeds) — what
  app builders reach for (Tabler). Pro: high-use components. Con: scope.
- [ ] **One signature moment per template** (a tasteful hero/scroll effect). Pro:
  finished pages feel designed (HTML5 UP/Cruip). Con: keep it in CSS, no JS bloat.

**Docs & process (mostly the GOV.UK playbook):**
- [ ] **Plain-language docs everywhere** (short words, explain terms once). Pro:
  faster for everyone incl. AI; already the house style. Con: none.
- [ ] **"When NOT to use this"** on each component. Pro: builds trust, stops
  misuse. Con: more to write per component.
- [ ] **A tiny pass/fail accessibility list per component** + **a real
  screen-reader check** (tool scans miss ~70%) + **pin the claim to WCAG 2.1
  AA**. Pro: turns "accessible" into something checkable. Con: manual testing
  per component.
- [ ] **Document the classless→component boundary in llms.txt** (missing.css
  style): "raw HTML gets you a beautiful document; add these classes for a
  component." Pro: makes the hand-off feel designed, guides agents. Con: doc work.

**Niche-defining (the AI-native moat — bigger bets):**
- [ ] **An MCP server + agent skill** so an agent pulls Facet components/tokens
  directly (shadcn's moat). Pro: turns "AI-readable" into "AI-operable," owns the
  niche. Con: server/infra — breaks the "two static files" identity, like the
  theme marketplace; do late and isolated.


-------------------------------------------------------------------------------

## React Bits — effects & polish inspiration (research digest)
===============================================================================


A menu of effects and UI patterns to lift from React Bits (reactbits.dev,
MIT + no-reselling clause, source public at github.com/DavidHDev/react-bits),
reimplemented the Facet way. Raise one, assess, build or drop — nothing here is
committed. Plain English throughout.

> **Standing reminder (recurring practice).** Whenever we do a round of visual /
> element improvement — polishing the look and feel, adding themes, or adding new
> animated components — go back to **reactbits.dev and walk every page**. Its
> animations are unusually rich and it is the best single source of effect ideas
> for Facet. Treat this as a checklist step for any "make it look better" pass:
> browse React Bits, pick effects, reimplement the portable ones in vanilla per
> the tiers below. (The lesson is theirs; the plain-web, no-build implementation
> is ours.)

**What React Bits is (the verdict).** A React-only library of ~137 animated
components. Every piece is a React component; there is no plain-HTML or vanilla
version (Vue and Svelte exist only as separate sibling repos). You need a React
project with a build step to use even one. It is distributed by the "copy the
source into your project" model — `npx shadcn@latest add <url>` (or `jsrepo`)
fetches a component's files and writes them into your codebase; it only *reuses*
shadcn's registry/CLI as a delivery pipe, it is not built on shadcn. It is free
(no paid tier) and MIT-licensed, so we may study and reimplement the effects.

**The Facet angle.** React is only the wrapper. Underneath, each effect is plain
CSS, a `<canvas>`, or a WebGL shader — none needs React. So we port the *effect*
into vanilla CSS + one small `facet.js` behaviour, no build step. Our "one link,
one script, no build, works with JS off" stays the differentiator React Bits
can't touch. Triage rule: if an effect moves *text, a border, a card, or an
element in response to scroll/cursor*, it's CSS + a little JS — take it. If it
simulates *light, fluid, particles, or 3D*, it's a shader — skip or approximate.
Every ported effect must honour `prefers-reduced-motion` and `data-motion`, ship
its own teardown, and land as a Layer-2 component or Layer-5 app-feel entry with
its wall demo + llms.txt line.


### Tier A — pure CSS, highest value / lowest cost (copy-paste-ish)

- [ ] **Shine button** (their "Get Pro"). A constant moving gleam + hover lift.
  Technique: an oversized multi-stop gradient background (`background-size:400%`)
  slid via an animated `background-position` keyframe, PLUS a `::before` white
  sweep (`linear-gradient(90deg, transparent→white→transparent)` at 200% width)
  wiped across on a long loop, PLUS an accent glow that grows on hover. Pure CSS,
  no JS. Ships cleanly as a `.btn-shine` variant.
- [ ] **Traveling border** (their "Stop building from scratch" / "Star Border").
  A bright arc that orbits an element's border. Technique: `@property --angle`
  (registered so CSS can tween an angle) + a `conic-gradient(from var(--angle),…)`
  border layer + `mask-composite: exclude` to punch out the middle so only the
  1px frame shows + a keyframe spinning the angle. Pure CSS; degrades to a static
  border where `@property` is unsupported. A `.border-glow` / `.star-border` util.
- [ ] **Glare hover.** A diagonal gloss streak that slides across a card on hover.
  Pure CSS `::before` sweep. Cheap "premium" feel on any `.card`.
- [ ] **Shiny Text** and **Gradient Text.** A light sweep / animated multi-colour
  fill on headings via `background-clip:text` + a moving gradient keyframe. Pure
  CSS text-treatment utilities (`.text-shiny`, `.text-gradient`).
- [ ] **Glitch Text.** RGB-split jitter from two `::before/::after` copies +
  clip-path keyframes. Pure CSS. Optional, louder.


### Tier B — small JS (one shared IntersectionObserver / pointer / timer)

- [ ] **Scroll-reveal utility** (best effort-to-coverage ratio). ONE shared
  IntersectionObserver that fades/slides/blurs elements in as they enter view.
  The same observer powers Split Text, Count Up, Scroll Float, Scroll Velocity —
  build this first; the rest are variants. `data-reveal="fade|up|blur"`.
- [ ] **Split / Blur text.** Reveal per letter or word (fade/slide, or blur→sharp)
  on scroll-in: wrap chars/words in spans, stagger via CSS transition delay,
  trigger with the reveal observer. Small JS.
- [ ] **Count Up.** A number ticks from 0 when it scrolls into view (~15 lines +
  the observer). Perfect for stat blocks.
- [ ] **Text Type (typewriter)** and **Rotating Text.** Type/delete phrases on a
  loop; or cycle words in a fixed slot with a slide/fade. Small JS + a timer.
- [ ] **Decrypt / Scramble Text.** Letters flicker through random glyphs then
  settle to the real word; small `setInterval`. High "hacker" wow, cheap.
- [ ] **Spotlight Card.** A radial glow follows the cursor across a card — a
  couple of lines writing `--x/--y` custom properties that a `radial-gradient`
  reads. Very high value, tiny code. `data-spotlight` on any `.card`.
- [ ] **Magnet.** An element eases toward the cursor when near, springs back on
  leave. Small `mousemove` → transform. Fun on buttons/icons. (Respect the iOS
  parallax-exclusion rule: don't double-write a transform the motion engine owns.)
- [ ] **Click Spark.** Short spark lines burst from the click point; spawn a few
  absolutely-positioned elements (or one tiny canvas) that fade out. Delightful,
  light. Pairs with the existing feedback layer (tap/tick).
- [ ] **Dock magnify.** macOS-style: icons scale by distance from the cursor.
  Small JS computing scale from pointer position. Iconic, no deps. A Layer-5 piece.


### Tier C — self-contained canvas behaviour

- [ ] **Dot-grid field** (their "DotField" — the hero dots that bulge away from the
  cursor). It is Canvas 2D, NOT WebGL. Mechanics that port ~1:1: build dots on a
  grid, each storing an anchor + a springy position; each frame clear and draw ALL
  dots as one batched path (one `beginPath` → loop of `arc` → one `fill`) with a
  single linear-gradient fill; for dots within a cursor radius, push the target
  away (strength grows as `t*t` toward the pointer) and ease the drawn position
  toward it (`sx += (target-sx)*0.15`); ease back to anchor when the cursor
  leaves; gate on mouse speed so it only reacts while moving; a separate SVG
  radial-gradient circle follows the pointer for the glow. ~120 lines, drops
  cleanly into a `facet.js` named behaviour (`data-dot-field`). The most directly
  reusable "wow" on their page.
- [ ] **Masonry auto-scroll feed.** Uneven-height tiles in columns, adjacent
  columns creeping in OPPOSITE directions on an infinite loop, slight hover scale.
  Vanilla: CSS `columns` (or a JS column-balancer) + duplicate each column's
  content and run a `translateY` keyframe (opposite sign per column) so it loops
  seamlessly. Portable, no framework. A Layer-3 block.


### Tier D — heavy: skip, or approximate only

WebGL shaders, physics engines, and 3D — porting means shipping a shader/3D
runtime, against the "one CSS + one JS, no heavy deps" charter. Default: skip.

- **Shader backgrounds** — the purple streaks (their "HeroBand"/"ColorBends"),
  Aurora, Silk, Threads, Iridescence, Liquid Chrome, Plasma, Prism, Galaxy, etc.
  All full-screen GLSL via three.js/OGL. *Approximate* the streaks in pure CSS
  with a few large blurred conic/radial gradients drifting behind the hero
  (`.bg-aurora`, Easy) — won't match, but stays dependency-free. True WebGL only
  ever as an OPTIONAL opt-in add-on file, never in core facet.js.
- **Physics / 3D** — Ballpit (three.js + physics), Lanyard (rope physics), Model
  Viewer, Meta Balls, fluid cursors. Out of scope.


### UI patterns worth adopting (not effects)

- [ ] **Mac-window code block.** Rounded translucent panel, `overflow:hidden`; a
  title bar with three traffic-light dots on the LEFT (theirs are monochrome) and
  an action slot on the RIGHT — the natural home for our copy / download / "copy
  as Markdown" / language-tab buttons; a `<pre><code>` body with token spans.
  This maps almost 1:1 onto Facet's code block and ties into the Print/export
  backlog item's per-code-block affordances. High value, Easy.
- [ ] **Preview-card anatomy** for the library wall: an animated "stage" top half
  (fixed height, `overflow:hidden`, runs the live effect), a single hairline
  divider, then a left-aligned title + muted one-line body beneath. Motion above,
  words below, one crisp line between. Could restyle library.html component cards.
- [ ] **Loading / splash screen.** A fixed dark overlay with a gently pulsing
  logo, revealed until `document.fonts.ready` with a minimum on-screen time
  (~800ms so it doesn't flash), then fade out and stagger the page in. CSS + a few
  lines of JS, no deps. Ties to the PWA/app-shell story. `data-splash`.
- [ ] **Type-scale lessons.** Their look is huge, tight display headings (H1
  `clamp(28px,5.5vw,68px)`, weight 500, `-0.02em` tracking, `line-height:1.1`)
  against tiny mono UI text (11–14px, often uppercase), with COLOUR carrying
  hierarchy (white headline → ~60% white body → ~40% captions) on a dark canvas.
  Three faces, three jobs (display / body / mono-as-UI). Compare against Facet's
  type tokens — we already tokenise this; the takeaway is the bigger jump from
  body to display and using mono as a UI voice, not just for code.


### Guardrails for anything built from this list

- No build step, no heavy dependency in core. WebGL/3D only as an optional,
  clearly-isolated opt-in, never required and never in facet.js.
- Every effect honours `prefers-reduced-motion` and `data-motion="off"/"calm"`,
  and ships a teardown (connect/disconnect) so nothing leaks — this is the
  Stimulus/Alpine lesson from the competitor digest.
- Effects are additive polish on real semantic markup; the page still works with
  JS off and nothing depends on the effect to read the content.
- Each lands as a Layer-2 component (a single reusable piece) or Layer-5 app-feel
  entry, with its library.html wall demo + the keep-in-sync docs trio.


-------------------------------------------------------------------------------

## Parked — not scheduled
===============================================================================


- v1 freeze — copy /lib/ to /lib/v1/, tag v1, start a changelog, add a version switcher. Deliberately NOT scheduled while the library moves fast: freezing now would pin a stale snapshot. Revisit once the rapid changes are done and the consuming apps are built. Everything stays on the moving /lib/ until then (always-latest, pre-v1). Do not raise it unprompted.

- OS accent (`--os-accent`) — the visitor's real OS accent color (iOS system blue as fallback; the true OS accent only where the browser exposes it, Safari 16.4+ / Firefox 103+). The token stays defined in facet.css as a dormant, opt-in escape hatch (`var(--os-accent)`), kept out of the accent ranks on purpose so a theme's inks stay its own. Parked as a *feature*: no component uses it and it is not billed as a shipped capability — do not list it in the homepage Features or as an active llms.txt capability. Revisit if a real use for OS-native accent surfaces (e.g. a "match my system" opt-in). Until then it is a token in the file, not a feature on the list.


-------------------------------------------------------------------------------

## Decisions that bind future work
===============================================================================


The full shipped history is in git and in the live files (facet.css / facet.js / library.html / llms.txt). These are the durable calls that still constrain new work:

- No right-to-left layout — translation yes, RTL no.
- The library ships guidance as well as components (decided 8 Jul 2026): when a pattern matters but is too thin or context-bound to wrap as a component, it ships as a guidance entry — a few imperative lines in llms.txt's "Build advice" section (the inventory rule covers guidance too: unwritten advice does not exist). Wrap a component only when the pattern carries real markup or behaviour; promote a guidance entry to a component when it repeats enough to earn one. First entries: choosing a shell (none / snap / view-stack), safe areas.
- Where truth lives (decided 8 Jul 2026): this file = how to build · llms.txt = what exists · Notion Facet hub = why and direction · Notion All To Dos (Project = Facet) = what to build next, the only backlog. One home per fact; the others link.
- The vivid palette (decided 8 Jul 2026): five bright decorative colors named by rank, like the accent ranks — `--color-1` red, `--color-2` yellow, `--color-3` green, `--color-4` blue, `--color-5` purple. Defined once in facet.css, overridable per theme. They are decoration — card tints (mixed into the surface), charts, playful accents — never semantic status; a component that means success/danger says so in words, not by leaning on a palette slot.
- Layer = composition level: a single reusable piece is Layer 2 · Components (in one of the six categories, snap/layout included); motion, sound and app interface are Layer 5 · App feel; an assembly of pieces is a Layer 3 · Block; a whole page is a Layer 4 · Template. Never create a layer that holds only one entry.
- Variant vs component (decided 8 Jul 2026): a variant flips one class on the SAME markup and behaviour (.btn-primary, .list-boxed, .nav-menu-right); when markup, position or behaviour differ, it is a different component, and the sharing happens through primitives and tokens plus a Build advice entry for choosing between them. Concretely: the four navigations (top-menu block, nav-menu cluster, tab bar, sheet) stay separate components; a list row is ONE component whose looks are slot compositions (icon/avatar, title, description, value/badge/action in the trail), never sibling components.
- The site is multi-page. The header nav is Home · Library · Build a theme · GitHub; llms.txt (for AI) and CLAUDE.md (for contributors) are linked from the home page's "How to use Facet" tracks and from the floating menu's Files group, not as top-level nav items. (The old Components and Layouts pages merged into Library.)
- App logic, data and state live in projects, never in the library.
- (Token, accent, border, spacing/type and theme decisions live in the Naming and Themes sections above — not repeated here.)
