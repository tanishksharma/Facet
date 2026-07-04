# Facet backlog

The build list — the only planning file. One checkbox per item, each
sized to land in one commit, written with enough detail to build from
this file alone. The owner adds work by saying it; Claude writes it in
here immediately, then works the queue top-down on every "continue".
Shipped work is recorded at the bottom.

Ordering rule: heavy systems first, lighter work after. The accent-rank
retokenisation leads because every component sits on it; then the
configuration spine, the JS context/i18n/offline systems, navigation
transitions and the native-theme work; the theming suite and machine
manifest; and only then the lighter CSS adds, site polish and the long
component/blocks/templates road.

Standing exclusion: no right-to-left layout support. Translation yes,
RTL no — decided 4 Jul 2026.

## Queue · heavy systems first

### Accent ranks — R1

- [x] Retokenise color: keep the base family (--background, --surface,
      --text, --text-muted, --border), replace --accent/--accent-hover/
      --accent-pressed/--on-accent with --accent-1/-2/-3, each with
      -hover, -pressed and --on-accent-N, defined for Default light/dark
      and Sand light/dark. Old names removed, not aliased.
- [x] Migrate every component to ranks: btn-primary → accent-1,
      btn-secondary and ghost hover → accent-2, links, slider thumb,
      selection, focus ring, number-words, chips → accent-3. One primary
      per screen stays the rule.
- [x] Docs update for ranks: Color section teaches base + three accents
      with live swatches per rank; Features line, llms.txt, CLAUDE.md
      theme sections all reworded in the same commit.

### Setup and configuration — R14 (load-time core; generator lands with R8)

- [x] Load-time config: facet.js reads data-theme / data-mode / density /
      language off its own script tag or a facet-config JSON block, and
      boots the page into that configuration before first paint.
- [x] Runtime setters: facet.set({theme, mode, density, accent…}) applies
      key-value pairs live — theme, dark/light, accent overrides restyle
      in real time, no reload. Attributes stay the source of truth so
      custom scripts keep working.
- [x] Document the setup step on the site: a "Set up your project"
      strip — pick theme and mode, copy the configured script tags.

### Context in facet.js — R5

- [x] facet.now: date, time, timezone and pre-formatted helpers,
      available synchronously.
- [x] facet.location: country/region/city from IP lookup (endpoint
      documented, overridable, disablable), upgraded via Geolocation
      when permitted; promise + cached property; null on failure, never
      throws.

### Internationalisation — R4 (no RTL, by decision)

- [x] Strings table: every built-in string the library ships moves into
      one table in facet.js; no hardcoded literals remain.
- [x] Language switch: one attribute or facet.set({language}) switches
      all library strings; projects can extend the table with their own
      languages.
- [x] Locale-aware numbers: grouping and words helper follow the locale —
      lakh/crore for India, million/billion elsewhere — defaulting from
      facet.location, overridable by the page.

### Offline, updates and PWA — R6 + R12

- [x] State the pre-v1 policy: "always the latest from the web until v1"
      on the site and in llms.txt.
- [x] Service worker template: cached library files + offline shell,
      served instantly from cache, revalidated against the server when
      online; newer versions download in the background and a flag makes
      them take over on the next refresh or navigation, never mid-page.
- [x] Registration and install helpers in facet.js: one call (or data
      attribute) registers the worker; beforeinstallprompt captured and
      exposed as a simple install-button wiring.
- [x] manifest.json template plus icon-set checklist in the starter.

### Motion personality — R17

How the library moves, not just how it looks. Everything downstream —
page transitions (R13), the parallax/idle motion pack (R11) — inherits
these tokens.

- [x] Personality tokens: two complete motion sets selectable with one
      attribute or config key. Lively, the default: momentum, inertia
      and playful bounce — spring-like overshoot easings (CSS linear()
      spring curves with cubic-bezier fallback), weight in every press,
      settle in every arrival. Calm: short, near-linear, slight — for
      products that should whisper. prefers-reduced-motion stays the
      third level above both: everything collapses to nothing.
- [x] Apply the personality everywhere: every existing transition moves
      to the personality tokens — buttons press with weight and spring
      back, chips and toggles bounce as they flip, tooltips and reveals
      arrive with a settle, slider thumbs carry momentum. No component
      ever hardcodes an easing or duration again; the tokens are the
      only source.
- [x] Wall entry for motion: Lively / Calm / Off chips that flip the
      whole page live so the difference is felt, not described — plus
      the Features and llms.txt lines.

### Seamless page transitions — R13

- [x] Cross-page transitions: @view-transition navigation rules so
      moving between pages of a Facet product animates old-page-out /
      new-page-in while the URL changes; instant fallback where
      unsupported; off under prefers-reduced-motion.
- [x] Opt-in controls: one attribute enables transitions site-wide,
      per-link opt-out, and a facet.js helper for programmatic
      navigation with the same transition.

### System-native Default theme — R2

- [ ] Support matrix first: test AccentColor, AccentColorText, Highlight,
      SelectedItem system colors across Safari/Chrome/Firefox, macOS and
      iOS; record findings as comments in the theme block.
- [ ] Wire the Default theme to the OS accent where supported (links,
      accent-3 affordances, selection, focus ring) behind @supports, ink
      fallback everywhere else; verify light and dark.

### Theming suite — R8

- [ ] Custom accent recipe: overriding accent-1/2/3 in one small block,
      documented as a supported feature with a live example.
- [ ] Aero theme, light and dark: sky aqua, glass gloss, translucent
      plastic, pill buttons; palette locked in the theme block.
- [ ] Elegant theme, light and dark: cream and gold, serif display,
      carved elevation; obsidian-and-gold dark twin.
- [ ] Theme generator (Style Mixer): pickers for the semantic colors,
      live restyle of the whole page, export as the R14 key-value config
      block, shareable via URL.
- [ ] Skin Lab: every theme in light and dark side by side across real
      layouts.

### Themed map — R16

- [ ] Map styling engine: a Google Maps style generated from the active
      theme's tokens — ground/water/parks from the base family, roads
      and labels from text/muted/border, highlights from the accent
      ranks — so every theme (and every future theme) gets its map for
      free, light and dark. Styles derive from tokens; never hand-tuned
      per theme.
- [ ] Map component: a div carrying data-map (the wrapper law allows it:
      it carries behavior) that facet.js wires up — loads the Maps JS
      API with the project's own key (bring-your-own-key, like the
      analytics rule; the library never ships a key), applies the
      current theme's style, and restyles live when theme or mode
      switches. Graceful themed placeholder when there is no key or no
      network.
- [ ] Map on the library page: wall entry with the live map in the
      active theme, chips for mode, snippet with copy. Decide the docs
      key at build time: a referrer-restricted key owned by the site,
      or the placeholder if quota/cost says no — never a broken embed.

- [ ] facet.json: machine-readable manifest of every class, data
      attribute, token and component, kept in sync by the three-places
      rule.
- [ ] "Copy as Markdown for LLM" button per wall entry.
- [ ] Analytics bridge: the documented five-line snippet wiring any
      vendor to the data-event hooks.
- [ ] Playground: one editable HTML box rendering live through the
      library.
- [ ] Cheatsheet: every class on one dense, searchable screen.
- [ ] Live size badge: "X KB gzipped, zero dependencies," computed.

### Reader adaptation — R3

- [ ] prefers-contrast: more — stronger borders and text tokens in every
      theme.
- [ ] Forced-colors mode: audit and fix the library under
      forced-colors: active (Windows High Contrast).
- [ ] data-density="compact": one attribute tightens the spacing scale
      page-wide, same mechanic as themes.
- [ ] .visually-hidden utility class for screen-reader-only text.
- [ ] Text roles: one class per role, display down to caption, so the
      scale is usable without inline styles (carried from Layer 1).

### Backgrounds — R15

- [ ] Technical-drawing grid background: faint grid lines with plus
      marks at the intersections, one class (bg-grid) on any section or
      page, drawn with CSS gradients only, colored by tokens so it works
      in every theme, light and dark
- [ ] Pattern set: dot grid, ruled lines, graph paper with minor/major
      lines — same one-class mechanic, whisper-faint, fades out under
      prefers-contrast
- [ ] Backgrounds wall entry with pattern chips, plus the Features and
      llms.txt lines

### Safari/iOS capabilities and child safety — R7

- [ ] Research pass: catalogue what iOS Safari lets websites do
      (theme-color light/dark, apple-touch-icon, standalone display,
      status bar, web push, Screen Time interaction) and what child
      safety mechanisms actually exist for websites; findings written up
      in the repo.
- [ ] Implement the applicable head-pack defaults in the base/starter;
      document honestly what is OS-only and out of a website's hands.

### Site polish — R10

- [ ] Click-to-copy tokens: every swatch and token name copies its
      var(--name) on click.
- [ ] Keyboard-first search: "/" or Cmd+K focuses the wall search, arrow
      keys move through results.
- [ ] Heading permalink anchors: hover a heading, copy the deep link.
- [ ] Class reference table per component: every class, modifier and
      data attribute with a one-liner.
- [ ] Keyboard interaction table on interactive components.
- [ ] Do/Don't pairs per component with a one-sentence reason.
- [ ] Accessibility notes per component: ARIA behavior, contrast, screen
      reader expectations.
- [ ] Live AA/AAA contrast badges on color pairs, re-checked on theme
      switch.
- [ ] Component status badges: alpha / beta / stable per wall entry.
- [ ] Viewport-width toggles on demos: phone / tablet / desktop.
- [ ] Open in CodePen: posts the snippet plus the two tags to
      codepen.io/pen/define.
- [ ] Edit-on-GitHub link per component section.

### Components — R11

- [ ] Row: horizontal flow with wrap and themed gaps
- [ ] Grid: responsive columns with themed gaps
- [ ] Switch, checkbox, radio
- [ ] Stepper, segmented control
- [ ] Input, textarea, select, search field as wired field components
- [ ] File upload, date input
- [ ] Card: default, outlined, clickable
- [ ] Modal, drawer, popover
- [ ] Accordion, toast, dropdown menu
- [ ] Tabs, breadcrumb, pagination
- [ ] Nav link states: default, hover, active
- [ ] Table component: header, zebra rows, row hover
- [ ] Badge, chip, avatar, progress bar
- [ ] Skeleton, spinner, empty state block
- [ ] Flagship link: the signature style for linking to another page
- [ ] Icon set: thin 1.5px line glyphs, around 40 to start
- [ ] Motion: desktop parallax driven by pointer position
- [ ] Motion: mobile parallax driven by scroll — velocity, weight,
      inertia
- [ ] Motion: gyroscope upgrade where permission is granted
- [ ] Motion: idle animations on key elements at rest

### Blocks — R11

- [ ] Grid of cards with responsive columns
- [ ] Horizontal scrolling card row
- [ ] Filterable card list: search and filter bar on top, cards below
- [ ] List cards: stacked full-width rows
- [ ] Product grid: image, title, price, action
- [ ] Product detail block: gallery plus info panel
- [ ] Cart line items with totals
- [ ] Full top menu: logo, links, actions, mobile collapse
- [ ] Sidebar navigation with sections
- [ ] Footer: link columns plus legal row
- [ ] Hero: headline, subtext, CTA
- [ ] Feature grid, pricing table, FAQ list, CTA band
- [ ] Logo row, testimonial block
- [ ] Data table with toolbar: search, filters, actions
- [ ] Stat row: KPI cards
- [ ] Settings section: labelled rows with controls
- [ ] Form section: grouped fields with a submit row
- [ ] Article header: title, byline, meta
- [ ] Prose block: styled long-form text
- [ ] Media figure with caption, pull quote

### Templates and versioning — R11 + R12

- [ ] Landing page assembled from marketing blocks
- [ ] App shell: sidebar plus top bar frame with one dashboard screen
- [ ] Pitch deck: 1920x1080 slide class, full-screen presenting,
      arrow-key navigation
- [ ] Pitch deck: slide layouts — title, content, two-column, chart,
      closing
- [ ] Pitch deck: print-to-PDF export at exact 1080p
- [ ] A4 document: page class with print margins
- [ ] A4 document: letterhead, invoice table, one-pager layout
- [ ] Business card: 3.5x2 inch card class, front and back
- [ ] Business card: print-sheet export at print resolution
- [ ] Article page: header, prose, footer
- [ ] SEO starter: head pack — title, meta description, OG tags, favicon
- [ ] SEO starter: JSON-LD slots — article, product, organization
- [ ] SEO starter: sitemap.xml and robots.txt
- [ ] PWA starter: manifest plus icon set, installable out of the box
      (mechanics land earlier under R6)
- [ ] v1 freeze: copy /lib/ to /lib/v1/, tag the release, start the
      changelog, add the version switcher to the site

## Shipped

### Tokens and themes
- [x] Core palette, accent + hover/pressed, status colors, dark values
      for every token
- [x] One-attribute theme switch (Default, Sand; aero and elegant
      stubbed); layout containers restyle with the theme
- [x] Subtree theming: data-theme / data-mode work on any element
- [x] Font stacks, type scale, weights and line heights
- [x] 4px spacing scale, container widths, radii, border widths, shadow
      scale, motion durations and easings, reduced-motion handling

### Base styles
- [x] Reset (box sizing, margins, media defaults, [hidden] wins)
- [x] Text, forms, media, tables — every raw tag styled
- [x] Focus rings, selection, scrollbars, skip link, print base

### Components
- [x] Container (four widths) · Stack (three gaps) · Snap section
- [x] Button (three variants, three sizes) · Icon button
- [x] Number input: prefilled example, one-tap clear, Indian grouping,
      words helper · Labelled field with hint and error state
- [x] Slider with live readout · Result block (three variants)
- [x] Description tooltip: data-tip on anything, data-tip-below variant

### The library site
- [x] Header: wordmark, live theme switcher with URL state, dark toggle,
      GitHub link
- [x] Get-started strip with self-filling domain and one copy button
- [x] Features section: the complete capability inventory, mirrored in
      llms.txt, no-orphan-features rule in CLAUDE.md
- [x] Rules on the page, near the top, same text as CLAUDE.md and
      llms.txt
- [x] Typography as a real article · Color as light/dark side by side ·
      Spacing through real components · Shape/elevation/motion section
- [x] Element wall: every component live with description-as-AI-
      instructions, variant/state chips, DOM-serialized snippets with
      copy buttons
- [x] Sidebar index with search filtering, scrollspy highlighting,
      dividers between sections
- [x] llms.txt: the full plain-text manual for AI crawlers
