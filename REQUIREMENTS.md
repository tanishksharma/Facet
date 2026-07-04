# Facet requirements

The intake list. Each numbered requirement below is a capability the owner
has decided Facet will have. This file is written to be handed to Claude
with one instruction: "read REQUIREMENTS.md and break it into BACKLOG.md
items." When a requirement has been fully broken into backlog checkboxes,
mark it here with `[backlogged]`; when everything it produced has shipped,
mark it `[shipped]`.

Decisions recorded on 4 Jul 2026. Explicit exclusions at the bottom.

## R1 · Token model: base + three accents [backlogged]

Move the color system from a single `--accent` to a ranked accent model:

- `--base` family: background, surface, text, muted text, borders — the
  ground everything sits on.
- `--accent-1`: primary actions. Every primary button, main CTA, key
  action always uses accent-1. Exactly one accent-1 action per screen.
- `--accent-2`: secondary actions. Every secondary button and supporting
  action always uses accent-2.
- `--accent-3`: labels, links, small interactive affordances, basic
  actions — the quiet interactive color.

Every theme defines all three accents (plus hover/pressed shades and
on-accent text colors for each). Components never pick colors; they pick
ranks. Migration: all current components move to the new tokens; the old
`--accent` names are removed, not aliased. The docs Color section, the
Features list and llms.txt update to teach the ranked model.

## R2 · System-native Default theme [backlogged]

The Default (white/black) theme should feel native on Apple platforms
automatically:

- Respect the OS accent/highlight color: interactive elements (links,
  accent-3 affordances, selection, focus ring) pick up the system's accent
  via CSS system colors (`AccentColor`, `AccentColorText`, `Highlight`,
  `SelectedItem`) where supported, with the current ink values as
  fallback. Black text on white ground, blue-by-default labels and icons,
  exactly like iOS/macOS defaults — and if the user changed their system
  accent to purple, Facet follows.
- Investigate `color-scheme`, `system-ui` rendering, and dynamic system
  colors so the Default theme reads as "native app" on iPhone/Mac with
  zero configuration.

## R3 · Reader adaptation (browser/OS-level respect) [backlogged]

- [shipped in part] Text size: the whole interface scales with the
  device/browser text-size setting (everything in rem). Keep this
  guaranteed by rule: no px font sizes, ever.
- `prefers-contrast: more`: stronger borders, fuller text contrast.
- Forced-colors mode (Windows High Contrast): the library remains usable
  and legible with system-imposed colors.
- Density attribute: `data-density="compact"` tightens the spacing scale
  page-wide, same one-attribute mechanic as themes.
- `.visually-hidden` utility for screen-reader-only text.

## R4 · Internationalisation (no RTL) [backlogged]

Build a full translation system for the library's own strings:

- Every default text the library ships (tooltips it generates, words
  helper units, clear-button labels, skip-link text, any built-in copy)
  comes from one strings table, not hardcoded literals.
- One attribute or one JS call sets the language; all library strings
  switch. Projects can extend the table with their own translations.
- Language-aware number words: the lakh/crore words helper becomes
  locale-aware — Indian grouping and lakh/crore for India, million/billion
  grouping and words elsewhere — driven by the detected or declared
  locale.
- Explicitly out of scope: right-to-left layout. No RTL work.

## R5 · Context built into facet.js [backlogged]

facet.js exposes ready-to-use context properties so apps never rewrite
this plumbing:

- `facet.location`: rough general location (country/region/city level),
  resolved from IP-based lookup by default, upgraded via GPS
  (Geolocation API) when the page has permission. Available as a promise
  or cached property; degrades gracefully offline (null, never throws).
  Privacy note to settle at build time: IP lookup needs an external
  endpoint — choose one, document it, and make it overridable/disablable.
- `facet.now`: current date and time, pre-formatted helpers included
  (ISO, local date string, local time string, timezone), always available
  synchronously.
- These feed R4: detected location informs default locale for number
  words and translations, overridable by the page.

## R6 · PWA mechanics inside facet.js [backlogged]

The PWA machinery ships in the library, not in each project:

- One function (or auto-wiring off a data attribute) registers a service
  worker with the standard Facet strategy: offline shell + cached library
  files, updates on redeploy.
- Install-prompt helper: capture beforeinstallprompt, expose a simple
  "offer install" call and a data attribute for install buttons.
- A manifest.json template plus icon-set checklist documented as part of
  the starter; safe-area insets and viewport handled in the base (already
  shipped in part).

## R7 · Safari/iOS web capabilities and child safety [backlogged]

Research task, then implementation of what applies:

- Catalogue what iOS Safari lets websites do and support the relevant
  ones in the base/starter: apple-touch-icon, status-bar styling,
  standalone display, safe areas (done), theme-color meta (light/dark
  variants), Add-to-Home-Screen behaviour, web push where available.
- Child safety: determine what a website can actually do — age-rating
  metadata, Screen Time / parental-control friendliness, content-rating
  headers or meta, SafeSearch-style signals — and add whatever real
  mechanisms exist to the starter as defaults. If a mechanism turns out
  to be OS-only (not controllable by websites), record that finding in
  the docs instead of shipping placebo.

## R8 · Theming suite [backlogged]

- Aero theme: Frutiger Aero — sky aqua, glass gloss, translucent plastic,
  pill buttons. Light and dark.
- Elegant theme: cream and gold, serif display type, carved elevation;
  obsidian-and-gold dark twin.
- Custom accent: overriding the accent tokens (post-R1: accent-1/2/3) in
  one small block is a documented, supported feature.
- Theme generator (Style Mixer): pickers for the semantic colors,
  live-restyling the whole page, exporting a copy-ready theme block,
  shareable via URL.
- Skin Lab: every theme in light and dark side by side across real
  layouts, for consistency checks.

## R9 · AI-native and developer experience [backlogged]

- `facet.json`: machine-readable manifest of every class, data attribute,
  token and component — the API surface as data, kept in sync by the same
  three-places rule that governs docs text.
- Per-component "copy as Markdown for LLM" button on the wall.
- Analytics bridge: the documented five-line snippet that wires any
  vendor to the `data-event` hooks.
- Playground: one editable HTML box on the site rendering live through
  the library.
- Cheatsheet: every class in the library on one dense, searchable screen.
- Live size badge on the site: "X KB gzipped, zero dependencies,"
  computed, not hand-written.

## R10 · Site polish (from the docs research) [backlogged]

Click-to-copy tokens; "/" and Cmd+K keyboard search; heading permalink
anchors; class-reference table per component; keyboard-interaction table
per interactive component; Do/Don't pairs; per-component accessibility
notes; live AA/AAA contrast badges that re-check on theme switch;
component status badges (alpha/beta/stable); viewport-width toggles on
demos; Open-in-CodePen buttons; edit-on-GitHub links per section.

## R11 · Component roadmap (existing backlog, reaffirmed) [backlogged]

Row and grid primitives; switch, checkbox, radio; segmented control,
stepper; card; modal, drawer, popover; accordion, toast, dropdown; tabs,
breadcrumb, pagination; badge, chip, avatar, progress; skeleton, spinner,
empty state; flagship link; icon set; the motion pack — pointer parallax,
scroll inertia, gyroscope upgrade, idle animations, all off under
reduced motion. Then Layer 4 blocks and Layer 5 templates (deck, A4,
business card, landing, app shell, article, SEO starter, PWA starter),
and versioning (/lib/v1/ freeze, changelog, version switcher).

## R12 · Versioning, caching and the update flow [backlogged]

- Until v1: projects always get the latest library straight from the web.
  No cache pinning, no versions — a push to main updates every consumer.
  This policy is stated on the site and in llms.txt.
- From v1 onwards: versioning plus caching. The service worker serves the
  cached library files instantly (app works offline and loads fast), and
  when the device is online it revalidates against the server. If the
  server has a newer version, it is downloaded and cached in the
  background, and a flag is set so the new files take over on the next
  refresh or the next page navigation — never mid-page.
- Frozen copies under /lib/v1/ pin old projects forever; a changelog and
  a version switcher on the site arrive with the first freeze.

## R13 · Seamless page transitions [backlogged]

Moving between pages of a Facet product must not look like one page died
and another loaded in a flash. The old page transitions away and the new
one transitions in, while the URL changes normally.

- Opt-in feature: enable transition animations site-wide with one
  attribute or one call; links can opt in/out individually.
- Built on the View Transitions API for multi-page navigation where
  supported, degrading to instant navigation elsewhere — never broken
  navigation, and the URL always changes for real.
- Collapses to nothing under prefers-reduced-motion, like all motion.

## R14 · Setup and configuration system [backlogged]

Using Facet in a project starts with a setup step, not with reading CSS:

- On the library site: assemble your customized version of the theme —
  colors, mode, density, language — and copy it out as key-value pairs.
- In the project: load the library and hand it those key-value pairs (or
  just a theme name and version) at the script tag / a small config
  object. The page boots directly into that configuration.
- Changes apply in real time: setting theme, dark/light mode or accent
  colors through the config API restyles the page live, no reload.
- Custom scripts keep working: the config API is plain JS, documented,
  and everything it can do is also doable by setting the attributes and
  tokens directly.

## R15 · Background patterns [backlogged]

A set of subtle page and section backgrounds, applied with one class:

- The signature one: a very light, faint grid that simulates a technical
  drawing — thin grid lines with small plus marks at the intersections,
  the kind of ground you could draft on. Whisper-faint: content always
  wins, the pattern never competes.
- More light repeating patterns in the same spirit: dot grid, ruled
  lines, graph paper with minor/major lines — a small curated set, not a
  pattern zoo.
- Token-driven like everything else: patterns read the border/muted
  tokens so they recolor with every theme and both modes automatically,
  and they respect prefers-contrast (fade further or drop out rather
  than fight readability).
- One class on any section or page (e.g. bg-grid, bg-dots); combinable
  with containers and snap sections; zero images to load — CSS
  gradients/masks only, keeping the no-asset, no-build promise.

## Exclusions — decided, do not build

- Right-to-left layout support. Translation yes (R4), RTL no.

## Process

Requirements land here (owner writes them or dictates them to Claude).
Claude breaks each into BACKLOG.md checkboxes sized one commit each,
marks the requirement `[backlogged]`, and works the backlog top-down.
Every shipped capability still obeys the feature-inventory rule: its line
appears in the Features section on index.html and in llms.txt in the same
commit, so nothing is ever built and forgotten.
