# Facet

Facet is a plain HTML, CSS and JS design library used across everything: apps,
websites, pitch decks, documents and business cards. It is one CSS file and one
JS file hosted at a public URL. Any project pulls it in with one link tag and
one script tag. No React, no build step, no npm install, never minified.

**This repo is the sole source of truth.** The Facet Notion page is a charter
only: vision and requirements, never implementation detail. The backlog lives
in BACKLOG.md in this repo.

The repo root is the library's website. The homepage IS the library:
documentation, living demo and proof of distribution in one page — header
with theme switcher, get-started strip, tokens section, the element wall
(every component live with its description, chips and exact snippet), and
the rules. The library files live in `/lib`. Vercel deploys the repo as a
static site on every push to main.

```
/lib
  facet.css        the whole design system
  facet.js         small vanilla JS behaviours
/templates
  landing.html     marketing page assembled from the block layer
  app.html         app shell + dashboard, installable (PWA + sw stub)
  article.html     editorial page with the JSON-LD article slot
  deck.html        1920x1080 pitch deck: five layouts, arrow keys,
                   print-to-PDF at exact size
  document.html    A4 pages: letterhead, invoice, one-pager
  card.html        3.5x2in business card, front/back + print sheet
  manifest.json    the PWA manifest template
index.html         the library: docs, demo and element wall in one page
llms.txt           the full usage guide as plain text for AI crawlers
BACKLOG.md         the build list and only planning file: one checkbox per item
```

Projects consume the library by URL, never by copying files in:

```html
<link rel="stylesheet" href="https://[domain]/lib/facet.css">
<script src="https://[domain]/lib/facet.js" defer></script>
```

## Standing rules — every session

- The loop: the owner says "continue" — nothing more. Read BACKLOG.md,
  take the top unchecked item, build it through the full pipeline
  (compliance checklist, wall entry, Features + llms.txt lines, tick the
  box, verify in a real browser, commit, push), then take the next item
  until the turn is done. No re-asking what to work on.
- New work arrives mid-stream in the owner's words. Write it into
  BACKLOG.md immediately — detailed enough to build from that file alone,
  decisions and exclusions included — slot it by the ordering rule, commit
  it, then return to the top of the queue on the next "continue".
- Ordering rule: heavy systems before lighter work. Retokenisations,
  JS subsystems and cross-cutting machinery outrank single components,
  CSS adds and site polish.
- BACKLOG.md is the only planning file. No separate requirements doc, no
  Notion in the loop; the repo is the whole system of record.
- The feature inventory rule: every capability the library ships is listed
  in the Features section on index.html and mirrored in llms.txt. If a
  capability is not listed there, it does not exist. Every new feature adds
  its line to both, in the same commit that builds it — no orphan features,
  nothing built and forgotten.
- Development happens directly on `main`. No feature branches unless
  explicitly requested. All changes go through Git commits; the live files
  are never edited ad hoc.
- Every new component passes the full compliance checklist below before
  commit.
- Whenever a component or rule changes, three places update together with
  the same wording: the file comment in facet.css/facet.js, the wall entry
  on index.html, and llms.txt.

## Core principles

- Readability is the product. Modern frontend is div soup and minified
  garbage, unreadable by humans. This library is the opposite.
- One-glance HTML: any page's structure makes sense on first read. Semantic
  tags, self-explanatory classes.
- The wrapper law: not one extra wrapper. A container inside a container
  exists only to enable a real feature — scroll areas, sticky regions,
  overflow clipping. No other reason is acceptable.
- Least code that stays readable: entire products are assembled by writing
  HTML files with the right classes. Nothing else to touch.
- Pure HTML, CSS and JS. No build step, no framework, never minified. Gzip
  handles size.
- One-step theme change: one attribute on the html tag restyles the whole
  page, layout containers included.
- Everything explained in place: every interactive element carries a
  description tooltip.
- Alive by default: gyroscope parallax and idle animations, with reduced
  motion honoured. (Motion effects land with Layer 3's motion set.)
- Fully commented: every file self-describes with intros, usage notes and
  to-dos, so any AI can build products with it.
- Accessible, SEO-ready and AI-crawlable by default. Enforced through the
  compliance checklist, not optional.

## AI-NATIVE OPERATION

Everything built with Facet is operable by AI agents through the DOM alone.

- Shallow semantic structure, readable in one pass: an agent that reads the
  HTML top to bottom understands the page without executing anything.
- Every action is a real `button` or `a` with an accessible name (text
  content or aria-label). No div-with-onclick, ever.
- Every page and state is reachable by URL: inputs read and write the query
  string, so any state can be linked to, restored, and produced by an agent
  constructing a URL.
- Stable, descriptive IDs on sections and elements; stable, descriptive
  `data-event` names on key actions. Agents and analytics target the same
  hooks.
- llms.txt at the site root is the full plain-text usage guide: an agent
  can learn the entire library from one fetch.

## Markup rules

- Semantic tags over div: header, nav, main, section, article, aside, footer,
  figure.
- An element exists only to hold content, create layout, or carry behavior.
  Anything else is deleted.
- Structural elements contain content or other structural elements. Never
  decorative nesting.
- Buttons are `button`, links are `a`, form fields have real `label` elements.
- One h1 per page. Heading levels never skip.

## Adding a new component: the compliance checklist

- [ ] Semantic tokens only. No raw hex, px sizes outside the scales, or
      hardcoded fonts.
- [ ] Works in every theme and in light and dark with zero extra code.
- [ ] All states covered: hover, focus, active, disabled, and where relevant
      empty, loading, error.
- [ ] Keyboard operable with a visible focus ring. ARIA roles and labels where
      semantics fall short.
- [ ] Interactive elements ship with a description tooltip.
- [ ] Responsive and mobile-usable: 44px touch targets, no hover-only
      interactions.
- [ ] Minimal semantic markup. Every element has a job, per the markup rules.
- [ ] Fully commented in the file: what it is, how to use it, its options,
      open to-dos — usage notes matching the docs text word for word.
- [ ] Names follow the naming rules. Nothing minified.
- [ ] Analytics hook on its key action where relevant: a `data-event`
      attribute.
- [ ] Wall entry added on index.html: live demo of every variant and state,
      variant and state chips, exact snippet with copy button.
- [ ] Docs description added: what it is, what it is for, when to use it.
      Written to read as AI instructions, the same text word for word in the
      file comment, the wall entry and llms.txt.
- [ ] Feature inventory updated: the capability's line added to the
      Features section on index.html and to llms.txt, same commit.
- [ ] BACKLOG.md item ticked.
- [ ] Committed to Git with a clear message.

## Accessibility

- Everything reachable and operable by keyboard. Skip-to-content link on
  every page and template.
- Alt text on all images. ARIA labels on icon-only controls and complex
  components.
- AA contrast in every theme, light and dark. `prefers-reduced-motion`
  honoured: all library motion collapses to nothing.

## SEO and AI readability

- Every page and template ships with title, meta description, OG tags and a
  favicon slot filled in.
- JSON-LD structured data slots in templates: article, product,
  organization.
- All content readable as static HTML. Nothing requires JS to render, so
  crawlers and AI read everything.
- sitemap.xml, robots.txt and clean URLs in the starter. Lazy-loaded
  images, `font-display: swap` when custom fonts ever arrive.

## App-ready and PWA

- The starter is installable: manifest.json plus a full icon set out of the
  box.
- The shared service worker (facet-sw.js): pages and /lib/ files
  network-first with the cache as offline fallback, other assets
  cache-first with background revalidation. Ships updates by redeploying.
- Mobile-first defaults: safe-area insets, touch targets, viewport handled
  in the base.

## Platform laws — paid for on iOS

Hard-won facts from shipped app work; they bind everything built with or
added to the library. The full wording lives in the Rules section on
index.html and in llms.txt — same text in all three places.

- Pager law: full-page snap sections that can outgrow the viewport are
  never built with CSS scroll-snap; the pager model (.snap upgraded by
  facet.js) is the only thing that survives iOS.
- Gesture law: `touch-action: pan-y` on scrollers, `manipulation` on
  fixed chrome, `none` on drag surfaces; `gesturestart` preventDefault
  covers older iOS pinch; never rely on viewport `user-scalable=no`.
- App shell law: standalone PWAs need `viewport-fit=cover` PLUS the
  apple-mobile-web-app metas (capable + black-translucent status bar),
  safe-area env() insets in section padding, and manifest colors that
  match the shipped theme.
- Caching law: HTML and unversioned /lib/ files are never cache-first —
  network first, cache only offline. Cache-first pages hide every deploy
  until a second refresh; that bug shipped once and is now law.
- Parallax exclusion: elements carrying their own transform physics
  (velvet lift/press, the pager's rubber-band) never register with
  facetMotion — two writers on one inline transform collide.
- Font-list law: never put `inherit` inside a font-family list; it
  silently invalidates the whole declaration. Stacks end in a generic
  family.

## Analytics

- No analytics vendor is baked in. People bring their own.
- Components expose `data-event` attributes on key actions, named and
  documented. One documented snippet wires any analytics tool to those
  hooks in a few lines.

## Naming and code quality

- Tokens named by role, not value: `--surface`, not `--gray-100`. This
  extends to spacing and type: name them by intent (card spacing, section
  spacing, heading, body, caption) — never by a bare number a builder has to
  memorise (`--space-2`, `--text-h3` are the old value-named scale, being
  retired). Density and type size are one global three-step control
  (small/medium/large), and both are set BY THE THEME — you never pick a
  theme and its spacing separately. Full spec + naming in BACKLOG.md.
- One class prefix and pattern for components: `.btn`, `.btn-primary`,
  predictable everywhere.
- JS: one small named function per behavior. The name says what it does.
- Never minify. The shipped files are the readable, commented source.

## Rules for building and maintaining

- Docs are demos. A component is not done until the homepage wall shows it
  live with its code.
- One component, one clearly commented section in the CSS file. Nothing is
  scattered.
- Growth by extraction: build a new pattern inside a project first, promote it
  once it repeats.
- App logic, data fetching and state management live in projects, never in
  the library.
- Docs-only styles and scripts stay inline in index.html, clearly marked.
  They never leak into /lib.

## Themes

One attribute on the html tag switches the theme, layout containers
included. Dark mode is its own attribute, `data-mode="dark"`, and composes
with every theme. facet.js also carries both in the URL query (?theme=,
?mode=), wires switcher buttons via `data-theme-switch` and
`data-mode-toggle`, boots a page from data attributes on its own script
tag (`data-theme`, `data-mode`, ...), and exposes `facet.set({...})` for
live configuration changes at runtime.

### Theme · Default (ships first, no attribute)

Paper white, near-black ink, gray hairlines, small radii, whisper shadows.
Zero decoration, the quiet base. The accent ranks are the ink itself.

- Background: `#FFFFFF`
- Surface: `#FAFAFA`
- Text: `#17171B`
- Muted text: `#6E6E76`
- Borders: `#E4E4E8`
- Accent-1 (primary actions): `#17171B`, deepening to `#000000`
- Accent-2 (secondary fill): the surface family, `#FAFAFA` to `#E4E4E8`
- Accent-3 (links, labels, focus): the ink; where the browser exposes
  the OS accent (Safari 16.4+, Firefox 103+ — AccentColor behind an
  @supports gate) it becomes the user's own OS accent instead (R2)

Color is ranked, not named: components use `--accent-1/-2/-3` (each with
`-hover`, `-pressed`, `--on-accent-N`) and never pick raw colors. One
accent-1 action per screen.

### Theme · Sand (`data-theme="sand"`, parked but working)

Modern beige, boring on purpose, quietly elegant. Palette pulled from
Minecraft desert biome blocks, with the inks darkened so every text
role passes AA contrast on the sand. Background `#EDE5C0`, surface
`#F6F0D8`, text `#33291A`, muted `#665A38`, borders `#D9CD9E`.
Accent-1 `#487D31` cactus (deep enough for white labels), accent-2 the
sandstone fill, accent-3 `#3A6824` deep cactus.

### Theme · Velvet (`data-theme="velvet"`)

Neumorphic matte material extracted from the shipped inflation app,
fully ingested (R18 complete). One light source
from straight above; elements are raised faces or carved wells; gold is
the only accent ink (accent-1 and accent-3 gold, accent-2 the raised
gray face family); serif display headings, rounded control voice.
Cushion-press physics are hand-tuned finals and hold in every motion
personality. The --v-* material tokens are kept verbatim from the
reference implementation.

### Theme · Aero (`data-theme="aero"`)

Frutiger Aero era: sky aqua, glass gloss, translucent plastic, pill
buttons. Light: pale sky `#EAF6FD`, white glass surface, deep sea ink
`#0C3049`; accent-1 glossy sky blue `#0B6FB8` (deep enough for white
labels), accent-2 the translucent plastic fill, accent-3 aero grass
green `#0A7D5F`. Dark is ocean glass:
deep water `#062A40`, lifted sky blue, sea-glass green. The `--a-*`
material tokens carry the glass (gloss gradient with the hard 50% line,
translucent border, blue glow on the primary); recipes make buttons and
inputs pills.

### Theme · Elegant (`data-theme="elegant"`)

The old Gems signature: cream surfaces `#F7F2E9`, umber ink `#2B2417`,
gold hairline borders `#D6C08D`, serif display headings (through the
`--font-heading` token alone), carved elevation (the `--e-carve` inset
token presses panels into the cream — never a drop shadow). Accent-1
antique gold `#8C6D1F`, accent-2 the cream fill, accent-3 deep gold.
Dark twin is obsidian and gold: near-black warm ground `#14110B`, lit
gold `#D8B75B`, old-brass hairlines.

All hexes live in `/lib/facet.css` as CSS variables and nowhere else.
Everything downstream uses the semantic tokens.

## Distribution and versioning

- Consume by URL only. No npm package until there is a concrete reason.
- Tag releases in Git: v0.1, v0.2, and so on.
- Freeze on dependency: copy the current files to `/lib/v1/` and leave them
  untouched. Work continues in `/lib/`.
- Old projects point at their frozen folder forever. New projects point at
  `/lib/` and get the latest.
