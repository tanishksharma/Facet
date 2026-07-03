# Facet

Facet is a plain HTML, CSS and JS design library used across everything: apps,
websites, pitch decks, documents and business cards. It is one CSS file and one
JS file hosted at a public URL. Any project pulls it in with one link tag and
one script tag. No React, no build step, no npm install, never minified.

The repo root is the library's website, which doubles as its documentation and
living demo. The library files live in `/lib`. Vercel deploys the repo as a
static site on every push to main, so the docs site and the raw library files
live at the same domain.

```
/lib
  facet.css        the whole design system
  facet.js         small vanilla JS behaviours
/components
  button.html      one page per component: live demo + code
/templates
  deck.html        1920x1080 pitch deck template
  card.html        business card template
  document.html    A4 document template
index.html         library homepage
```

Projects consume the library by URL, never by copying files in:

```html
<link rel="stylesheet" href="https://[domain]/lib/facet.css">
<script src="https://[domain]/lib/facet.js" defer></script>
```

## Core principles

- Readability is the product. Modern frontend is div soup and minified
  garbage, unreadable by humans. This library is the opposite.
- One-glance HTML: any page's structure makes sense on first read. Semantic
  tags, self-explanatory classes.
- Not one extra wrapper. A container inside a container exists only to enable
  a real feature, like scrolling. No other reason is acceptable.
- Least code that stays readable: entire products are assembled by writing
  HTML files with the right classes. Nothing else to touch.
- Pure HTML, CSS and JS. No build step, no framework, never minified. Gzip
  handles size.
- One-step theme change: one attribute on the html tag restyles the whole
  page, layout containers included.
- Everything explained in place: every interactive element carries a
  description tooltip.
- Alive by default: gyroscope parallax and idle animations, with reduced
  motion honoured.
- Fully commented: every file self-describes with intros, usage notes and
  to-dos, so any AI can build products with it.
- Accessible, SEO-ready and AI-crawlable by default. Enforced through the
  compliance checklist below, not optional.

## Markup rules

- Semantic tags over div: header, nav, main, section, article, aside, footer,
  figure.
- The wrapper law: an element exists only to hold content, create layout, or
  carry behavior. Anything else is deleted.
- Container inside a container only to enable a real feature: scroll areas,
  sticky regions, overflow clipping. No other reason is acceptable.
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
      open to-dos.
- [ ] Names follow the naming rules. Nothing minified.
- [ ] Analytics hook on its key action where relevant: a `data-event`
      attribute.
- [ ] Docs page added: live demo of every variant and state, plus the
      copy-paste snippet.
- [ ] Committed to Git with a clear message.

## Naming and code quality

- Tokens named by role, not value: `--surface`, not `--gray-100`.
- One class prefix and pattern for components: `.btn`, `.btn-primary`,
  predictable everywhere.
- JS: one small named function per behavior. The name says what it does.
- Never minify. The shipped files are the readable, commented source.

## Rules for building and maintaining

- Docs are demos. A component is not done until its page shows it live with
  its code.
- One component, one clearly commented section in the CSS file. Nothing is
  scattered.
- All changes go through Git commits. The live files are never edited ad hoc.
- Growth by extraction: build a new pattern inside a project first, promote it
  once it repeats.
- App logic, data fetching and state management live in projects, never in
  the library.

## Themes

`data-theme="sand"` on the html tag is the default theme. Dark mode is a
second attribute: `data-mode="dark"`. Both compose, and layout containers
restyle with the theme, not just the components inside them.

### Theme 1 · Sand

Modern beige, boring on purpose, quietly elegant. Palette pulled from
Minecraft desert biome blocks, with the ink darkened so text passes AA
contrast.

- Background: `#EDE5C0`, sand
- Surface: `#F6F0D8`, smooth sandstone
- Text: `#33291A`, dark earth, AA on background and surface
- Muted text: `#86794F`, dead bush
- Borders: `#D9CD9E`, sandstone shadow
- Accent: `#5F9E44` cactus, hover `#549038`, pressed `#48802F`
- Shape and depth: small radii, whisper-flat shadows, generous spacing

These hexes live in `/lib/facet.css` as CSS variables and nowhere else.
Everything downstream uses the semantic tokens.

## Distribution and versioning

- Consume by URL only. No npm package until there is a concrete reason.
- Tag releases in Git: v0.1, v0.2, and so on.
- Freeze on dependency: copy the current files to `/lib/v1/` and leave them
  untouched. Work continues in `/lib/`.
- Old projects point at their frozen folder forever. New projects point at
  `/lib/` and get the latest.
