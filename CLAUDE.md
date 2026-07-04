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
  deck.html        1920x1080 pitch deck template (future)
  card.html        business card template (future)
  document.html    A4 document template (future)
index.html         the library: docs, demo and element wall in one page
llms.txt           the full usage guide as plain text for AI crawlers
BACKLOG.md         the build list: one checkbox per item
```

Projects consume the library by URL, never by copying files in:

```html
<link rel="stylesheet" href="https://[domain]/lib/facet.css">
<script src="https://[domain]/lib/facet.js" defer></script>
```

## Standing rules — every session

- Read BACKLOG.md first. Work the top unchecked item unless told otherwise.
  Tick items as they land.
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
- If the Notion MCP is available: at session start, fetch the Facet Notion
  page (id `38bb4fa1867c80d2a77cd2f4d318cc15`) and mirror any new
  Requirements lines into BACKLOG.md. At session end, update that page's
  Requirements if something shipped that completes one.
- Never add implementation detail to Notion. It stays a charter.

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
- A simple service worker template: offline shell, cached library files.
  Ships updates by redeploying.
- Mobile-first defaults: safe-area insets, touch targets, viewport handled
  in the base.

## Analytics

- No analytics vendor is baked in. People bring their own.
- Components expose `data-event` attributes on key actions, named and
  documented. One documented snippet wires any analytics tool to those
  hooks in a few lines.

## Naming and code quality

- Tokens named by role, not value: `--surface`, not `--gray-100`.
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
?mode=) and wires switcher buttons via `data-theme-switch` and
`data-mode-toggle`.

### Theme · Default (ships first, no attribute)

Paper white, near-black ink, gray hairlines, small radii, whisper shadows.
Zero decoration, the quiet base. The accent is the ink itself; hover and
pressed deepen to full black.

- Background: `#FFFFFF`
- Surface: `#FAFAFA`
- Text: `#17171B`
- Muted text: `#6E6E76`
- Borders: `#E4E4E8`
- Accent: `#17171B`, the ink. Hover `#09090B`, pressed `#000000`.

### Theme · Sand (`data-theme="sand"`, parked but working)

Modern beige, boring on purpose, quietly elegant. Palette pulled from
Minecraft desert biome blocks, with the ink darkened so text passes AA
contrast. Background `#EDE5C0`, surface `#F6F0D8`, text `#33291A`, muted
`#86794F`, borders `#D9CD9E`, accent `#5F9E44` cactus.

### Themes · Aero and Elegant (stubs)

Aero: Frutiger Aero era — sky aqua, glass gloss, translucent plastic, pill
buttons. Elegant: cream surfaces, gold hairlines, serif display type,
carved elevation; dark twin is obsidian and gold. Both have commented stub
blocks in facet.css; palettes get locked when they are built. Until then
the attributes fall back to Default.

All hexes live in `/lib/facet.css` as CSS variables and nowhere else.
Everything downstream uses the semantic tokens.

## Distribution and versioning

- Consume by URL only. No npm package until there is a concrete reason.
- Tag releases in Git: v0.1, v0.2, and so on.
- Freeze on dependency: copy the current files to `/lib/v1/` and leave them
  untouched. Work continues in `/lib/`.
- Old projects point at their frozen folder forever. New projects point at
  `/lib/` and get the latest.
